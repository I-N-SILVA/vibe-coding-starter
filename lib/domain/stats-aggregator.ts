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
