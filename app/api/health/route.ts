import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const revalidate = 0;

/**
 * Health check endpoint — also serves as Supabase keep-alive.
 * Supabase free tier pauses after 7 days of inactivity.
 * Ping this endpoint every 3-4 days via cron (GitHub Actions, cron-job.org, etc.)
 *
 * GET /api/health
 */
export async function GET() {
    const start = Date.now();
    const checks: Record<string, { status: string; latencyMs?: number; message?: string }> = {};

    // Supabase connectivity check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
            const supabase = await createClient();
            const dbStart = Date.now();
            // Lightweight query — just checks connectivity without loading data
            const { error } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
            checks.database = {
                status: error ? 'degraded' : 'ok',
                latencyMs: Date.now() - dbStart,
                ...(error ? { message: error.message } : {}),
            };
        } catch (e) {
            checks.database = { status: 'error', message: String(e) };
        }
    } else {
        checks.database = { status: 'unconfigured', message: 'Supabase env vars not set' };
    }

    const allOk = Object.values(checks).every(c => c.status === 'ok' || c.status === 'unconfigured');

    return NextResponse.json(
        {
            status: allOk ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            uptimeMs: Date.now() - start,
            checks,
        },
        {
            status: allOk ? 200 : 503,
            headers: { 'Cache-Control': 'no-store' },
        }
    );
}
