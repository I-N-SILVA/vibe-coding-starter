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
