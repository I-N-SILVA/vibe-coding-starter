import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';

/**
 * Public endpoint — no auth required.
 * Returns teams that belong to active competitions only.
 * Optionally filtered by a specific competitionId.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
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

    const { data, error } = await supabase
        .from('teams')
        .select('id, name, short_name, logo_url, primary_color, secondary_color, competition_id')
        .in('competition_id', activeCompetitionIds)
        .order('name');

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data ?? []);
}
