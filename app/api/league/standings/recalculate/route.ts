import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';

/**
 * POST /api/league/standings/recalculate
 *
 * Recalculates standings for a given competition from completed match results.
 * Uses the service-role client to bypass RLS — this is a management operation.
 *
 * Body: { competitionId: string }
 *
 * Points: Win = 3, Draw = 1, Loss = 0 (standard football rules)
 */
export async function POST(request: Request) {
    let body: { competitionId?: string };
    try {
        body = await request.json();
    } catch {
        return apiError('Invalid JSON body', 400);
    }

    const { competitionId } = body;
    if (!competitionId) {
        return apiError('competitionId is required', 400);
    }

    let supabase;
    try {
        supabase = createAdminClient();
    } catch {
        return apiError('Server configuration error', 503);
    }

    // 1. Fetch all completed matches for the competition
    const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('id, home_team_id, away_team_id, home_score, away_score')
        .eq('competition_id', competitionId)
        .eq('status', 'completed');

    if (matchError) {
        return apiError(matchError.message, 500);
    }

    if (!matches || matches.length === 0) {
        return NextResponse.json({ message: 'No completed matches found', standings: [] });
    }

    // 2. Build standings map keyed by team_id
    type TeamStats = {
        team_id: string;
        played: number;
        won: number;
        drawn: number;
        lost: number;
        goals_for: number;
        goals_against: number;
        points: number;
        form: string[];
    };

    const statsMap = new Map<string, TeamStats>();

    function getOrInit(teamId: string): TeamStats {
        if (!statsMap.has(teamId)) {
            statsMap.set(teamId, {
                team_id: teamId,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goals_for: 0,
                goals_against: 0,
                points: 0,
                form: [],
            });
        }
        return statsMap.get(teamId)!;
    }

    for (const match of matches) {
        const home = getOrInit(match.home_team_id);
        const away = getOrInit(match.away_team_id);

        home.played++;
        away.played++;
        home.goals_for += match.home_score;
        home.goals_against += match.away_score;
        away.goals_for += match.away_score;
        away.goals_against += match.home_score;

        if (match.home_score > match.away_score) {
            // Home win
            home.won++;
            home.points += 3;
            home.form.push('W');
            away.lost++;
            away.form.push('L');
        } else if (match.home_score < match.away_score) {
            // Away win
            away.won++;
            away.points += 3;
            away.form.push('W');
            home.lost++;
            home.form.push('L');
        } else {
            // Draw
            home.drawn++;
            home.points += 1;
            home.form.push('D');
            away.drawn++;
            away.points += 1;
            away.form.push('D');
        }
    }

    // 3. Keep only the last 5 results in form array
    const standingsRows = Array.from(statsMap.values()).map((s) => ({
        competition_id: competitionId,
        team_id: s.team_id,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goals_for: s.goals_for,
        goals_against: s.goals_against,
        // goal_difference is a generated/computed column — do not include in upsert
        points: s.points,
        form: s.form.slice(-5),
        updated_at: new Date().toISOString(),
    }));

    // 4. Upsert — competition_id + team_id are the unique key
    const { data: upserted, error: upsertError } = await supabase
        .from('standings')
        .upsert(standingsRows, { onConflict: 'competition_id,team_id' })
        .select();

    if (upsertError) {
        return apiError(upsertError.message, 500);
    }

    return NextResponse.json({
        message: `Standings recalculated for ${standingsRows.length} teams`,
        standings: upserted,
    });
}
