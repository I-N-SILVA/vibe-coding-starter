import { test, expect } from '@playwright/test';

/**
 * Referee flows against PRODUCTION using the seeded
 * `referee.test@plyaz.test` session. Includes a real goal-recording
 * mutation on the seeded LIVE match.
 */
test.describe('Referee', () => {
    test('dashboard loads and shows the Total Matches stat', async ({ page }) => {
        await page.goto('/league/referee');
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page.getByRole('heading', { name: /My Dashboard/i })).toBeVisible();
        await expect(page.getByText('Total Matches')).toBeVisible();
    });

    test('REGRESSION Bug 5: Total Matches counts all assigned matches, not only completed', async ({
        page,
    }) => {
        await page.goto('/league/referee');
        await expect(page.getByText('Total Matches')).toBeVisible();

        // Read the stat value next to the "Total Matches" label.
        const totalCard = page.locator(':has(> :text("Total Matches"))').first();
        const totalText = await totalCard.locator('text=/^\\d+$/').first().textContent();
        const total = Number(totalText?.trim() ?? '0');

        const todayCard = page.locator(':has(> :text("Today"))').first();
        const todayText = await todayCard.locator('text=/^\\d+$/').first().textContent();
        const today = Number(todayText?.trim() ?? '0');

        // Live + scheduled matches counted today should already be included in Total Matches.
        // Bug 5 was Total < Today (only counted completed). Post-fix: Total >= Today.
        expect(total).toBeGreaterThanOrEqual(today);
    });

    test('MUTATE: open the live console for the seeded live match and record a goal', async ({
        page,
    }) => {
        // Find the live match assigned to this referee via the API.
        const liveRes = await page.request.get('/api/league/matches?status=live');
        expect(liveRes.ok()).toBeTruthy();
        const liveMatches: Array<{ id: string; home_score: number; away_score: number }> =
            await liveRes.json();
        test.skip(!liveMatches?.length, 'No live match seeded for the referee');
        const match = liveMatches[0];

        await page.goto(`/league/referee/live/${match.id}`);
        // The scoring console is identified by the per-team Goal action buttons.
        const goalButton = page.getByRole('button', { name: /Goal/i }).first();
        await expect(goalButton).toBeVisible({ timeout: 20_000 });

        // Capture the home score before the mutation.
        const homeScoreLocator = page.locator('span.text-6xl').first();
        const before = Number((await homeScoreLocator.textContent())?.trim() ?? '0');

        // Open the picker for the home Goal button (first "Goal" button on the page).
        await goalButton.click();
        await expect(page.getByText('Which team?')).toBeVisible();

        // Pick the home team — its picker button is labelled "Home <team name> 🏠".
        await page.getByRole('button', { name: /^Home/i }).click();
        await expect(page.getByText(/Who\?/)).toBeVisible();

        // Confirm with the default "Unknown / No attribution" selection.
        await page.getByRole('button', { name: /Confirm/i }).click();

        // The picker closes and the optimistic home score increments by one.
        await expect(page.getByText('Which team?')).toBeHidden();
        await expect
            .poll(
                async () => {
                    const txt = await homeScoreLocator.textContent();
                    return Number(txt?.trim() ?? '0');
                },
                { timeout: 10_000 },
            )
            .toBe(before + 1);
    });
});
