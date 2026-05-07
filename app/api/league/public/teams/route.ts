import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';

/**
 * Public endpoint — no auth required.
 * Returns all teams visible to the general public.
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

    let query = supabase
        .from('teams')
        .select('id, name, short_name, logo_url, primary_color, secondary_color, competition_id');

    if (competitionId) {
        query = query.eq('competition_id', competitionId);
    }

    const { data, error } = await query.order('name');

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data ?? []);
}
