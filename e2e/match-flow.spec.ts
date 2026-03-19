import { test, expect } from '@playwright/test';

test.describe('Match Score Update Flow (Referee)', () => {
    const matchId = 'test-match-123';
    const orgId = 'test-org-uuid';

    test.beforeEach(async ({ page }) => {
        // Standard setup: Navigate to landing page, clear and seed localStorage
        await page.goto('/');
        await page.evaluate(({ orgId, matchId }) => {
            localStorage.clear();
            localStorage.setItem('plyaz_simulation_enabled', 'true');
            
            const store = (key: string, data: any) => localStorage.setItem(`plyaz_${key}`, JSON.stringify(data));
            
            store('organizations', [{ id: orgId, name: 'Test Org', slug: 'test-org' }]);
            store('profiles', [{ id: 'ref-1', full_name: 'Test Referee', role: 'referee', organization_id: orgId }]);
            store('auth', [{ id: 'ref-1', email: 'ref@test.com' }]);
            store('competitions', [{ id: 'comp-1', name: 'Test Cup', organization_id: orgId }]);
            store('teams', [
                { id: 'team-a', name: 'Home Team', organization_id: orgId },
                { id: 'team-b', name: 'Away Team', organization_id: orgId }
            ]);
            // Seed players
            store('players', [
                { id: 'player-1', full_name: 'Home Star', team_id: 'team-a', jersey_number: '10', organization_id: orgId },
                { id: 'player-2', full_name: 'Away Star', team_id: 'team-b', jersey_number: '9', organization_id: orgId }
            ]);
            
            store('matches', [{
                id: matchId,
                home_team_id: 'team-a',
                away_team_id: 'team-b',
                home_score: 0,
                away_score: 0,
                status: 'live',
                competition_id: 'comp-1',
                organization_id: orgId,
                match_time: 0,
                home_team: { name: 'Home Team', short_name: 'HOM' },
                away_team: { name: 'Away Team', short_name: 'AWY' }
            }]);
        }, { orgId, matchId });

        // Robust Mock API responses for direct fetch calls
        await page.route(`**/api/league/matches/${matchId}`, async route => {
            const matches = JSON.parse(await page.evaluate(() => localStorage.getItem('plyaz_matches') || '[]'));
            const match = matches.find((m: any) => m.id === 'test-match-123');
            await route.fulfill({ json: match || {} });
        });
        
        await page.route(`**/api/league/matches/${matchId}/events`, async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({ json: { success: true } });
            } else {
                await route.fulfill({ json: [] });
            }
        });

        await page.route(`**/api/league/players?teamId=team-a`, async route => {
             const players = JSON.parse(await page.evaluate(() => localStorage.getItem('plyaz_players') || '[]'));
             await route.fulfill({ json: players.filter((p: any) => p.team_id === 'team-a') });
        });
    });

    test('Referee can update score successfully', async ({ page }) => {
        await page.goto(`/league/referee/live/${matchId}`);
        
        // Wait for the score to be visible (0-0)
        await expect(page.locator('text=0').first()).toBeVisible();
        
        // Click "Goal" for home team
        await page.getByRole('button', { name: /goal/i }).first().click();
        
        // Select player in modal
        await page.getByText('Home Star').click();
        
        // Confirm event
        await page.getByRole('button', { name: /confirm event/i }).click();
        
        // Verify score changed to 1-0 locally
        await expect(page.locator('text=1').first()).toBeVisible();
    });

    test('Match must be live to update score (UI level)', async ({ page }) => {
        // Change match status to scheduled in localStorage
        await page.evaluate(() => {
            const matches = JSON.parse(localStorage.getItem('plyaz_matches') || '[]');
            if (matches[0]) {
                matches[0].status = 'scheduled';
                localStorage.setItem('plyaz_matches', JSON.stringify(matches));
            }
        });
        
        await page.goto(`/league/referee/live/${matchId}`);
        
        // Verify it shows "SCHEDULED"
        await expect(page.getByText('SCHEDULED')).toBeVisible();
    });
});
