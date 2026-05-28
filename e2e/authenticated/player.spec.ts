import { test, expect } from '@playwright/test';

/**
 * Player flows against PRODUCTION using the seeded
 * `player.test@plyaz.test` session. Pedro Player is registered as a Lisbon
 * Lions striker in the Premier Test League 2026 seed.
 */
test.describe('Player', () => {
    test('athlete dashboard loads', async ({ page }) => {
        await page.goto('/league/player/dashboard');
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page.getByText('Athlete Dashboard')).toBeVisible();
    });

    test('profile page loads with editable surface', async ({ page }) => {
        await page.goto('/league/player/profile');
        await expect(page).not.toHaveURL(/\/login/);
        // A save button is present, proving the mutate surface is reachable.
        await expect(
            page.getByRole('button', { name: /Save|Salvar|Guardar/i }).first(),
        ).toBeVisible();
    });

    test('discover page loads', async ({ page }) => {
        await page.goto('/discover');
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('REGRESSION Bug 4: own stats endpoint does not 500', async ({ page }) => {
        // Resolve the linked player record for this profile via the authenticated players API.
        const playersRes = await page.request.get('/api/league/players');
        expect(playersRes.ok()).toBeTruthy();
        const players: Array<{ id: string }> = await playersRes.json();
        test.skip(!players?.length, 'No players visible to this account');

        const statsRes = await page.request.get(`/api/league/players/${players[0].id}/stats`);
        expect(statsRes.status()).not.toBe(500);
    });
});
