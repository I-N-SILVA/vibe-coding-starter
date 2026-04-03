import { NextResponse } from 'next/server';

/**
 * Rate Limiter — PLYAZ League Manager
 *
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL is configured (production/staging).
 * Falls back to in-memory sliding window for local dev without Redis.
 *
 * Upstash setup:
 *   1. Create a free Redis DB at console.upstash.com
 *   2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local
 */

// ─── In-memory fallback ────────────────────────────────────────────────────

interface MemEntry { count: number; resetAt: number }
const store = new Map<string, MemEntry>();
let lastCleanup = Date.now();

function memoryCheck(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    if (now - lastCleanup > 60_000) {
        lastCleanup = now;
        for (const [k, v] of store) if (now > v.resetAt) store.delete(k);
    }
    const entry = store.get(key);
    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return false;
    }
    return ++entry.count > limit;
}

// ─── Upstash Redis ─────────────────────────────────────────────────────────

async function redisCheck(key: string, limit: number, windowMs: number): Promise<boolean> {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');
    const ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
        analytics: true,
        prefix: 'rl:plyaz',
    });
    const { success } = await ratelimit.limit(key);
    return !success;
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Check rate limit for a request.
 * Returns null if allowed, or a 429 NextResponse if rate limited.
 *
 * NOTE: now async — all call sites must await this.
 */
export async function rateLimit(
    request: Request,
    limit: number = 30,
    windowMs: number = 60_000
): Promise<NextResponse | null> {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim().replace(/[^\d.a-fA-F:]/g, '') || 'unknown';
    const key = `${ip}:${new URL(request.url).pathname}`;
    const useRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

    let limited: boolean;
    try {
        limited = useRedis ? await redisCheck(key, limit, windowMs) : memoryCheck(key, limit, windowMs);
    } catch {
        limited = false; // fail open — availability over strict limiting
    }

    if (!limited) return null;

    return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
            status: 429,
            headers: {
                'Retry-After': String(Math.ceil(windowMs / 1000)),
                'X-RateLimit-Limit': String(limit),
                'X-RateLimit-Remaining': '0',
            },
        }
    );
}
