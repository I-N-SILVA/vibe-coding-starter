import { test, expect } from '@playwright/test';

/**
 * Public-surface regression tests for the production bugs found during the
 * 2026-05-27 QA sweep. These run without authentication and must pass on prod.
 */
test.describe('Production bug regressions (public)', () => {
    test('Bug 1: CSP connect-src allows wss://*.supabase.co for realtime', async ({ request }) => {
        const res = await request.get('/');
        const csp = res.headers()['content-security-policy'] ?? '';
        expect(csp).toContain('wss://*.supabase.co');
    });

    test('Bug 3a: /league/public/standings does not show the empty-default message', async ({
        page,
    }) => {
        await page.goto('/league/public/standings');
        // After the fix, the page resolves to an active competition by default.
        await expect(page.getByText(/Select a competition to view standings/i)).toHaveCount(0);
    });

    test('Bug 3b: /league/public/standings has no React hydration errors', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (err) => errors.push(err.message));
        page.on('console', (msg) => {
            if (msg.type() === 'error') errors.push(msg.text());
        });

        await page.goto('/league/public/standings');
        await page.waitForLoadState('networkidle');

        const hydrationErrors = errors.filter((e) =>
            /Hydration|hydrat|#418|#421|did not match/i.test(e),
        );
        expect(hydrationErrors).toEqual([]);
    });
});
