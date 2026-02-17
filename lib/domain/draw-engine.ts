/**
 * Draw Engine - PLYAZ League Manager
 * Handles random team draws and round-robin fixture generation.
 */

/**
 * Shuffles teams randomly and distributes them round-robin across groups.
 */
export function randomDraw(
    teams: { id: string }[],
    groupCount: number,
): { teamId: string; groupIndex: number }[] {
    if (groupCount <= 0) {
        return [];
    }

    // Fisher-Yates shuffle
    const shuffled = [...teams];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Round-robin distribution across groups
    return shuffled.map((team, index) => ({
        teamId: team.id,
        groupIndex: index % groupCount,
    }));
}

/**
 * Generates a round-robin schedule where each team plays every other team exactly once.
 * Uses the circle method (rotate all but the first element) to produce balanced rounds.
 */
export function generateRoundRobinFixtures(
    teamIds: string[],
): { homeTeamId: string; awayTeamId: string; round: number }[] {
    if (teamIds.length < 2) {
        return [];
    }

    const ids = [...teamIds];
    // If odd number of teams, add a bye placeholder
    const hasBye = ids.length % 2 !== 0;
    if (hasBye) {
        ids.push('__BYE__');
    }

    const n = ids.length;
    const totalRounds = n - 1;
    const fixtures: { homeTeamId: string; awayTeamId: string; round: number }[] = [];

    // Circle method: fix the first team, rotate the rest
    const fixed = ids[0];
    const rotating = ids.slice(1);

    for (let round = 0; round < totalRounds; round++) {
        // First match: fixed vs current top of rotating array
        const opponent = rotating[0];
        if (fixed !== '__BYE__' && opponent !== '__BYE__') {
            fixtures.push({
                homeTeamId: fixed,
                awayTeamId: opponent,
                round: round + 1,
            });
        }

        // Remaining matches: pair from outside in
        for (let i = 1; i < n / 2; i++) {
            const home = rotating[i];
            const away = rotating[n - 2 - i]; // n-2 because rotating has n-1 elements, 0-indexed
            if (home !== '__BYE__' && away !== '__BYE__') {
                fixtures.push({
                    homeTeamId: home,
                    awayTeamId: away,
                    round: round + 1,
                });
            }
        }

        // Rotate: move last element to the front
        const last = rotating.pop()!;
        rotating.unshift(last);
    }

    return fixtures;
}
