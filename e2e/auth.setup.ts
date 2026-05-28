import { test as setup, expect } from '@playwright/test';
import { ACCOUNTS, type Role } from './fixtures/accounts';

/**
 * Logs in each seeded role through the real login UI and persists the
 * authenticated session (httpOnly sb-* cookies) to a storageState file.
 * Authenticated specs reuse these via the `storageState` project option,
 * so they never repeat the login flow.
 */
async function login(role: Role) {
    setup(`authenticate as ${role}`, async ({ page }) => {
        const account = ACCOUNTS[role];

        await page.goto('/login');
        await page.getByTestId('email-input').fill(account.email);
        await page.getByTestId('password-input').fill(account.password);
        await page.getByTestId('login-form-submit-button').click();

        // A successful login leaves /login and lands on an authenticated /league route.
        await page.waitForURL(/\/league/, { timeout: 30_000 });
        await expect(page).not.toHaveURL(/\/login/);

        await page.context().storageState({ path: account.storageState });
    });
}

login('organizer');
login('player');
login('referee');
