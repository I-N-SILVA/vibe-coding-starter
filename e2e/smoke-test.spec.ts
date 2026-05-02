import { test, expect } from '@playwright/test';

test.describe('Smoke Test - PLYAZ League Manager', () => {
    test('should load the landing page with PLYAZ branding and hero headings', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveTitle(/PLYAZ/i);
        await expect(page.getByRole('heading', { name: /Propelling/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /CREATE YOUR LEAGUE/i }).first()).toBeVisible();
    });

    test('should load the pricing page without errors', async ({ page }) => {
        const res = await page.goto('/pricing');
        await page.waitForLoadState('networkidle');
        expect(res?.status()).not.toBe(500);
        // Pricing page shows plan names (if authenticated) or redirects to login
        const hasPricing = await page.getByText(/Academy Free|Pro League|Elite Association/i).isVisible().catch(() => false);
        const hasLogin = await page.getByRole('heading', { name: /Welcome Back/i }).isVisible().catch(() => false);
        expect(hasPricing || hasLogin).toBeTruthy();
    });

    test('should show login page with Welcome Back heading', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible();
    });
});
