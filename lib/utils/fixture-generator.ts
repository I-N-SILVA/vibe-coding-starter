/**
 * Fixture Generation Utilities - PLYAZ League Manager
 * Algorithms for creating round-robin and knockout tournament brackets
 */

type FixtureTeam = { id: string; name: string; short_name?: string | null };

/**
 * Generates Round Robin fixtures for a set of teams
 * @param teams List of participating teams
 * @param startDate Starting date for the fixtures
 * @param intervalDays Days between match days
 * @returns Array of generated matches
 */
export const generateRoundRobin = (
    teams: FixtureTeam[],
    startDate: Date,
    competitionId: string,
    intervalDays: number = 7
): any[] => {
    if (teams.length < 2) return [];

    const teamsCopy = [...teams];
    if (teamsCopy.length % 2 !== 0) {
        // Add a "BYE" team if odd number of teams
        teamsCopy.push({ id: 'bye', name: 'BYE', short_name: 'BYE' });
    }

    const numTeams = teamsCopy.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;
    const fixtures: any[] = [];

    for (let round = 0; round < numRounds; round++) {
        const roundDate = new Date(startDate);
        roundDate.setDate(startDate.getDate() + round * intervalDays);

        for (let match = 0; match < matchesPerRound; match++) {
            const home = teamsCopy[match];
            const away = teamsCopy[numTeams - 1 - match];

            if (home.id !== 'bye' && away.id !== 'bye') {
                fixtures.push({
                    id: `rr-${round}-${match}-${Date.now()}`,
                    competitionId,
                    homeTeam: home,
                    awayTeam: away,
                    homeScore: 0,
                    awayScore: 0,
                    status: 'scheduled',
                    scheduledDate: new Date(roundDate),
                    venue: 'TBD',
                });
            }
        }

        // Rotate teams (keeping first team fixed - Circle Method)
        teamsCopy.splice(1, 0, teamsCopy.pop()!);
    }

    return fixtures;
};

/**
 * Generates Knockout Tournament matches
 * This only generates the first round of a tournament tree.
 */
export const generateKnockout = (
    teams: FixtureTeam[],
    startDate: Date,
    competitionId: string
): any[] => {
    // Shuffle teams for randomization
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const fixtures: any[] = [];

    for (let i = 0; i < shuffledTeams.length; i += 2) {
        if (i + 1 < shuffledTeams.length) {
            fixtures.push({
                id: `ko-r1-${i}-${Date.now()}`,
                competitionId,
                homeTeam: shuffledTeams[i],
                awayTeam: shuffledTeams[i + 1],
                homeScore: 0,
                awayScore: 0,
                status: 'scheduled',
                scheduledDate: startDate,
                venue: 'TBD',
            });
        } else {
            // Handle uneven teams (one team gets a bye to next round)
            // In a real app, you'd mark this as advanced or handle better
        }
    }

    return fixtures;
};
