#!/usr/bin/env python3
"""
Batch Repo Sync Tool
Syncs files from a template repo to multiple target repos via PRs.
"""

import json
import os
import shutil
import sys
import time
import stat
from pathlib import Path

from git import Repo
from github import Auth, Github, GithubException

# Load config
CONFIG_PATH = Path(__file__).parent / "config.json"
with open(CONFIG_PATH) as f:
    config = json.load(f)

WORK_DIR = Path(__file__).parent / "temp"
DRY_RUN = "--dry-run" in sys.argv

# Colors for console output
class Colors:
    RESET = "\033[0m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    RED = "\033[31m"
    CYAN = "\033[36m"
    DIM = "\033[2m"


def log(message: str, color: str = "RESET"):
    print(f"{getattr(Colors, color)}{message}{Colors.RESET}")


def log_step(step: str, message: str):
    print(f"{Colors.CYAN}[{step}]{Colors.RESET} {message}")


def get_github_token() -> str:
    """Get GitHub token from environment or gh CLI."""
    import subprocess
    
    # Try environment variable first
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        return token
    
    # Try gh CLI (works with credential manager on Windows)
    try:
        result = subprocess.run(
            ["gh", "auth", "token"],
            capture_output=True,
            text=True,
            check=True
        )
        token = result.stdout.strip()
        if token:
            return token
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    raise ValueError(
        "GitHub token not found. Set GITHUB_TOKEN environment variable "
        "or run 'gh auth login' first."
    )


def clone_repo(owner: str, name: str, target_dir: Path, branch: str = None) -> Repo:
    """Clone a repository to target directory."""
    url = f"https://github.com/{owner}/{name}.git"
    
    # More robust cleanup - retry a few times if needed
    if target_dir.exists():
        for attempt in range(3):
            try:
                time.sleep(0.5 * (attempt + 1))
                shutil.rmtree(target_dir)
                break
            except (PermissionError, OSError):
                if attempt == 2:
                    # Last attempt - try with ignore_errors
                    shutil.rmtree(target_dir, ignore_errors=True)
    
    # Ensure directory is actually gone
    if target_dir.exists():
        raise RuntimeError(f"Could not remove existing directory: {target_dir}")
    
    # Clone specific branch if provided, otherwise default branch
    if branch:
        return Repo.clone_from(url, target_dir, branch=branch, depth=1)
    return Repo.clone_from(url, target_dir, depth=1)


def sync_files(template_dir: Path, target_dir: Path, files: list[str]) -> list[str]:
    """Copy files from template to target directory."""
    copied_files = []
    
    for file in files:
        source_path = template_dir / file
        dest_path = target_dir / file
        
        if not source_path.exists():
            log(f"  Warning: {file} not found in template repo", "YELLOW")
            continue
        
        # Ensure destination directory exists
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Copy file
        shutil.copy2(source_path, dest_path)
        copied_files.append(file)
        log(f"  Copied: {file}", "DIM")
    
    return copied_files


def create_pull_request(
    gh: Github,
    owner: str,
    name: str,
    branch: str,
    base_branch: str | None,
    files: list[str]
) -> str | None:
    """Create a pull request using GitHub API."""
    repo = gh.get_repo(f"{owner}/{name}")
    
    title = config["prSettings"]["title"]
    files_list = "\n".join(f"- `{f}`" for f in files)
    
    # Build PR body - handles both escaped newlines from JSON and literal newlines
    body_template = config["prSettings"]["body"]
    # Ensure \n sequences become actual newlines
    body_template = body_template.replace("\\n", "\n")
    body = body_template.replace("{{FILES}}", files_list)
    
    # Use specified base branch or repo default
    base = base_branch or repo.default_branch
    
    try:
        pr = repo.create_pull(
            title=title,
            body=body,
            head=branch,
            base=base
        )
        
        # Add assignees if configured
        assignees = config["prSettings"].get("assignees", [])
        if assignees:
            try:
                pr.add_to_assignees(*assignees)
                log(f"  Assigned to: {', '.join(assignees)}", "DIM")
            except GithubException as e:
                log(f"  Warning: Could not add assignees: {e}", "YELLOW")
        
        # Request reviewers if configured
        reviewers = config["prSettings"].get("reviewers", [])
        if reviewers:
            try:
                pr.create_review_request(reviewers=reviewers)
                log(f"  Reviewers requested: {', '.join(reviewers)}", "DIM")
            except GithubException as e:
                log(f"  Warning: Could not request reviewers: {e}", "YELLOW")
        
        return pr.html_url
    except GithubException as e:
        if "A pull request already exists" in str(e):
            log(f"  PR already exists for branch {branch}", "YELLOW")
            return None
        raise


def process_target_repo(
    gh: Github,
    template_dir: Path,
    target_repo: dict
) -> dict | None:
    """Process a single target repository."""
    owner = target_repo["owner"]
    name = target_repo["name"]
    target_dir = WORK_DIR / name
    branch_name = f"{config['prSettings']['branchPrefix']}-{int(time.time() * 1000)}"
    base_branch = config.get("baseBranch")
    
    log_step("CLONE", f"{owner}/{name}" + (f" ({base_branch})" if base_branch else ""))
    repo = clone_repo(owner, name, target_dir, branch=base_branch)
    
    log_step("BRANCH", f"Creating {branch_name}" + (f" from {base_branch}" if base_branch else ""))
    repo.git.checkout("-b", branch_name)
    
    log_step("SYNC", f"Copying {len(config['filesToSync'])} file(s)")
    copied_files = sync_files(template_dir, target_dir, config["filesToSync"])
    
    if not copied_files:
        log(f"  No files to sync for {name}, skipping...", "YELLOW")
        return None
    
    # Check if there are any changes
    if not repo.is_dirty() and not repo.untracked_files:
        log(f"  No changes detected in {name}, skipping...", "YELLOW")
        return None
    
    log_step("COMMIT", f"{len(copied_files)} file(s) changed")
    
    if DRY_RUN:
        target = base_branch or "default branch"
        log(f"  [DRY RUN] Would commit and create PR targeting {target}", "YELLOW")
        return {"repo": f"{owner}/{name}", "files": copied_files, "dry_run": True}
    
    repo.git.add(".")
    repo.git.commit("-m", f"Sync files from template: {', '.join(copied_files)}")
    
    log_step("PUSH", f"Pushing to origin/{branch_name}")
    
    # Push with token authentication
    token = get_github_token()
    push_url = f"https://{token}@github.com/{owner}/{name}.git"
    repo.git.push(push_url, branch_name)
    
    target = base_branch or "default branch"
    log_step("PR", f"Creating pull request targeting {target}")
    pr_url = create_pull_request(gh, owner, name, branch_name, base_branch, copied_files)
    
    return {"repo": f"{owner}/{name}", "pr_url": pr_url, "files": copied_files}


def main():
    print("\n" + "=" * 60)
    log("  BATCH REPO SYNC TOOL", "CYAN")
    print("=" * 60 + "\n")
    
    if DRY_RUN:
        log("Running in DRY RUN mode - no changes will be pushed\n", "YELLOW")
    
    # Get GitHub token and create client
    try:
        token = get_github_token()
        gh = Github(auth=Auth.Token(token))
        # Verify authentication
        gh.get_user().login
    except Exception as e:
        log(f"Error: GitHub authentication failed: {e}", "RED")
        log("Please set GITHUB_TOKEN environment variable or run 'gh auth login'", "YELLOW")
        sys.exit(1)
    
    # Create work directory
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    
    # Template info
    template_owner = config["templateRepo"]["owner"]
    template_name = config["templateRepo"]["name"]
    template_branch = config["templateRepo"]["branch"]
    template_dir = WORK_DIR / template_name
    
    log(f"Template: {template_owner}/{template_name} ({template_branch})", "CYAN")
    log(f"Files to sync: {', '.join(config['filesToSync'])}", "CYAN")
    log(f"Target repos: {len(config['targetRepos'])}", "CYAN")
    log(f"PRs will target: {config.get('baseBranch') or 'default branch'}", "CYAN")
    
    assignees = config["prSettings"].get("assignees", [])
    reviewers = config["prSettings"].get("reviewers", [])
    log(f"Assignees: {', '.join(assignees) if assignees else 'None'}", "CYAN")
    log(f"Reviewers: {', '.join(reviewers) if reviewers else 'None'}\n", "CYAN")
    
    log_step("TEMPLATE", f"Cloning {template_owner}/{template_name} ({template_branch})")
    template_repo = clone_repo(template_owner, template_name, template_dir, branch=template_branch)
    
    print("\n" + "-" * 60 + "\n")
    
    # Process each target repo
    results = []
    
    for target_repo in config["targetRepos"]:
        try:
            result = process_target_repo(gh, template_dir, target_repo)
            if result:
                results.append(result)
            print()
        except Exception as e:
            log(f"Error processing {target_repo['owner']}/{target_repo['name']}: {e}", "RED")
            results.append({
                "repo": f"{target_repo['owner']}/{target_repo['name']}",
                "error": str(e)
            })
    
    # Summary
    print("\n" + "=" * 60)
    log("  SUMMARY", "CYAN")
    print("=" * 60 + "\n")
    
    successful = [r for r in results if r.get("pr_url")]
    skipped = [r for r in results if r.get("dry_run") or (not r.get("pr_url") and not r.get("error"))]
    failed = [r for r in results if r.get("error")]
    
    if successful:
        log("Created PRs:", "GREEN")
        for r in successful:
            log(f"  {r['repo']}: {r['pr_url']}", "GREEN")
    
    if skipped:
        log("\nSkipped (no changes or dry run):", "YELLOW")
        for r in skipped:
            log(f"  {r['repo']}", "YELLOW")
    
    if failed:
        log("\nFailed:", "RED")
        for r in failed:
            log(f"  {r['repo']}: {r['error']}", "RED")
    
    # Cleanup: robust removal for WORK_DIR (handles Windows permission issues)
    log("\nCleaning up temporary files...", "DIM")
    try:
        time.sleep(1)  # Let git processes release file handles

        def _on_rm_error(func, path, exc_info):
            try:
                os.chmod(path, stat.S_IWRITE)
            except Exception:
                pass
            try:
                func(path)
            except Exception:
                pass

        # Try a few times to remove the directory
        removed = False
        for attempt in range(3):
            try:
                if WORK_DIR.exists():
                    shutil.rmtree(WORK_DIR, onerror=_on_rm_error)
                removed = not WORK_DIR.exists()
                if removed:
                    break
            except Exception:
                time.sleep(0.5)

        # Final fallback: try removing files individually then the directory
        if WORK_DIR.exists():
            for root, dirs, files in os.walk(WORK_DIR, topdown=False):
                for name in files:
                    fp = os.path.join(root, name)
                    try:
                        os.chmod(fp, stat.S_IWRITE)
                        os.remove(fp)
                    except Exception:
                        pass
                for name in dirs:
                    dp = os.path.join(root, name)
                    try:
                        os.rmdir(dp)
                    except Exception:
                        pass
            try:
                os.rmdir(WORK_DIR)
                removed = not WORK_DIR.exists()
            except Exception:
                removed = False

        if not removed:
            log(f"  Warning: Could not fully clean up temp folder: {WORK_DIR}", "YELLOW")
            log(f"  You can manually delete: {WORK_DIR}", "YELLOW")
    except Exception as e:
        log(f"  Warning: Could not fully clean up temp folder: {e}", "YELLOW")
        log(f"  You can manually delete: {WORK_DIR}", "YELLOW")
    
    log("\nDone!", "GREEN")


if __name__ == "__main__":
    main()
