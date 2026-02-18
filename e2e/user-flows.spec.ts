import { test, expect } from '@playwright/test';

test.describe('PLYAZ League Manager User Flows', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to the debug page and seed initial data for all tests
        await page.goto('/debug/test-flows');
        await page.click('text=Seed Initial Data');
        // Simple wait to ensure mock data is written to localStorage
        await page.waitForTimeout(500);
    });

    test('Organizer Flow: Organization and Competition Management', async ({ page }) => {
        // 1. Check Dashboard
        await page.goto('/league');
        await expect(page.locator('h1')).toContainText('Dashboard');

        // 2. Check Organizations page
        await page.click('text=Organizations');
        await expect(page).toHaveURL(/.*organizations/);

        // 3. Check Competitions page
        await page.goto('/league/competitions');
        await expect(page.locator('h1')).toContainText('Competitions');

        // 4. Verify mock competition exists
        await expect(page.locator('text=Winter Cup 2026')).toBeVisible();
    });

    test('Referee Flow: Match Management', async ({ page }) => {
        // 1. Navigate to Referee Portal
        await page.goto('/league/referee');
        await expect(page.locator('h1')).toContainText('Referee Portal');

        // 2. Check Match Schedule
        await page.goto('/league/matches/schedule');
        await expect(page.locator('h1')).toContainText('Match Schedule');

        // 3. Verify Live Scoreboard
        await page.goto('/league/matches/live');
        await expect(page.locator('h1')).toContainText('Live Match');
    });

    test('Player/Fan Flow: Standings and Statistics', async ({ page }) => {
        // 1. Check Public Standings
        await page.goto('/league/public/standings');
        await expect(page.locator('h1')).toContainText('Standings');

        // 2. Check Statistics
        await page.goto('/league/statistics');
        await expect(page.locator('h1')).toContainText('Statistics');

        // 3. Check Team Roster (via Teams page)
        await page.goto('/league/teams');
        await expect(page.locator('h1')).toContainText('Teams');
    });

    test('Data Management: Clearing Data', async ({ page }) => {
        await page.goto('/debug/test-flows');

        // Capture alerts
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('clear all mock data');
            await dialog.accept();
        });

        await page.click('text=Clear Local Data');

        // Re-check stats on debug page to ensure they are 0
        // Wait for localStorage to clear
        await page.waitForTimeout(500);
        const orgCount = await page.locator('text=Organizations >> xpath=../.. >> p').innerText();
        expect(orgCount).toBe('0');
    });
});
