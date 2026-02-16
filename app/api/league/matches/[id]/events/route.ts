import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { createMatchEventApiSchema } from '@/lib/api/validation';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('match_id', id)
        .order('minute', { ascending: true });

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, createMatchEventApiSchema);
    if (parsed.error) return parsed.error;

    const eventData = parsed.data;

    // ------------------------------------------------------------------
    // 3.4  Validate player-team association & team belongs to match
    // ------------------------------------------------------------------
    if (eventData.team_id) {
        // Verify team_id is one of the match's home or away team
        const { data: match, error: matchErr } = await supabase
            .from('matches')
            .select('home_team_id, away_team_id')
            .eq('id', id)
            .single();

        if (matchErr || !match) {
            return apiError('Match not found', 404);
        }

        if (
            match.home_team_id !== eventData.team_id &&
            match.away_team_id !== eventData.team_id
        ) {
            return apiError(
                'team_id must be one of the match\'s home or away team',
                400
            );
        }

        // Verify the player belongs to the provided team
        if (eventData.player_id) {
            const { data: player, error: playerErr } = await supabase
                .from('players')
                .select('team_id')
                .eq('id', eventData.player_id)
                .single();

            if (playerErr || !player) {
                return apiError('Player not found', 404);
            }

            if (player.team_id !== eventData.team_id) {
                return apiError(
                    'Player does not belong to the specified team',
                    400
                );
            }
        }
    }

    // ------------------------------------------------------------------
    // Insert the match event
    // ------------------------------------------------------------------
    const { data, error } = await supabase
        .from('match_events')
        .insert([{ ...eventData, match_id: id }])
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    // ------------------------------------------------------------------
    // 3.3  Auto-update player stats based on event type
    // ------------------------------------------------------------------
    if (eventData.player_id) {
        await updatePlayerStats(supabase, eventData.player_id, eventData.type);
    }

    // For substitutions, if details contain a sub_in player, increment their appearances
    if (
        eventData.type === 'substitution' &&
        eventData.details &&
        typeof eventData.details === 'object' &&
        'sub_in_player_id' in eventData.details &&
        typeof eventData.details.sub_in_player_id === 'string'
    ) {
        await updatePlayerStats(
            supabase,
            eventData.details.sub_in_player_id as string,
            'sub_in'
        );
    }

    return NextResponse.json(data, { status: 201 });
}

// ------------------------------------------------------------------
// Stat update helper
// ------------------------------------------------------------------

type StatEventType = string;

async function updatePlayerStats(
    supabase: Awaited<ReturnType<typeof createClient>>,
    playerId: string,
    eventType: StatEventType
): Promise<void> {
    // Fetch current stats
    const { data: player } = await supabase
        .from('players')
        .select('stats')
        .eq('id', playerId)
        .single();

    if (!player) return;

    const stats: Record<string, number> = (player.stats as Record<string, number>) ?? {};

    switch (eventType) {
        case 'goal':
        case 'penalty':
            stats.goals = (stats.goals ?? 0) + 1;
            break;
        case 'yellow_card':
            stats.yellow_cards = (stats.yellow_cards ?? 0) + 1;
            break;
        case 'red_card':
            stats.red_cards = (stats.red_cards ?? 0) + 1;
            break;
        case 'sub_in':
            stats.appearances = (stats.appearances ?? 0) + 1;
            break;
        default:
            // No stat update for other event types
            return;
    }

    await supabase
        .from('players')
        .update({ stats })
        .eq('id', playerId);
}
