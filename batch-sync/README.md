# Batch Repo Sync Tool

Sync files from this template repository to all derived project repositories, creating PRs for review.

## Prerequisites

1. **Python 3.11+**
2. **Git** installed and in PATH
3. **GitHub authentication** (one of):
   - `GITHUB_TOKEN` environment variable
   - `gh auth login` (will read token from gh CLI config)

## Setup

1. Create and activate a conda environment:
   ```bash
   conda create -n batch-repo-sync python=3.11 -y
   conda activate batch-repo-sync
   ``` 


   

2. Install dependencies:
   ```bash
   cd batch-sync
   pip install -r requirements.txt
   ```

3. Set up authentication (choose one):
   ```bash
   # Option 1: Environment variable
   set GITHUB_TOKEN=ghp_your_token_here   # Windows cmd
   $env:GITHUB_TOKEN="ghp_your_token_here" # PowerShell
   export GITHUB_TOKEN=ghp_your_token_here # bash
   
   # Option 2: Use existing gh CLI auth (if you ran 'gh auth login')
   # The script will automatically read the token
   ```

4. Edit `config.json` with your repos and files

## Usage

### Dry Run (recommended first)

```bash
python sync_repos.py --dry-run
```

### Full Sync

```bash
python sync_repos.py
```

### Adding new files or folders

If a path in `filesToSync` exists in the template but not in a target repo, it will be created in that target (parent folders included) and included in the PR. If a path in `filesToSync` is missing from the template, it is skipped with a warning.

## Configuration

Edit `config.json`:

```json
{
  "templateRepo": {
    "owner": "Transport-for-the-North",
    "name": "vis-core_template",
    "branch": "main"
  },
  "targetRepos": [
    { "owner": "Transport-for-the-North", "name": "repo-visualisation-framework" },
    { "owner": "Transport-for-the-North", "name": "repo-visualisation-framework" }
  ],
  "baseBranch": "dev",
  "filesToSync": [
    "vite.config.js",
    "src/main.jsx"
  ],
  "prSettings": {
    "branchPrefix": "sync/template-update",
    "title": "Sync files from template repo",
    "body": "This PR syncs the following files...\n\n{{FILES}}",
    "assignees": ["username1"],
    "reviewers": ["username2", "username3"]
  }
}
```

### Config Options

| Field | Description |
|-------|-------------|
| `templateRepo.owner` | GitHub username or org for template repo |
| `templateRepo.name` | Template repository name |
| `templateRepo.branch` | Branch to sync from (default: main) |
| `targetRepos` | Array of `{owner, name}` objects |
| `baseBranch` | Target branch for PRs (e.g., "dev", "main") |
| `filesToSync` | Array of file paths to copy (relative to repo root) |
| `prSettings.branchPrefix` | Prefix for created branches |
| `prSettings.title` | PR title |
| `prSettings.body` | PR body (`{{FILES}}` is replaced with file list) |
| `prSettings.assignees` | Array of GitHub usernames to assign to PRs |
| `prSettings.reviewers` | Array of GitHub usernames to request reviews from |

## Creating a GitHub Token

If not using `gh auth login`:

1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token and set as `GITHUB_TOKEN`
