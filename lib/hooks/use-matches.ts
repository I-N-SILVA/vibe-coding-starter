/**
 * Match Hooks - PLYAZ League Manager
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from './query-keys';
import type { Match, MatchEvent, UpdateScoreDto } from '@/types';

// ============================================
// MATCH HOOKS
// ============================================

export function useMatches(params?: { status?: string; competitionId?: string }) {
    return useQuery({
        queryKey: queryKeys.matches(params),
        queryFn: () => {
            const search = new URLSearchParams();
            if (params?.status) search.set('status', params.status);
            if (params?.competitionId) search.set('competitionId', params.competitionId);
            const qs = search.toString();
            return apiClient.get<Match[]>(`/api/league/matches${qs ? `?${qs}` : ''}`);
        },
        staleTime: 30_000,
    });
}

export function useLiveMatches() {
    return useQuery({
        queryKey: queryKeys.matches({ status: 'live' }),
        queryFn: () => apiClient.get<Match[]>('/api/league/matches?status=live'),
        refetchInterval: 30_000,
        staleTime: 10_000,
    });
}

export function useMatch(id: string) {
    return useQuery({
        queryKey: queryKeys.match(id),
        queryFn: () => apiClient.get<Match>(`/api/league/matches/${id}`),
        enabled: !!id,
        staleTime: 30_000,
    });
}

export function useCreateMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { competition_id: string; home_team_id: string; away_team_id: string; scheduled_at?: string; venue_id?: string }) =>
            apiClient.post<Match>('/api/league/matches', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.matches() });
        },
    });
}

export function useUpdateScore() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateScoreDto) =>
            apiClient.patch(`/api/league/matches/${data.matchId}/score`, {
                home_score: data.homeScore,
                away_score: data.awayScore,
                status: data.status,
            }),
        onMutate: async (data) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.match(data.matchId) });
            const previous = queryClient.getQueryData<Match>(queryKeys.match(data.matchId));
            queryClient.setQueryData<Match>(queryKeys.match(data.matchId), (old) =>
                old ? { ...old, home_score: data.homeScore, away_score: data.awayScore } : old
            );
            return { previous };
        },
        onError: (_, vars, ctx) => {
            if (ctx?.previous) {
                queryClient.setQueryData(queryKeys.match(vars.matchId), ctx.previous);
            }
        },
        onSettled: (_, __, vars) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.match(vars.matchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.matches() });
        },
    });
}

export function useStartMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (matchId: string) => apiClient.post(`/api/league/matches/${matchId}/start`, {}),
        onSuccess: (_, matchId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.match(matchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.matches() });
        },
    });
}

export function useEndMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (matchId: string) => apiClient.post(`/api/league/matches/${matchId}/end`, {}),
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
        queryFn: () => apiClient.get<MatchEvent[]>(`/api/league/matches/${matchId}/events`),
        enabled: !!matchId,
    });
}

export function useAddMatchEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { matchId: string; playerId?: string; type: MatchEvent['type']; minute?: number; details?: Record<string, unknown> }) =>
            apiClient.post<MatchEvent>(`/api/league/matches/${data.matchId}/events`, {
                type: data.type,
                player_id: data.playerId,
                minute: data.minute,
                details: data.details,
            }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.matchEvents(variables.matchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.match(variables.matchId) });
        },
    });
}
