import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';

export async function GET(request: Request) {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get('competitionId');
    const type = searchParams.get('type') ?? 'goals'; // goals | assists | cards

    // Get competitions for this org to scope the stats
    let compQuery = supabase.from('competitions').select('id').eq('organization_id', auth.orgId!);

    if (competitionId) {
        compQuery = compQuery.eq('id', competitionId);
    }

    const { data: comps, error: compError } = await compQuery;
    if (compError) return apiError(compError.message, 500);

    const competitionIds = (comps ?? []).map((c: { id: string }) => c.id);
    if (competitionIds.length === 0) return NextResponse.json([]);

    // Aggregate stats per player across competitions
    const { data, error } = await supabase
        .from('player_competition_stats')
        .select(
            'player_id, goals, assists, yellow_cards, red_cards, games_played, players(id, name, position, avatar_url, jersey_number, nationality, team_id)',
        )
        .in('competition_id', competitionIds);

    if (error) return apiError(error.message, 500);

    type PlayerEntry = {
        player_id: string;
        name: string;
        position: string | null;
        avatar_url: string | null;
        jersey_number: number | null;
        nationality: string | null;
        team_id: string | null;
        goals: number;
        assists: number;
        yellow_cards: number;
        red_cards: number;
        games_played: number;
    };

    // Group by player_id and sum
    const playerMap = new Map<string, PlayerEntry>();

    for (const row of data ?? []) {
        const p = Array.isArray(row.players) ? row.players[0] : row.players;
        if (!p) continue;
        const existing = playerMap.get(row.player_id);
        if (existing) {
            existing.goals += row.goals ?? 0;
            existing.assists += row.assists ?? 0;
            existing.yellow_cards += row.yellow_cards ?? 0;
            existing.red_cards += row.red_cards ?? 0;
            existing.games_played += row.games_played ?? 0;
        } else {
            playerMap.set(row.player_id, {
                player_id: row.player_id,
                name: (p as { name?: string | null }).name ?? 'Unknown',
                position: (p as { position?: string | null }).position ?? null,
                avatar_url: (p as { avatar_url?: string | null }).avatar_url ?? null,
                jersey_number: (p as { jersey_number?: number | null }).jersey_number ?? null,
                nationality: (p as { nationality?: string | null }).nationality ?? null,
                team_id: (p as { team_id?: string | null }).team_id ?? null,
                goals: row.goals ?? 0,
                assists: row.assists ?? 0,
                yellow_cards: row.yellow_cards ?? 0,
                red_cards: row.red_cards ?? 0,
                games_played: row.games_played ?? 0,
            });
        }
    }

    const players = Array.from(playerMap.values());

    const sortKey = type === 'assists' ? 'assists' : type === 'cards' ? 'yellow_cards' : 'goals';
    players.sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));

    return NextResponse.json(players.slice(0, 20));
}
