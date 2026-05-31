import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Shared standings recalculation.
 *
 * Recalculates and upserts the `standings` rows for a single competition from
 * its completed matches. Extracted from the API routes so it can be invoked
 * in-process (e.g. after a match ends) instead of via an HTTP self-call — that
 * removes the previously public, unauthenticated recalculation surface.
 *
 * The caller must pass a Supabase client with write access to `standings`
 * (i.e. a service-role/admin client), since this bypasses RLS by design.
 *
 * Points: Win = 3, Draw = 1, Loss = 0 (standard football rules).
 */
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

export async function recalculateCompetitionStandings(
    supabase: SupabaseClient,
    competitionId: string,
): Promise<{ teamsUpdated: number }> {
    const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('id, home_team_id, away_team_id, home_score, away_score')
        .eq('competition_id', competitionId)
        .eq('status', 'completed');

    if (matchError) {
        throw new Error(matchError.message);
    }

    if (!matches || matches.length === 0) {
        return { teamsUpdated: 0 };
    }

    const statsMap = new Map<string, TeamStats>();

    const getOrInit = (teamId: string): TeamStats => {
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
    };

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

    const standingsRows = Array.from(statsMap.values()).map((s) => ({
        competition_id: competitionId,
        team_id: s.team_id,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goals_for: s.goals_for,
        goals_against: s.goals_against,
        // goal_difference is a generated column — do not include in upsert
        points: s.points,
        form: s.form.slice(-5),
        updated_at: new Date().toISOString(),
    }));

    const { data: upserted, error: upsertError } = await supabase
        .from('standings')
        .upsert(standingsRows, { onConflict: 'competition_id,team_id' })
        .select('team_id');

    if (upsertError) {
        throw new Error(upsertError.message);
    }

    return { teamsUpdated: upserted?.length ?? 0 };
}
