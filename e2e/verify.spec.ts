import { test, expect } from '@playwright/test';

test('no initialization errors on load', async ({ page }) => {
  let hasError = false;
  page.on('pageerror', exception => {
    console.error('Uncaught exception:', exception);
    hasError = true;
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('Cannot access')) {
      console.error('Console error:', msg.text());
      hasError = true;
    }
  });

  await page.goto('/', { waitUntil: 'networkidle' });
  
  // A white-screen crash will leave the root div empty.
  // Wait for React to mount elements inside #root.
  const rootElement = page.locator('#root');
  await expect(rootElement).not.toBeEmpty({ timeout: 10000 });
  
  expect(hasError).toBe(false);
});
