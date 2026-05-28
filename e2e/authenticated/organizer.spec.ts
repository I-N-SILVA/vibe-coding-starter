import { test, expect } from '@playwright/test';

/**
 * Organizer (manager) flows against PRODUCTION using the seeded
 * `organizer.test@plyaz.test` session. These create real entities on the
 * shared Supabase project, so created records are timestamped to stay isolated.
 */
test.describe('Organizer', () => {
    test('dashboard loads with the org context', async ({ page }) => {
        await page.goto('/league');
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
        await expect(page.getByText('+ New League')).toBeVisible();
    });

    test('management pages render seeded data', async ({ page }) => {
        await page.goto('/league/teams');
        await expect(page.getByRole('heading', { name: 'Registered Teams' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Lisbon Lions' })).toBeVisible();

        await page.goto('/league/players');
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page.locator('h1, h2').first()).toBeVisible();

        await page.goto('/league/matches');
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page.locator('h1, h2').first()).toBeVisible();

        await page.goto('/league/standings');
        await expect(page).not.toHaveURL(/\/login/);
    });

    test('MUTATE: create a new team', async ({ page }) => {
        const teamName = `E2E Team ${Date.now()}`;

        await page.goto('/league/teams');
        await page
            .getByRole('button', { name: /Add Team/i })
            .first()
            .click();

        await expect(page.getByText('Add New Team')).toBeVisible();
        await page.getByPlaceholder('e.g., Manchester Jets').fill(teamName);
        await page.getByPlaceholder('e.g., MJT').fill('E2E');
        await page.getByRole('button', { name: /Register Team/i }).click();

        // The new team appears in the list and the modal closes.
        await expect(page.getByText('Add New Team')).toBeHidden();
        await expect(page.getByText(teamName)).toBeVisible({ timeout: 15_000 });
    });

    test('MUTATE: create a new league via the wizard', async ({ page }) => {
        const leagueName = `E2E League ${Date.now()}`;

        await page.goto('/league/create');
        await expect(page.getByRole('heading', { name: /Create a League/i })).toBeVisible();

        await page.getByPlaceholder('e.g., Sunday Premier Division').fill(leagueName);
        // Step 2 proceeds on defaults (type defaults to "league").
        await page.getByRole('button', { name: /Next/i }).click();
        await page.getByRole('button', { name: /Next/i }).click();
        // Step 3 — Schedule. Real dates are required: the API rejects empty start_date/end_date.
        await page.locator('input[type=date]').nth(0).fill('2026-08-01');
        await page.locator('input[type=date]').nth(1).fill('2026-11-30');
        await page.getByRole('button', { name: /Next/i }).click();
        await page.getByRole('button', { name: /Create League/i }).click();

        // On success the wizard redirects back to the dashboard. The success toast also briefly appears.
        await page.waitForURL(/\/league$/, { timeout: 30_000 });
        // The new league shows up in the dashboard's Overview counters / lists soon after.
        await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    });

    test('REGRESSION Bug 4: player stats API does not 500', async ({ page }) => {
        // Grab a real player id from the authenticated players API, then hit its stats endpoint.
        const playersRes = await page.request.get('/api/league/players');
        expect(playersRes.ok()).toBeTruthy();
        const players = await playersRes.json();
        expect(Array.isArray(players)).toBeTruthy();
        test.skip(players.length === 0, 'No players seeded to check stats for');

        const statsRes = await page.request.get(`/api/league/players/${players[0].id}/stats`);
        expect(statsRes.status()).not.toBe(500);
        expect(statsRes.ok()).toBeTruthy();
    });
});
