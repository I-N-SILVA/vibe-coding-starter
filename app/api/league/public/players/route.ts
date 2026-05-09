import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';
import { rateLimit } from '@/lib/api/rate-limit';

/**
 * Public endpoint — no auth required.
 * Returns players whose teams belong to active competitions only.
 * Includes team_name for display on the player cards.
 */
export async function GET(request: Request) {
    const limited = await rateLimit(request, 60, 60_000);
    if (limited) return limited;
    let supabase;
    try {
        supabase = createAdminClient();
    } catch {
        return apiError('Server configuration error', 503);
    }

    // Step 1: get active competition IDs
    const { data: activeComps, error: compError } = await supabase
        .from('competitions')
        .select('id')
        .eq('status', 'active');

    if (compError) {
        return apiError(compError.message, 500);
    }

    const activeCompetitionIds = (activeComps ?? []).map((c: { id: string }) => c.id);

    if (activeCompetitionIds.length === 0) {
        return NextResponse.json([]);
    }

    // Step 2: get team IDs that belong to those competitions, including team name
    const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name')
        .in('competition_id', activeCompetitionIds);

    if (teamsError) {
        return apiError(teamsError.message, 500);
    }

    const teamMap = new Map<string, string>(
        (teams ?? []).map((t: { id: string; name: string }) => [t.id, t.name] as [string, string]),
    );
    const activeTeamIds = Array.from(teamMap.keys());

    if (activeTeamIds.length === 0) {
        return NextResponse.json([]);
    }

    // Step 3: get players in those teams
    const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, name, position, jersey_number, nationality, team_id, status, stats')
        .in('team_id', activeTeamIds)
        .order('name');

    if (playersError) {
        return apiError(playersError.message, 500);
    }

    // Attach team_name to each player
    const result = (players ?? []).map(
        (p: {
            id: string;
            name: string;
            position: string | null;
            jersey_number: number | null;
            nationality: string | null;
            team_id: string;
            status: string | null;
            stats: Record<string, unknown> | null;
        }) => ({
            ...p,
            team_name: teamMap.get(p.team_id) ?? null,
        }),
    );

    return NextResponse.json(result);
}
