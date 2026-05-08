import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';

/**
 * POST /api/admin/recalculate-all-standings
 *
 * Loops over all active competitions and recalculates standings for each one
 * by delegating to the per-competition recalculation logic.
 *
 * Points: Win = 3, Draw = 1, Loss = 0 (standard football rules)
 * Returns: { competitions: N, teams_updated: N }
 */
export async function POST() {
    let supabase;
    try {
        supabase = createAdminClient();
    } catch {
        return apiError('Server configuration error', 503);
    }

    // 1. Fetch all active competitions
    const { data: competitions, error: compError } = await supabase
        .from('competitions')
        .select('id, name')
        .eq('status', 'active');

    if (compError) {
        return apiError(compError.message, 500);
    }

    if (!competitions || competitions.length === 0) {
        return NextResponse.json({ competitions: 0, teams_updated: 0 });
    }

    let totalTeamsUpdated = 0;

    for (const comp of competitions) {
        // 2. Fetch completed matches for this competition
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select('id, home_team_id, away_team_id, home_score, away_score')
            .eq('competition_id', comp.id)
            .eq('status', 'completed');

        if (matchError || !matches || matches.length === 0) {
            continue;
        }

        // 3. Build standings map keyed by team_id
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
                home.won++;
                home.points += 3;
                home.form.push('W');
                away.lost++;
                away.form.push('L');
            } else if (match.home_score < match.away_score) {
                away.won++;
                away.points += 3;
                away.form.push('W');
                home.lost++;
                home.form.push('L');
            } else {
                home.drawn++;
                home.points += 1;
                home.form.push('D');
                away.drawn++;
                away.points += 1;
                away.form.push('D');
            }
        }

        // 4. Prepare upsert rows (last 5 results in form array)
        const standingsRows = Array.from(statsMap.values()).map((s) => ({
            competition_id: comp.id,
            team_id: s.team_id,
            played: s.played,
            won: s.won,
            drawn: s.drawn,
            lost: s.lost,
            goals_for: s.goals_for,
            goals_against: s.goals_against,
            // goal_difference is a generated column — omit from upsert
            points: s.points,
            form: s.form.slice(-5),
            updated_at: new Date().toISOString(),
        }));

        // 5. Upsert — competition_id + team_id are the unique key
        const { data: upserted, error: upsertError } = await supabase
            .from('standings')
            .upsert(standingsRows, { onConflict: 'competition_id,team_id' })
            .select('team_id');

        if (!upsertError && upserted) {
            totalTeamsUpdated += upserted.length;
        }
    }

    return NextResponse.json({
        competitions: competitions.length,
        teams_updated: totalTeamsUpdated,
    });
}
