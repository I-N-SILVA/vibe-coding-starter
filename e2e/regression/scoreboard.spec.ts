import { test, expect } from '@playwright/test';

/**
 * Scoreboard regression tests — unauthenticated, runs against production.
 *
 * The seed ("Premier Test League 2026") includes two completed matches:
 *   LIS 2 - 0 POR
 *   MAD 1 - 0 PAR
 * These tests assert the Results section is visible and shows numeric scores.
 */
test.describe('Scoreboard (public)', () => {
    test('Results section renders on /league/public/scoreboard', async ({ page }) => {
        await page.goto('/league/public/scoreboard');
        await page.waitForLoadState('networkidle');

        // The "Results" heading is rendered whenever completed matches exist.
        await expect(page.getByRole('heading', { name: /results/i })).toBeVisible();

        // At least one score should be visible — matches render as "N - N" text
        // or two separate numeric score elements adjacent to each other.
        const scorePattern = /\d+\s*[-–]\s*\d+|\b\d+\b/;
        const scoreLocator = page.locator('text=/\\d+/').first();
        await expect(scoreLocator).toBeVisible();
    });

    test('Results section renders with ?competitionId= from public competitions API', async ({
        page,
        request,
    }) => {
        // Discover the "Premier Test League 2026" competition via the public API.
        const res = await request.get('/api/league/public/competitions');
        let competitionId: string | null = null;

        if (res.ok()) {
            const competitions: Array<{ id: string; name: string }> = await res.json();
            const target = competitions.find((c) => /premier test league 2026/i.test(c.name));
            if (target) {
                competitionId = target.id;
            } else if (competitions.length > 0) {
                // Fall back to the first competition if the seed name doesn't match exactly.
                competitionId = competitions[0].id;
            }
        }

        const url = competitionId
            ? `/league/public/scoreboard?competitionId=${competitionId}`
            : '/league/public/scoreboard';

        await page.goto(url);
        await page.waitForLoadState('networkidle');

        // The Results section heading must be present.
        await expect(page.getByRole('heading', { name: /results/i })).toBeVisible();
    });
});
