import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';
import { rateLimit } from '@/lib/api/rate-limit';

/**
 * Public endpoint — no auth required.
 * Returns matches that belong to active competitions only.
 * Optionally filtered by status and/or competitionId.
 */
export async function GET(request: Request) {
    const limited = await rateLimit(request, 60, 60_000);
    if (limited) return limited;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const competitionId = searchParams.get('competitionId');

    let supabase;
    try {
        supabase = createAdminClient();
    } catch {
        return apiError('Server configuration error', 503);
    }

    // First: resolve which competitions are active
    let compQuery = supabase.from('competitions').select('id').eq('status', 'active');

    if (competitionId) {
        compQuery = compQuery.eq('id', competitionId);
    }

    const { data: activeComps, error: compError } = await compQuery;

    if (compError) {
        return apiError(compError.message, 500);
    }

    const activeCompetitionIds = (activeComps ?? []).map((c: { id: string }) => c.id);

    if (activeCompetitionIds.length === 0) {
        return NextResponse.json([]);
    }

    let query = supabase
        .from('matches')
        .select(
            `
        *,
        home_team:teams!home_team_id(id, name, short_name, logo_url),
        away_team:teams!away_team_id(id, name, short_name, logo_url)
    `,
        )
        .in('competition_id', activeCompetitionIds);

    if (status) {
        query = query.eq('status', status);
    } else {
        // Default: only show non-cancelled/non-postponed matches
        query = query.not('status', 'in', '("cancelled","postponed")');
    }

    const { data, error } = await query.order('scheduled_at', { ascending: true });

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data ?? []);
}
