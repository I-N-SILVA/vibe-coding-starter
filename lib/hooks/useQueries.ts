/**
 * React Query Hooks - PLYAZ League Manager
 * Custom hooks for data fetching with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leagueApi, teamsApi } from '@/lib/api';
import type {
    Competition,
    Match,
    Team,
    StandingsEntry,
    CreateCompetitionDto,
    CreateTeamDto,
    CreateMatchDto,
    UpdateScoreDto,
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
    teams: (competitionId?: string) => ['teams', competitionId] as const,
    team: (id: string) => ['team', id] as const,
    standings: (competitionId: string) => ['standings', competitionId] as const,
};

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
        // Live matches should refresh frequently
        refetchInterval: 30000, // 30 seconds
    });
}

export function useMatch(id: string) {
    return useQuery({
        queryKey: queryKeys.match(id),
        queryFn: () => leagueApi.getMatch(id),
        enabled: !!id,
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

export function useCreateMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMatchDto) => leagueApi.createMatch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.matches() });
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
