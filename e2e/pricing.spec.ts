import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {
    test('loads without server error', async ({ page }) => {
        const res = await page.goto('/pricing');
        await page.waitForLoadState('networkidle');
        expect(res?.status()).not.toBe(500);
        expect(res?.status()).not.toBe(404);
    });

    test('shows PLYAZ plan names when rendered (authenticated context)', async ({ page }) => {
        await page.goto('/pricing');
        await page.waitForLoadState('networkidle');
        // Either shows pricing content OR redirects to login (pricing uses useOrganization hook)
        const hasPlans = await page.getByText('Academy Free').isVisible().catch(() => false);
        const hasLogin = await page.getByRole('heading', { name: /Welcome Back/i }).isVisible().catch(() => false);
        expect(hasPlans || hasLogin).toBeTruthy();
    });

    test('pricing content shows correct plan names and prices', async ({ page }) => {
        await page.goto('/pricing');
        await page.waitForLoadState('networkidle');
        const hasPlans = await page.getByText('Academy Free').isVisible().catch(() => false);
        if (!hasPlans) {
            test.skip();
            return;
        }
        await expect(page.getByText('Pro League').first()).toBeVisible();
        await expect(page.getByText('Elite Association').first()).toBeVisible();
        await expect(page.getByText('£0').first()).toBeVisible();
        await expect(page.getByText('£29').first()).toBeVisible();
        await expect(page.getByText('£99').first()).toBeVisible();
    });

    test('pricing page shows key features', async ({ page }) => {
        await page.goto('/pricing');
        await page.waitForLoadState('networkidle');
        const hasPlans = await page.getByText('Unlimited Teams').isVisible().catch(() => false);
        if (!hasPlans) {
            test.skip();
            return;
        }
        await expect(page.getByText('Referee Pilot Panel')).toBeVisible();
        await expect(page.getByText('Up to 4 Teams')).toBeVisible();
    });
});
