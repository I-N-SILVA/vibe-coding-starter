/**
 * React Query Hooks - PLYAZ League Manager
 * Custom hooks for data fetching with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leagueApi, teamsApi } from '@/lib/api';
import type {
    CreateCompetitionDto,
    CreateTeamDto,
    CreateMatchDto,
    UpdateScoreDto,
    AddMatchEventDto,
    CreateOrganizationDto,
    CreateInviteDto,
    CreatePlayerDto,
} from '@/types';

// ============================================
// QUERY KEYS
// ============================================

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
};

// ============================================
// ORGANIZATION HOOKS
// ============================================

export function useOrganization() {
    return useQuery({
        queryKey: queryKeys.organization,
        queryFn: () => leagueApi.getOrganization(),
    });
}

export function useCreateOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrganizationDto) => leagueApi.createOrganization(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.organization });
        },
    });
}

// ============================================
// COMPETITION HOOKS
// ============================================

export function useCompetitions() {
    return useQuery({
        queryKey: queryKeys.competitions,
        queryFn: () => leagueApi.getCompetitions(),
    });
}

export function useCompetition(id: string) {
    return useQuery({
        queryKey: queryKeys.competition(id),
        queryFn: () => leagueApi.getCompetition(id),
        enabled: !!id,
    });
}

export function useCreateCompetition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCompetitionDto) => leagueApi.createCompetition(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.competitions });
        },
    });
}

export function useUpdateCompetition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateCompetitionDto> }) =>
            leagueApi.updateCompetition(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.competition(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.competitions });
        },
    });
}

export function useDeleteCompetition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => leagueApi.deleteCompetition(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.competitions });
        },
    });
}

// ============================================
// MATCH HOOKS
// ============================================

export function useMatches(params?: { status?: string; competitionId?: string }) {
    return useQuery({
        queryKey: queryKeys.matches(params),
        queryFn: () => leagueApi.getMatches(params),
    });
}

export function useLiveMatches() {
    return useQuery({
        queryKey: queryKeys.matches({ status: 'live' }),
        queryFn: () => leagueApi.getMatches({ status: 'live' }),
        refetchInterval: 30000,
    });
}

export function useMatch(id: string) {
    return useQuery({
        queryKey: queryKeys.match(id),
        queryFn: () => leagueApi.getMatch(id),
        enabled: !!id,
    });
}

export function useCreateMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMatchDto) => leagueApi.createMatch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.matches() });
        },
    });
}

export function useUpdateScore() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateScoreDto) => leagueApi.updateScore(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.match(variables.matchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.matches() });
        },
    });
}

export function useStartMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (matchId: string) => leagueApi.startMatch(matchId),
        onSuccess: (_, matchId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.match(matchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.matches() });
        },
    });
}

export function useEndMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (matchId: string) => leagueApi.endMatch(matchId),
        onSuccess: (_, matchId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.match(matchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.matches() });
        },
    });
}

// ============================================
// MATCH EVENT HOOKS
// ============================================

export function useMatchEvents(matchId: string) {
    return useQuery({
        queryKey: queryKeys.matchEvents(matchId),
        queryFn: () => leagueApi.getMatchEvents(matchId),
        enabled: !!matchId,
    });
}

export function useAddMatchEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddMatchEventDto) => leagueApi.addMatchEvent(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.matchEvents(variables.matchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.match(variables.matchId) });
        },
    });
}

// ============================================
// TEAM HOOKS
// ============================================

export function useTeams(competitionId?: string) {
    return useQuery({
        queryKey: queryKeys.teams(competitionId),
        queryFn: () => teamsApi.getTeams(competitionId),
    });
}

export function useTeam(id: string) {
    return useQuery({
        queryKey: queryKeys.team(id),
        queryFn: () => teamsApi.getTeam(id),
        enabled: !!id,
    });
}

export function useCreateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTeamDto) => teamsApi.createTeam(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teams() });
        },
    });
}

export function useUpdateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateTeamDto> }) =>
            teamsApi.updateTeam(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.team(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.teams() });
        },
    });
}

export function useDeleteTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => teamsApi.deleteTeam(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teams() });
        },
    });
}

// ============================================
// PLAYER HOOKS
// ============================================

export function usePlayers(teamId: string) {
    return useQuery({
        queryKey: queryKeys.players(teamId),
        queryFn: () => teamsApi.getPlayers(teamId),
        enabled: !!teamId,
    });
}

export function usePlayer(teamId: string, playerId: string) {
    return useQuery({
        queryKey: queryKeys.player(teamId, playerId),
        queryFn: () => teamsApi.getPlayer(teamId, playerId),
        enabled: !!teamId && !!playerId,
    });
}

export function useAddPlayer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, data }: { teamId: string; data: CreatePlayerDto }) =>
            teamsApi.addPlayer(teamId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.players(variables.teamId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.team(variables.teamId) });
        },
    });
}

export function useUpdatePlayer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, playerId, data }: { teamId: string; playerId: string; data: Partial<CreatePlayerDto> }) =>
            teamsApi.updatePlayer(teamId, playerId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.player(variables.teamId, variables.playerId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.players(variables.teamId) });
        },
    });
}

export function useRemovePlayer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, playerId }: { teamId: string; playerId: string }) =>
            teamsApi.removePlayer(teamId, playerId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.players(variables.teamId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.team(variables.teamId) });
        },
    });
}

// ============================================
// STANDINGS HOOKS
// ============================================

export function useStandings(competitionId: string) {
    return useQuery({
        queryKey: queryKeys.standings(competitionId),
        queryFn: () => leagueApi.getStandings(competitionId),
        enabled: !!competitionId,
    });
}

// ============================================
// INVITE HOOKS
// ============================================

export function useInvites() {
    return useQuery({
        queryKey: queryKeys.invites,
        queryFn: () => leagueApi.getInvites(),
    });
}

export function useCreateInvite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateInviteDto) => leagueApi.createInvite(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invites });
        },
    });
}
