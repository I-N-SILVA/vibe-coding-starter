import { test, expect } from '@playwright/test';

test.describe('Navigation & Routing', () => {
    test('footer links have correct href attributes (no redirect needed)', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const footer = page.getByTestId('landing-footer');
        await footer.scrollIntoViewIfNeeded();

        await expect(footer.getByRole('link', { name: 'Network' })).toHaveAttribute('href', '/about');
        await expect(footer.getByRole('link', { name: 'Matches' })).toHaveAttribute('href', '/league/public/matches');
        await expect(footer.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
        await expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
        await expect(footer.getByRole('link', { name: 'Cookies' })).toHaveAttribute('href', '/cookies');
        await expect(footer.getByRole('link', { name: 'Security' })).toHaveAttribute('href', '/security');
    });

    test('nav links have correct href attributes', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await expect(page.getByTestId('nav-protocol')).toHaveAttribute('href', '/about');
        await expect(page.getByTestId('nav-live-data')).toHaveAttribute('href', '/league/public/matches');
        await expect(page.getByTestId('nav-access')).toHaveAttribute('href', '/contact');
    });

    test('footer Matches link navigates to public matches', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const footer = page.getByTestId('landing-footer');
        await footer.scrollIntoViewIfNeeded();
        await footer.getByRole('link', { name: 'Matches' }).click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/league\/public\/matches/);
    });

    test('nav Live Data link navigates to public matches', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.getByTestId('nav-live-data').click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/league\/public\/matches/);
    });

    test('Sign In link navigates to login', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.getByTestId('nav-signin').click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/login/);
    });

    test('404 page renders for unknown routes', async ({ page }) => {
        // Next.js custom 404 may return 200 from CDN — check for 404 page content
        await page.goto('/this-page-does-not-exist-xyz-abc');
        await page.waitForLoadState('networkidle');
        const statusOk = await page.getByText(/404|not found|page.*not.*found/i).isVisible().catch(() => false);
        const redirectedToLogin = await page.getByRole('heading', { name: /Welcome Back/i }).isVisible().catch(() => false);
        expect(statusOk || redirectedToLogin).toBeTruthy();
    });

    test('PLYAZ logo on landing page links back to /', async ({ page }) => {
        await page.goto('/');
        const logo = page.getByTestId('logo-link');
        await expect(logo).toHaveAttribute('href', '/');
    });
});
