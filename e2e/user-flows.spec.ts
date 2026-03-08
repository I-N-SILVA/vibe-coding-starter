import { test, expect } from '@playwright/test';

// Seed mock data directly via localStorage before each test
async function seedMockData(page: import('@playwright/test').Page) {
    await page.evaluate(() => {
        // Clear existing data
        ['organizations', 'profiles', 'auth', 'competitions', 'teams', 'players', 'categories'].forEach(k => {
            localStorage.removeItem(`plyaz_${k}`);
        });

        // Enable simulation mode so repositories use LocalStore
        localStorage.setItem('plyaz_simulation_enabled', 'true');

        // Helper to add item with auto-generated ID
        function addItem(key: string, item: Record<string, unknown>) {
            const items = JSON.parse(localStorage.getItem(`plyaz_${key}`) || '[]');
            const newItem = {
                ...item,
                id: (item.id as string) || crypto.randomUUID(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            items.push(newItem);
            localStorage.setItem(`plyaz_${key}`, JSON.stringify(items));
            return newItem;
        }

        const userId = 'debug-user-123';
        const org = addItem('organizations', { name: 'PLYAZ Youth League', slug: 'plyaz-youth', owner_id: userId });
        addItem('profiles', { id: userId, full_name: 'Debug Manager', role: 'organizer', approval_status: 'approved', organization_id: org.id });
        addItem('auth', { id: userId, email: 'organizer@plyaz.com', isActive: true });
        addItem('competitions', { name: 'Premier League 2026', organizationId: org.id, organization_id: org.id, type: 'league', status: 'active', startDate: '2026-02-01' });
        ['Phoenix FC', 'City Rangers', 'Eagles', 'Rovers'].forEach(name => {
            addItem('teams', { name, organization_id: org.id, organizationId: org.id });
        });
    });
}

test.describe('PLYAZ League Manager User Flows', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate first to establish a page context, then seed localStorage
        await page.goto('/debug/test-flows');
        await seedMockData(page);
        // Navigate to league dashboard (full page load, simulation mode already set)
        await page.goto('/league');
        await page.waitForLoadState('domcontentloaded');
    });

    test('Organizer Flow: Organization and Competition Management', async ({ page }) => {
        // 1. Check Dashboard loads (h1 label is "Dashboard")
        await expect(page.locator('h1')).toContainText('Dashboard', { ignoreCase: true });

        // 2. Check Organizations page loads
        await page.goto('/league/organizations');
        await expect(page).toHaveURL(/.*organizations/);

        // 3. Check Teams page loads
        await page.goto('/league/teams');
        await expect(page.locator('h1')).toContainText('Management', { ignoreCase: true });

        // 4. Verify dashboard shows seeded data
        await page.goto('/league');
        await expect(page.getByText('Welcome back')).toBeVisible();
    });

    test('Referee Flow: Match Management', async ({ page }) => {
        // 1. Navigate to Referee Portal (h1 label is "Match Control")
        await page.goto('/league/referee');
        await expect(page.locator('h1')).toContainText('Match Control', { ignoreCase: true });

        // 2. Check Matches page (h1 label is "Management")
        await page.goto('/league/matches');
        await expect(page.locator('h1')).toContainText('Management', { ignoreCase: true });

        // 3. Check Match Schedule page (h1 label is "Scheduler")
        await page.goto('/league/matches/schedule');
        await expect(page.locator('h1')).toContainText('Scheduler', { ignoreCase: true });
    });

    test('Player/Fan Flow: Standings and Statistics', async ({ page }) => {
        // 1. Check Public Standings (h1 label defaults to "League Table" for league format)
        await page.goto('/league/public/standings');
        await expect(page.locator('h1')).toContainText('League Table', { ignoreCase: true });

        // 2. Check Statistics / Leaderboards (h1 label is "Player Performance")
        await page.goto('/league/statistics');
        await expect(page.locator('h1')).toContainText('Player Performance', { ignoreCase: true });

        // 3. Check Teams page (h1 label is "Management")
        await page.goto('/league/teams');
        await expect(page.locator('h1')).toContainText('Management', { ignoreCase: true });
    });

    test('Data Management: Clearing Data', async ({ page }) => {
        await page.goto('/debug/test-flows');

        // Capture confirmation dialog before clicking Reset Data
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('clear all mock data');
            await dialog.accept();
        });

        await page.click('text=Reset Data');

        // Wait for localStorage to clear and stats to update
        await page.waitForTimeout(500);

        // Verify stats grid shows 0 for all entries
        await expect(page.locator('div').filter({ hasText: /^0$/ }).first()).toBeVisible();
    });
});
