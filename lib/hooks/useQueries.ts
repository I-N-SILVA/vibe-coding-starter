/**
 * React Query Hooks - PLYAZ League Manager
 * Custom hooks for data fetching with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgService } from '@/services/org';
import { matchService } from '@/services/match';
import { playerService } from '@/services/player';
import { teamService } from '@/services/team';
import { apiClient } from '@/lib/api';
import type {
    CreateCompetitionDto,
    CreateTeamDto,
    CreateMatchDto,
    UpdateScoreDto,
    AddMatchEventDto,
    CreateOrganizationDto,
    CreateInviteDto,
    CreatePlayerDto,
    CreateVenueDto,
    CreateCategoryDto,
    CreateChampionshipConfigDto,
    CreateGroupDto,
    CreateRegistrationDto,
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
    venues: ['venues'] as const,
    categories: ['categories'] as const,
    championshipConfig: (competitionId: string) => ['championshipConfig', competitionId] as const,
    groups: (competitionId: string) => ['groups', competitionId] as const,
    registrations: (competitionId: string) => ['registrations', competitionId] as const,
    competitionStats: (competitionId: string) => ['competitionStats', competitionId] as const,
    playerCareerStats: (playerId: string) => ['playerCareerStats', playerId] as const,
    activity: ['activity'] as const,
};

// ============================================
// ORGANIZATION HOOKS
// ============================================

export function useOrganization() {
    return useQuery({
        queryKey: queryKeys.organization,
        queryFn: () => orgService.getOrganization('current'),
    });
}

export function useActivity() {
    return useQuery({
        queryKey: queryKeys.activity,
        queryFn: () => orgService.getActivity(),
    });
}

export function useCreateOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrganizationDto) => orgService.createOrganization(data.name, data.slug),
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
        queryFn: () => orgService.getCompetitions(),
    });
}

export function useCompetition(id: string) {
    return useQuery({
        queryKey: queryKeys.competition(id),
        queryFn: () => orgService.getCompetition(id),
        enabled: !!id,
    });
}

export function useCreateCompetition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCompetitionDto) => orgService.createCompetition('current', data.name, data.type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.competitions });
        },
    });
}

export function useUpdateCompetition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateCompetitionDto> }) =>
            orgService.updateCompetition(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.competition(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.competitions });
        },
    });
}

export function useDeleteCompetition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => orgService.deleteCompetition(id),
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
        queryFn: () => matchService.getMatches(params),
    });
}

export function useLiveMatches() {
    return useQuery({
        queryKey: queryKeys.matches({ status: 'live' }),
        queryFn: () => matchService.getMatches({ status: 'live' }),
        refetchInterval: 30000,
    });
}

export function useMatch(id: string) {
    return useQuery({
        queryKey: queryKeys.match(id),
        queryFn: () => matchService.getMatch(id),
        enabled: !!id,
    });
}

export function useCreateMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMatchDto) => matchService.createMatch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.matches() });
        },
    });
}

export function useUpdateScore() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateScoreDto) => matchService.updateScore(data.matchId, data.homeScore, data.awayScore),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.match(variables.matchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.matches() });
        },
    });
}

export function useStartMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (matchId: string) => matchService.startMatch(matchId),
        onSuccess: (_, matchId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.match(matchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.matches() });
        },
    });
}

export function useEndMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (matchId: string) => matchService.endMatch(matchId),
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
        queryFn: () => matchService.getMatchEvents(matchId),
        enabled: !!matchId,
    });
}

export function useAddMatchEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddMatchEventDto) => matchService.addMatchEvent(data),
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
        queryFn: () => teamService.getTeams(competitionId),
    });
}

export function useTeam(id: string) {
    return useQuery({
        queryKey: queryKeys.team(id),
        queryFn: () => teamService.getTeam(id),
        enabled: !!id,
    });
}

export function useCreateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTeamDto) => teamService.createTeam(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teams() });
        },
    });
}

export function useUpdateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateTeamDto> }) =>
            teamService.updateTeam(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.team(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.teams() });
        },
    });
}

export function useDeleteTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => teamService.deleteTeam(id),
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
        queryFn: () => playerService.getPlayers(teamId),
        enabled: !!teamId,
    });
}

export function useAllPlayers() {
    return useQuery({
        queryKey: queryKeys.players('all'),
        queryFn: () => playerService.getPlayers(),
    });
}

export function usePlayer(teamId: string, playerId: string) {
    return useQuery({
        queryKey: queryKeys.player(teamId, playerId),
        queryFn: () => playerService.getPlayer(playerId),
        enabled: !!playerId,
    });
}

export function useCreatePlayer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePlayerDto) => apiClient.post('/api/league/players', data),
        onSuccess: (_, variables) => {
            if (variables.teamId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.players(variables.teamId) });
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.players('all') });
        },
    });
}

export function useUpdatePlayer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ playerId, data }: { teamId: string; playerId: string; data: Partial<CreatePlayerDto> }) =>
            apiClient.patch(`/api/league/players/${playerId}`, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.player(variables.teamId, variables.playerId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.players(variables.teamId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.players('all') });
        },
    });
}

export function useRemovePlayer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ playerId }: { teamId: string; playerId: string }) =>
            apiClient.delete(`/api/league/players/${playerId}`),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.players(variables.teamId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.players('all') });
        },
    });
}

// ============================================
// STANDINGS HOOKS
// ============================================

export function useStandings(competitionId: string) {
    return useQuery({
        queryKey: queryKeys.standings(competitionId),
        queryFn: () => apiClient.get(`/api/league/competitions/${competitionId}/standings`),
        enabled: !!competitionId,
    });
}

// ============================================
// INVITE HOOKS
// ============================================

export function useInvites() {
    return useQuery({
        queryKey: queryKeys.invites,
        queryFn: () => apiClient.get('/api/league/invites'),
    });
}

export function useCreateInvite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateInviteDto) => apiClient.post('/api/league/invites', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invites });
        },
    });
}

// ============================================
// VENUE HOOKS
// ============================================

export function useVenues() {
    return useQuery({
        queryKey: queryKeys.venues,
        queryFn: () => apiClient.get('/api/league/venues'),
    });
}

export function useCreateVenue() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateVenueDto) => apiClient.post('/api/league/venues', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.venues });
        },
    });
}

export function useDeleteVenue() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiClient.delete(`/api/league/venues/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.venues });
        },
    });
}

// ============================================
// CATEGORY HOOKS
// ============================================

export function useCategories() {
    return useQuery({
        queryKey: queryKeys.categories,
        queryFn: () => apiClient.get('/api/league/categories'),
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryDto) => apiClient.post('/api/league/categories', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories });
        },
    });
}

// ============================================
// CHAMPIONSHIP CONFIG HOOKS
// ============================================

export function useChampionshipConfig(competitionId: string) {
    return useQuery({
        queryKey: queryKeys.championshipConfig(competitionId),
        queryFn: () => apiClient.get(`/api/league/competitions/${competitionId}/config`),
        enabled: !!competitionId,
    });
}

export function useUpsertChampionshipConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { competitionId: string } & Record<string, unknown>) =>
            apiClient.put(`/api/league/competitions/${data.competitionId}/config`, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.championshipConfig(variables.competitionId),
            });
        },
    });
}

// ============================================
// GROUP HOOKS
// ============================================

export function useGroups(competitionId: string) {
    return useQuery({
        queryKey: queryKeys.groups(competitionId),
        queryFn: () => apiClient.get(`/api/league/competitions/${competitionId}/groups`),
        enabled: !!competitionId,
    });
}

export function useCreateGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateGroupDto) =>
            apiClient.post(`/api/league/competitions/${data.competitionId}/groups`, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.groups(variables.competitionId),
            });
        },
    });
}

export function useExecuteDraw() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { competitionId: string; method: string }) =>
            apiClient.post(`/api/league/competitions/${data.competitionId}/draw`, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.groups(variables.competitionId),
            });
        },
    });
}

// ============================================
// REGISTRATION HOOKS
// ============================================

export function useRegistrations(competitionId: string) {
    return useQuery({
        queryKey: queryKeys.registrations(competitionId),
        queryFn: () => apiClient.get(`/api/league/competitions/${competitionId}/registrations`),
        enabled: !!competitionId,
    });
}

export function useCreateRegistration() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateRegistrationDto) =>
            apiClient.post(`/api/league/competitions/${data.competitionId}/registrations`, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.registrations(variables.competitionId),
            });
        },
    });
}

// ============================================
// STATS HOOKS
// ============================================

export function useCompetitionStats(competitionId: string) {
    return useQuery({
        queryKey: queryKeys.competitionStats(competitionId),
        queryFn: () => apiClient.get(`/api/league/competitions/${competitionId}/stats`),
        enabled: !!competitionId,
    });
}

export function usePlayerCareerStats(playerId: string) {
    return useQuery({
        queryKey: queryKeys.playerCareerStats(playerId),
        queryFn: () => apiClient.get(`/api/league/players/${playerId}/stats`),
        enabled: !!playerId,
    });
}
