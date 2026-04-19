import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';

/**
 * Public endpoint — no auth required.
 * Returns active/completed competitions visible to the general public.
 */
export async function GET() {
    let supabase;
    try {
        supabase = createAdminClient();
    } catch {
        return apiError('Server configuration error', 503);
    }

    const { data, error } = await supabase
        .from('competitions')
        .select('id, name, type, status, start_date, end_date, max_teams, season, year')
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false });

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data ?? []);
}
