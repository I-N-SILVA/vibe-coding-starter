/**
 * Match Hooks - PLYAZ League Manager
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '@/services/match';
import { queryKeys } from './query-keys';
import type {
    CreateMatchDto,
    UpdateScoreDto,
    AddMatchEventDto
} from '@/types';

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
            const matchId = variables.matchId || variables.match_id || '';
            if (matchId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.matchEvents(matchId) });
                queryClient.invalidateQueries({ queryKey: queryKeys.match(matchId) });
            }
        },
    });
}
