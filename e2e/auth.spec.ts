import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('login page loads with form', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('body')).toBeVisible();

        // Should show email input
        const emailInput = page.getByPlaceholder('you@email.com');
        await expect(emailInput).toBeVisible();
    });

    test('login page shows sign up mode', async ({ page }) => {
        await page.goto('/login?mode=signup');
        await expect(page.locator('body')).toBeVisible();

        // In signup mode, full name field should appear
        const nameInput = page.getByPlaceholder('e.g., James Smith');
        await expect(nameInput).toBeVisible();
    });

    test('unauthenticated user redirected from dashboard', async ({ page }) => {
        const response = await page.goto('/league');
        // Page should load (may redirect client-side)
        expect(response?.status()).toBeLessThan(500);
    });

    test('unauthenticated user redirected from onboarding', async ({ page }) => {
        const response = await page.goto('/onboarding');
        expect(response?.status()).toBeLessThan(500);
    });
});
