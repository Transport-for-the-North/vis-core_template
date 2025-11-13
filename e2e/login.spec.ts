import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

test('login and go to home page & check for main heading', async ({page}) => {

    dotenv.config({ path: '.env.local' });

    await page.goto('/login');

    await page.fill('#username', process.env.E2E_USERNAME ?? '');
    await page.fill('#password', process.env.E2E_PASSWORD ?? '');

    await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForURL('/', { timeout: 45000 })
    ]);

    // await page.goto('/');

    // const currentURL = page.url();

    await page.waitForSelector('h1');

    await expect(page.locator('h1')).toHaveCount(1);
});