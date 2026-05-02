import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('loads with correct title and PLYAZ branding', async ({ page }) => {
        await expect(page).toHaveTitle(/PLYAZ/i);
        await expect(page.getByTestId('logo-link')).toBeVisible();
        await expect(page.getByTestId('landing-nav')).toBeVisible();
    });

    test('hero section displays correct headings and CTA', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Propelling/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /CREATE YOUR LEAGUE/i }).first()).toBeVisible();
    });

    test('navigation links are present and correct', async ({ page }) => {
        await expect(page.getByTestId('nav-protocol')).toHaveAttribute('href', '/about');
        await expect(page.getByTestId('nav-live-data')).toHaveAttribute('href', '/league/public/matches');
        await expect(page.getByTestId('nav-access')).toHaveAttribute('href', '/contact');
        await expect(page.getByTestId('nav-signin')).toHaveAttribute('href', '/login');
    });

    test('CREATE LEAGUE nav button points to signup', async ({ page }) => {
        const btn = page.getByTestId('nav-create-league-btn');
        await expect(btn).toBeVisible();
        await expect(btn).toHaveAttribute('href', '/login?mode=signup');
    });

    test('partner band renders with logos', async ({ page }) => {
        const band = page.getByTestId('partner-band');
        await expect(band).toBeVisible();
        await expect(band.getByAltText('Rise')).toBeVisible();
        await expect(band.getByAltText('Arden University')).toBeVisible();
    });

    test('stats section shows key metrics', async ({ page }) => {
        const stats = page.getByTestId('stats-section');
        await stats.scrollIntoViewIfNeeded();
        await expect(stats.getByText('24k+').first()).toBeVisible();
        await expect(stats.getByText('99.9%').first()).toBeVisible();
        await expect(stats.getByText('Matches Processed')).toBeVisible();
        await expect(stats.getByText('Active Talents')).toBeVisible();
        await expect(stats.getByText('Leagues Active')).toBeVisible();
    });

    test('CTA section renders and button links to signup', async ({ page }) => {
        const cta = page.getByTestId('cta-section');
        await cta.scrollIntoViewIfNeeded();
        await expect(cta).toBeVisible();
        const ctaBtn = page.getByTestId('cta-create-league-btn');
        await expect(ctaBtn).toBeVisible();
        await expect(ctaBtn).toHaveAttribute('href', '/login?mode=signup');
        await expect(cta.getByText(/START YOUR/i)).toBeVisible();
        await expect(cta.getByText(/LEGACY NOW/i)).toBeVisible();
    });

    test('footer renders with correct columns and links', async ({ page }) => {
        const footer = page.getByTestId('landing-footer');
        await footer.scrollIntoViewIfNeeded();
        await expect(footer).toBeVisible();
        await expect(footer.getByText('Performance Standard for Football Management.')).toBeVisible();
        await expect(footer.getByRole('link', { name: 'Network' })).toHaveAttribute('href', '/about');
        await expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
        await expect(footer.getByRole('link', { name: 'X / Twitter' })).toBeVisible();
        await expect(footer.getByText('© 2026 PLYAZ. All rights reserved.')).toBeVisible();
    });

    test('mobile menu toggles open and closed', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const menuBtn = page.getByTestId('mobile-menu-btn');
        await expect(menuBtn).toBeVisible();
        await menuBtn.click();
        // Wait for Framer Motion animation
        await page.waitForTimeout(400);
        await expect(page.getByRole('navigation').last().getByRole('link', { name: 'Protocol' })).toBeVisible();
        await expect(page.getByRole('navigation').last().getByRole('link', { name: 'Sign In' })).toBeVisible();
        await menuBtn.click();
    });

    test('Sign In link navigates to login', async ({ page }) => {
        await page.getByTestId('nav-signin').click();
        await expect(page).toHaveURL(/\/login/);
    });

    test('CREATE LEAGUE button navigates to signup', async ({ page }) => {
        await page.getByTestId('nav-create-league-btn').click();
        await expect(page).toHaveURL(/\/login\?mode=signup/);
    });
});
