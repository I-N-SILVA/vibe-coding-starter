import { defineConfig, devices } from '@playwright/test';
import { ACCOUNTS } from './e2e/fixtures/accounts';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://vibe-coding-starter-black.vercel.app';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 1,
    reporter: 'html',
    timeout: 60_000,
    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        navigationTimeout: 45_000,
    },
    projects: [
        // 1. Log in each seeded role and save its session to storageState.
        {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },

        // 2. Public / unauthenticated specs (no stored session).
        {
            name: 'public',
            testMatch: /.*\.spec\.ts/,
            testIgnore: /authenticated\/.*/,
            use: { ...devices['Desktop Chrome'] },
        },

        // 3. Authenticated, role-scoped specs — reuse the saved sessions.
        {
            name: 'organizer',
            testMatch: /authenticated\/organizer\.spec\.ts/,
            dependencies: ['setup'],
            use: { ...devices['Desktop Chrome'], storageState: ACCOUNTS.organizer.storageState },
        },
        {
            name: 'referee',
            testMatch: /authenticated\/referee\.spec\.ts/,
            dependencies: ['setup'],
            use: { ...devices['Desktop Chrome'], storageState: ACCOUNTS.referee.storageState },
        },
        {
            name: 'player',
            testMatch: /authenticated\/player\.spec\.ts/,
            dependencies: ['setup'],
            use: { ...devices['Desktop Chrome'], storageState: ACCOUNTS.player.storageState },
        },
    ],
});
