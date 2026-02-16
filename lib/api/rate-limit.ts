import { NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter for API mutation endpoints.
 * Uses a sliding window approach per IP address.
 *
 * For production at scale, consider using Vercel Edge Rate Limiting
 * or Redis-based rate limiting (e.g., @upstash/ratelimit).
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entry] of store) {
        if (now > entry.resetAt) {
            store.delete(key);
        }
    }
}

/**
 * Check rate limit for a request.
 * Returns null if allowed, or a 429 NextResponse if rate limited.
 *
 * @param request - The incoming request
 * @param limit - Maximum requests per window (default: 30)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 */
export function rateLimit(
    request: Request,
    limit: number = 30,
    windowMs: number = 60_000
): NextResponse | null {
    cleanup();

    // Extract identifier: prefer X-Forwarded-For (Vercel), fallback to generic key
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const key = `${ip}:${new URL(request.url).pathname}`;

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return null;
    }

    entry.count++;

    if (entry.count > limit) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'Retry-After': String(retryAfter),
                    'X-RateLimit-Limit': String(limit),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(entry.resetAt),
                },
            }
        );
    }

    return null;
}
