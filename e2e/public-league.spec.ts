import { test, expect } from '@playwright/test';

test.describe('Public League Views (Unauthenticated)', () => {
    test('public competitions list loads', async ({ page }) => {
        const res = await page.goto('/league/public');
        await page.waitForLoadState('networkidle');
        expect(res?.status()).not.toBe(500);
        await expect(page.getByRole('heading').first()).toBeVisible();
    });

    test('public matches page loads', async ({ page }) => {
        await page.goto('/league/public/matches');
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading').first()).toBeVisible();
    });

    test('public standings page loads', async ({ page }) => {
        await page.goto('/league/public/standings');
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading').first()).toBeVisible();
    });

    test('public teams page loads', async ({ page }) => {
        await page.goto('/league/public/teams');
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading').first()).toBeVisible();
    });

    test('public scoreboard page loads', async ({ page }) => {
        const res = await page.goto('/league/public/scoreboard');
        await page.waitForLoadState('networkidle');
        expect(res?.status()).not.toBe(500);
    });

    test('public pages do not redirect to login', async ({ page }) => {
        const publicPaths = [
            '/league/public',
            '/league/public/matches',
            '/league/public/standings',
            '/league/public/teams',
            '/league/public/scoreboard',
        ];
        for (const path of publicPaths) {
            await page.goto(path);
            await page.waitForLoadState('networkidle');
            expect(page.url()).not.toContain('/login');
        }
    });

    test('protected league routes redirect unauthenticated users to login', async ({ page }) => {
        const protectedPaths = [
            '/league',
            '/league/teams',
            '/league/players',
            '/league/matches',
            '/league/standings',
        ];
        for (const path of protectedPaths) {
            await page.goto(path);
            await page.waitForLoadState('networkidle');
            expect(page.url()).toMatch(/login|\/$/);
        }
    });
});
