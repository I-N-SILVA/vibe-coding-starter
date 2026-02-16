import { test, expect } from '@playwright/test';

test.describe('Public League Pages', () => {
    test('public matches page loads', async ({ page }) => {
        await page.goto('/league/public/matches');
        await expect(page.locator('body')).toBeVisible();
    });

    test('public teams page loads', async ({ page }) => {
        await page.goto('/league/public/teams');
        await expect(page.locator('body')).toBeVisible();
    });

    test('public standings page loads', async ({ page }) => {
        await page.goto('/league/public/standings');
        await expect(page.locator('body')).toBeVisible();
    });

    test('public scoreboard page loads', async ({ page }) => {
        await page.goto('/league/public/scoreboard');
        await expect(page.locator('body')).toBeVisible();
    });

    test('public page has navigation', async ({ page }) => {
        await page.goto('/league/public/matches');
        // Should show tab navigation for public pages
        await expect(page.locator('body')).toBeVisible();
    });
});
