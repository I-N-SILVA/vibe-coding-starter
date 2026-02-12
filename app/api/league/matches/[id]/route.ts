import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('matches')
        .select(`
            *,
            home_team:teams!home_team_id(*),
            away_team:teams!away_team_id(*),
            referee:profiles!referee_id(id, full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

    if (error) {
        return apiError(error.message, error.code === 'PGRST116' ? 404 : 500);
    }

    return NextResponse.json(data);
}
