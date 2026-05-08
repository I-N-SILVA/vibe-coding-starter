import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Public endpoint — no auth required.
 * Returns safe public player data for the shareable player card.
 */
export async function GET(_request: Request, { params }: RouteParams) {
    const { id } = await params;

    let supabase;
    try {
        supabase = createAdminClient();
    } catch {
        return apiError('Server configuration error', 503);
    }

    const { data: player, error } = await supabase
        .from('players')
        .select('id, name, position, jersey_number, nationality, bio, stats, team_id, photo_url')
        .eq('id', id)
        .single();

    if (error || !player) {
        return apiError('Player not found', 404);
    }

    // Fetch team info separately (no joins to keep it explicit)
    const { data: team } = await supabase
        .from('teams')
        .select('id, name, short_name, primary_color, logo_url')
        .eq('id', player.team_id)
        .single();

    // Fetch aggregated career stats
    const { data: statsRows } = await supabase
        .from('player_competition_stats')
        .select('goals, assists, games_played, yellow_cards, red_cards, minutes_played')
        .eq('player_id', id);

    type StatRow = {
        goals: number;
        assists: number;
        games_played: number;
        yellow_cards: number;
        red_cards: number;
        minutes_played: number;
    };
    const careerStats = (statsRows ?? []).reduce(
        (acc: StatRow, row: StatRow) => ({
            goals: acc.goals + (row.goals ?? 0),
            assists: acc.assists + (row.assists ?? 0),
            games_played: acc.games_played + (row.games_played ?? 0),
            yellow_cards: acc.yellow_cards + (row.yellow_cards ?? 0),
            red_cards: acc.red_cards + (row.red_cards ?? 0),
            minutes_played: acc.minutes_played + (row.minutes_played ?? 0),
        }),
        { goals: 0, assists: 0, games_played: 0, yellow_cards: 0, red_cards: 0, minutes_played: 0 },
    );

    return NextResponse.json({
        player: {
            id: player.id,
            name: player.name,
            position: player.position,
            jersey_number: player.jersey_number,
            nationality: player.nationality,
            bio: player.bio,
            stats: player.stats,
            photo_url: player.photo_url,
        },
        team: team ?? null,
        careerStats,
    });
}
