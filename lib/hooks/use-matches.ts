/**
 * Match Hooks - PLYAZ League Manager
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '@/services/match';
import { queryKeys } from './query-keys';
import type { MatchEvent, UpdateScoreDto } from '@/types';
import type { MatchUI } from '@/lib/mappers';

// ============================================
// MATCH HOOKS
// ============================================

export function useMatches(params?: { status?: string; competitionId?: string }) {
    return useQuery({
        queryKey: queryKeys.matches(params),
        queryFn: () => matchService.getMatches(params),
        staleTime: 30_000,
    });
}

export function useLiveMatches() {
    return useQuery({
        queryKey: queryKeys.matches({ status: 'live' }),
        queryFn: () => matchService.getMatches({ status: 'live' }),
        refetchInterval: 30_000,
        staleTime: 10_000,
    });
}

export function useMatch(id: string) {
    return useQuery({
        queryKey: queryKeys.match(id),
        queryFn: () => matchService.getMatch(id),
        enabled: !!id,
        staleTime: 30_000,
    });
}

export function useCreateMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { competitionId: string; homeTeamId: string; awayTeamId: string; scheduledDate?: string; venueId?: string }) =>
            matchService.createMatch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.matches() });
        },
    });
}

export function useUpdateScore() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateScoreDto) => matchService.updateScore(data.matchId, data.homeScore, data.awayScore),
        onMutate: async (data) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.match(data.matchId) });
            const previous = queryClient.getQueryData<MatchUI>(queryKeys.match(data.matchId));
            queryClient.setQueryData<MatchUI>(queryKeys.match(data.matchId), (old) =>
                old ? { ...old, homeScore: data.homeScore, awayScore: data.awayScore } : old
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
        mutationFn: (data: { matchId: string; playerId?: string; type: MatchEvent['type']; minute?: number; details?: Record<string, unknown> }) =>
            matchService.addMatchEvent(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.matchEvents(variables.matchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.match(variables.matchId) });
        },
    });
}
