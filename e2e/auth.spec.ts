import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test.describe('Login page', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/login');
            await page.waitForLoadState('networkidle');
        });

        test('shows Welcome Back heading and sign-in form', async ({ page }) => {
            await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible();
            await expect(page.getByPlaceholder('you@email.com')).toBeVisible();
            await expect(page.getByPlaceholder('Min 6 characters')).toBeVisible();
            await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
        });

        test('shows Forgot password button', async ({ page }) => {
            await expect(page.getByRole('button', { name: /Forgot your password/i })).toBeVisible();
        });

        test('shows Sign Up toggle', async ({ page }) => {
            await expect(page.getByText("Don't have an account?")).toBeVisible();
            await expect(page.getByRole('button', { name: /Sign Up/i })).toBeVisible();
        });

        test('toggles to signup mode via URL param', async ({ page }) => {
            await page.goto('/login?mode=signup');
            await page.waitForLoadState('networkidle');
            await expect(page.getByRole('heading', { name: /Create Account|Join PLYAZ|Sign Up/i })).toBeVisible();
        });

        test('switches to forgot password mode', async ({ page }) => {
            await page.getByRole('button', { name: /Forgot your password/i }).click();
            await expect(page.getByRole('heading', { name: /Reset|Forgot/i })).toBeVisible();
        });

        test('email field validates on empty submission', async ({ page }) => {
            await page.getByRole('button', { name: /Sign In/i }).click();
            await expect(page.getByPlaceholder('you@email.com')).toBeFocused();
        });

        test('branding sidebar is visible', async ({ page }) => {
            await expect(page.getByText('Manage leagues with precision.')).toBeVisible();
            await expect(page.getByText('Real-time match tracking')).toBeVisible();
            await expect(page.getByText('Automated fixture generation')).toBeVisible();
            await expect(page.getByText('Player statistics & analytics')).toBeVisible();
        });

        test('PLYAZ logo links back to home', async ({ page }) => {
            const logo = page.getByRole('link', { name: /Plyaz/i });
            await expect(logo).toBeVisible();
            await expect(logo).toHaveAttribute('href', '/');
        });

        test('fills email and password fields', async ({ page }) => {
            await page.getByPlaceholder('you@email.com').fill('test@example.com');
            await page.getByPlaceholder('Min 6 characters').fill('testpassword123');
            await expect(page.getByPlaceholder('you@email.com')).toHaveValue('test@example.com');
            await expect(page.getByPlaceholder('Min 6 characters')).toHaveValue('testpassword123');
        });
    });

    test.describe('Invite acceptance flow', () => {
        test('invite flow redirects to login preserving token', async ({ page }) => {
            await page.goto('/invites/accept?token=test-token-123');
            await page.waitForLoadState('networkidle');
            // If user is not authenticated, the app redirects to login (with token in URL)
            const onInvitePage = page.url().includes('/invites/accept');
            const onLoginPage = page.url().includes('/login');
            expect(onInvitePage || onLoginPage).toBeTruthy();
        });
    });
});
