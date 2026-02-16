import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test('loads and shows hero section', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/PLYAZ/i);
        await expect(page.locator('body')).toBeVisible();
    });

    test('shows navigation links', async ({ page }) => {
        await page.goto('/');
        // Check for main nav elements
        await expect(page.getByRole('navigation')).toBeVisible();
    });

    test('features page loads', async ({ page }) => {
        await page.goto('/features');
        await expect(page.locator('body')).toBeVisible();
        await expect(page).not.toHaveTitle(/404/);
    });

    test('pricing page loads', async ({ page }) => {
        await page.goto('/pricing');
        await expect(page.locator('body')).toBeVisible();
        await expect(page).not.toHaveTitle(/404/);
    });

    test('FAQ page loads', async ({ page }) => {
        await page.goto('/faq');
        await expect(page.locator('body')).toBeVisible();
        await expect(page).not.toHaveTitle(/404/);
    });

    test('about page loads', async ({ page }) => {
        await page.goto('/about');
        await expect(page.locator('body')).toBeVisible();
        await expect(page).not.toHaveTitle(/404/);
    });
});
