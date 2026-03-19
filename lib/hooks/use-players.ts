/**
 * Player Hooks - PLYAZ League Manager
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playerService } from '@/services/player';
import { apiClient } from '@/lib/api';
import { queryKeys } from './query-keys';
import type { CreatePlayerDto } from '@/types';

export function usePlayers(teamId: string) {
    return useQuery({
        queryKey: queryKeys.players(teamId),
        queryFn: () => playerService.getPlayers(teamId),
        enabled: !!teamId,
        staleTime: 30_000,
    });
}

export function useAllPlayers() {
    return useQuery({
        queryKey: queryKeys.players('all'),
        queryFn: () => playerService.getPlayers(),
        staleTime: 30_000,
    });
}

export function useCurrentPlayer(profileId?: string) {
    return useQuery({
        queryKey: ['player', 'current', profileId],
        queryFn: async () => {
            if (!profileId) return null;
            const players = await playerService.getPlayers();
            return players.find((p: any) => p.profile_id === profileId) || null;
        },
        enabled: !!profileId,
        staleTime: 30_000,
    });
}

export function usePlayer(teamId: string, playerId: string) {
    return useQuery({
        queryKey: queryKeys.player(teamId, playerId),
        queryFn: () => playerService.getPlayer(playerId),
        enabled: !!playerId,
        staleTime: 30_000,
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

export function usePlayerCareerStats(playerId: string) {
    return useQuery({
        queryKey: queryKeys.playerCareerStats(playerId),
        queryFn: () => apiClient.get(`/api/league/players/${playerId}/stats`),
        enabled: !!playerId,
    });
}
