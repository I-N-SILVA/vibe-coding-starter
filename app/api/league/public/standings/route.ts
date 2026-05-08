import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';

/**
 * Public endpoint — no auth required.
 * Returns standings for a given competition, joined with team data.
 *
 * Query params:
 *   competitionId  (required)
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get('competitionId');

    if (!competitionId) {
        return apiError('competitionId query param is required', 400);
    }

    let supabase;
    try {
        supabase = createAdminClient();
    } catch {
        return apiError('Server configuration error', 503);
    }

    const { data, error } = await supabase
        .from('standings')
        .select(`
            *,
            team:teams(id, name, short_name, logo_url, primary_color)
        `)
        .eq('competition_id', competitionId)
        .order('points', { ascending: false })
        .order('goal_difference', { ascending: false })
        .order('goals_for', { ascending: false });

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data ?? []);
}
