import { test, expect } from '@playwright/test';

test.describe('API Security', () => {
    test('GET /api/league/teams returns 401 without auth', async ({ request }) => {
        const res = await request.get('/api/league/teams');
        expect(res.status()).toBe(401);
    });

    test('GET /api/league/competitions returns 401 without auth', async ({ request }) => {
        const res = await request.get('/api/league/competitions');
        expect(res.status()).toBe(401);
    });

    test('GET /api/league/matches returns 401 without auth', async ({ request }) => {
        const res = await request.get('/api/league/matches');
        expect(res.status()).toBe(401);
    });

    test('POST /api/league/teams returns 401 without auth', async ({ request }) => {
        const res = await request.post('/api/league/teams', {
            data: { name: 'Test Team', short_name: 'TST' },
        });
        expect(res.status()).toBe(401);
    });

    test('POST /api/league/organizations returns 401 without auth', async ({ request }) => {
        const res = await request.post('/api/league/organizations', {
            data: { name: 'Test Org', slug: 'test-org' },
        });
        expect(res.status()).toBe(401);
    });

    test('POST /api/league/competitions returns 401 without auth', async ({ request }) => {
        const res = await request.post('/api/league/competitions', {
            data: { name: 'Test League', type: 'league' },
        });
        expect(res.status()).toBe(401);
    });
 
    test('PATCH /api/league/matches/any-id/score returns 401 without auth', async ({ request }) => {
        const res = await request.patch('/api/league/matches/123/score', {
            data: { homeScore: 1, awayScore: 0 },
        });
        expect(res.status()).toBe(401);
    });

    test('Rate limiting: returns 429 after threshold', async ({ request }) => {
        // The rate limit in app/api/league/matches/[id]/score/route.ts is 30 per minute
        // We'll hit it 35 times to trigger a 429.
        // NOTE: This might be slow in CI, but here we are testing the actual limiter logic.
        const matchId = 'any-id';
        for (let i = 0; i < 30; i++) {
            await request.patch(`/api/league/matches/${matchId}/score`, {
                data: { homeScore: 1, awayScore: 0 },
            });
        }
        const res = await request.patch(`/api/league/matches/${matchId}/score`, {
            data: { homeScore: 1, awayScore: 0 },
        });
        expect(res.status()).toBe(429);
        const data = await res.json();
        expect(data.error).toContain('Too many requests');
    });

    test('API returns proper CORS and security headers', async ({ request }) => {
        const res = await request.get('/api/league/teams');
        const headers = res.headers();
        // CSP header should be present
        expect(headers['content-security-policy']).toBeDefined();
        // X-Frame-Options
        expect(headers['x-frame-options']).toBe('DENY');
        // X-Content-Type-Options
        expect(headers['x-content-type-options']).toBe('nosniff');
    });
});
