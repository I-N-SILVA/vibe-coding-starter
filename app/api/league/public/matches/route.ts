import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';

/**
 * Public endpoint — no auth required.
 * Returns matches visible to the general public (live, scheduled, completed).
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const competitionId = searchParams.get('competitionId');

    let supabase;
    try {
        supabase = createAdminClient();
    } catch {
        return apiError('Server configuration error', 503);
    }

    let query = supabase.from('matches').select(`
        *,
        home_team:teams!home_team_id(id, name, short_name, logo_url),
        away_team:teams!away_team_id(id, name, short_name, logo_url)
    `);

    if (status) {
        query = query.eq('status', status);
    } else {
        // Default: only show non-cancelled/non-postponed matches
        query = query.not('status', 'in', '("cancelled","postponed")');
    }

    if (competitionId) {
        query = query.eq('competition_id', competitionId);
    }

    const { data, error } = await query.order('scheduled_at', { ascending: true });

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data ?? []);
}
