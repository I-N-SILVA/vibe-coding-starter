import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError } from '@/lib/api/helpers';

type RouteParams = { params: Promise<{ teamId: string }> };

/**
 * Public endpoint — no auth required.
 * Returns a team profile with players and recent matches.
 */
export async function GET(_request: Request, { params }: RouteParams) {
    const { teamId } = await params;

    // Validate the UUID before it reaches the PostgREST `.or()` filter below —
    // an unvalidated value would allow filter-clause injection on the admin client.
    if (!z.string().uuid().safeParse(teamId).success) {
        return apiError('Invalid team id', 400);
    }

    let supabase;
    try {
        supabase = createAdminClient();
    } catch {
        return apiError('Server configuration error', 503);
    }

    const [teamResult, playersResult, matchesResult] = await Promise.all([
        supabase.from('teams').select('*').eq('id', teamId).single(),
        supabase
            .from('players')
            .select('*')
            .eq('team_id', teamId)
            .order('jersey_number', { ascending: true }),
        supabase
            .from('matches')
            .select(
                `
                *,
                home_team:teams!home_team_id(id, name, short_name, logo_url),
                away_team:teams!away_team_id(id, name, short_name, logo_url)
            `,
            )
            .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
            .not('status', 'in', '("cancelled","postponed")')
            .order('scheduled_at', { ascending: true })
            .limit(5),
    ]);

    if (teamResult.error || !teamResult.data) {
        return apiError('Team not found', 404);
    }

    return NextResponse.json({
        team: teamResult.data,
        players: playersResult.data ?? [],
        matches: matchesResult.data ?? [],
    });
}
