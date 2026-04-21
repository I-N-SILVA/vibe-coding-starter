/**
 * Stats Aggregator - PLYAZ League Manager
 * Aggregates player statistics from match events.
 */

export type MatchEventInput = {
    type: string;
    player_id: string | null;
    team_id: string | null;
};

export type AggregatedStats = {
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
};

/**
 * Counts goals, assists, yellow cards, and red cards from match events
 * for a specific player.
 */
export function aggregatePlayerStats(
    events: MatchEventInput[],
    playerId: string,
): AggregatedStats {
    const stats: AggregatedStats = {
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
    };

    for (const event of events) {
        if (event.player_id !== playerId) {
            continue;
        }

        switch (event.type) {
            case 'goal':
            case 'penalty':
                stats.goals += 1;
                break;
            case 'assist':
                stats.assists += 1;
                break;
            case 'yellow_card':
                stats.yellowCards += 1;
                break;
            case 'red_card':
                stats.redCards += 1;
                break;
        }
    }

    return stats;
}

/**
 * Calculates a team's form (e.g., 'WWWDL') from their last X matches.
 * Returns an array of 'W' | 'D' | 'L'.
 */
export function calculateTeamForm(
    matches: { home_team_id: string; away_team_id: string; home_score: number; away_score: number; status: string }[],
    teamId: string,
    limit: number = 5
): ('W' | 'D' | 'L')[] {
    const teamMatches = matches
        .filter((m) => m.status === 'completed' && (m.home_team_id === teamId || m.away_team_id === teamId))
        .slice(0, limit);

    return teamMatches.map((m) => {
        const isHome = m.home_team_id === teamId;
        const score = isHome ? m.home_score : m.away_score;
        const opponentScore = isHome ? m.away_score : m.home_score;

        if (score > opponentScore) return 'W';
        if (score < opponentScore) return 'L';
        return 'D';
    });
}
