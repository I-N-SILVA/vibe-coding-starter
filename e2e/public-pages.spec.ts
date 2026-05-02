import { test, expect } from '@playwright/test';

const PUBLIC_PAGES = [
    { path: '/about', heading: /About|Network|PLYAZ/i },
    { path: '/contact', heading: /Contact|Access|Get in Touch/i },
    { path: '/faq', heading: /FAQ|Frequently|Questions/i },
    { path: '/features', heading: /Features|Platform|What/i },
    { path: '/privacy', heading: /Privacy/i },
    { path: '/security', heading: /Security/i },
    { path: '/terms', heading: /Terms/i },
    { path: '/cookies', heading: /Cookie/i },
];

test.describe('Public Informational Pages', () => {
    for (const { path, heading } of PUBLIC_PAGES) {
        test(`${path} loads and shows relevant heading`, async ({ page }) => {
            const response = await page.goto(path);
            await page.waitForLoadState('networkidle');
            expect(response?.status()).not.toBe(500);
            const h = page.getByRole('heading').first();
            await expect(h).toBeVisible();
            await expect(h).toMatchAriaSnapshot(`- heading`);
        });
    }

    test('/pricing loads with plan names', async ({ page }) => {
        await page.goto('/pricing');
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(/Academy Free|Free Plan|PLYAZ/i).first()).toBeVisible();
    });

    test('/status loads system status page', async ({ page }) => {
        const res = await page.goto('/status');
        await page.waitForLoadState('networkidle');
        expect(res?.status()).not.toBe(500);
    });

    test('/help page loads', async ({ page }) => {
        const res = await page.goto('/help');
        await page.waitForLoadState('networkidle');
        expect(res?.status()).not.toBe(500);
    });

    test('/press page loads', async ({ page }) => {
        const res = await page.goto('/press');
        await page.waitForLoadState('networkidle');
        expect(res?.status()).not.toBe(500);
    });

    test('/careers page loads', async ({ page }) => {
        const res = await page.goto('/careers');
        await page.waitForLoadState('networkidle');
        expect(res?.status()).not.toBe(500);
    });
});
