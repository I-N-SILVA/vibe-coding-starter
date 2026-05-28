/**
 * Seeded production test accounts (Premier Test League 2026 seed).
 * These are confirmed, password-login accounts on the shared Supabase project.
 * Override per-run with env vars if the seed credentials change.
 */
export const PASSWORD = process.env.E2E_TEST_PASSWORD ?? 'TestPlyaz123!';

export const ACCOUNTS = {
    organizer: {
        email: process.env.E2E_ORGANIZER_EMAIL ?? 'organizer.test@plyaz.test',
        password: PASSWORD,
        storageState: 'e2e/.auth/organizer.json',
    },
    player: {
        email: process.env.E2E_PLAYER_EMAIL ?? 'player.test@plyaz.test',
        password: PASSWORD,
        storageState: 'e2e/.auth/player.json',
    },
    referee: {
        email: process.env.E2E_REFEREE_EMAIL ?? 'referee.test@plyaz.test',
        password: PASSWORD,
        storageState: 'e2e/.auth/referee.json',
    },
} as const;

export type Role = keyof typeof ACCOUNTS;
