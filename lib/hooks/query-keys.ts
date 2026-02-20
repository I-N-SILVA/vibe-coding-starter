/**
 * Query Keys - PLYAZ League Manager
 * Centralized query key factory for React Query
 */

export const queryKeys = {
    competitions: ['competitions'] as const,
    competition: (id: string) => ['competition', id] as const,
    matches: (params?: { status?: string; competitionId?: string }) =>
        ['matches', params] as const,
    match: (id: string) => ['match', id] as const,
    matchEvents: (matchId: string) => ['matchEvents', matchId] as const,
    teams: (competitionId?: string) => ['teams', competitionId] as const,
    team: (id: string) => ['team', id] as const,
    players: (teamId: string) => ['players', teamId] as const,
    player: (teamId: string, playerId: string) => ['player', teamId, playerId] as const,
    standings: (competitionId: string) => ['standings', competitionId] as const,
    organization: ['organization'] as const,
    invites: ['invites'] as const,
    venues: ['venues'] as const,
    categories: ['categories'] as const,
    championshipConfig: (competitionId: string) => ['championshipConfig', competitionId] as const,
    groups: (competitionId: string) => ['groups', competitionId] as const,
    registrations: (competitionId: string) => ['registrations', competitionId] as const,
    competitionStats: (competitionId: string) => ['competitionStats', competitionId] as const,
    playerCareerStats: (playerId: string) => ['playerCareerStats', playerId] as const,
    activity: ['activity'] as const,
};
