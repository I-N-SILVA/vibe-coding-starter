/**
 * Player Hooks - PLYAZ League Manager
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from './query-keys';
import type { CreatePlayerDto } from '@/types';
import type { Player } from '@/lib/supabase/types';

function toApiPlayerDto(data: CreatePlayerDto) {
    return {
        name: data.name,
        team_id: data.team_id ?? data.teamId,
        position: data.position,
        jersey_number: data.jersey_number ?? data.jerseyNumber,
        date_of_birth: data.date_of_birth ?? data.dateOfBirth,
        nationality: data.nationality,
        bio: data.bio,
    };
}

export function usePlayers(teamId: string) {
    return useQuery({
        queryKey: queryKeys.players(teamId),
        queryFn: () => apiClient.get<Player[]>(`/api/league/teams/${teamId}/players`),
        enabled: !!teamId,
        staleTime: 30_000,
    });
}

export function useAllPlayers() {
    return useQuery({
        queryKey: queryKeys.allPlayers(),
        queryFn: () => apiClient.get<Player[]>('/api/league/players'),
        staleTime: 30_000,
    });
}

export function useCurrentPlayer(profileId?: string) {
    return useQuery({
        queryKey: ['player', 'current', profileId],
        queryFn: async () => {
            const players = await apiClient.get<Player[]>(`/api/league/players?profile_id=${profileId}`);
            return players[0] ?? null;
        },
        enabled: !!profileId,
        staleTime: 30_000,
    });
}

export function usePlayer(teamId: string, playerId: string) {
    return useQuery({
        queryKey: queryKeys.player(teamId, playerId),
        queryFn: () => apiClient.get<Player>(`/api/league/players/${playerId}`),
        enabled: !!playerId,
        staleTime: 30_000,
    });
}

export function useCreatePlayer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePlayerDto) =>
            apiClient.post('/api/league/players', toApiPlayerDto(data)),
        onSuccess: (_, variables) => {
            const teamId = variables.team_id ?? variables.teamId;
            if (teamId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.players(teamId) });
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.allPlayers() });
        },
    });
}

export function useUpdatePlayer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ playerId, data }: { teamId: string; playerId: string; data: Partial<CreatePlayerDto> }) =>
            apiClient.patch(`/api/league/players/${playerId}`, toApiPlayerDto(data as CreatePlayerDto)),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.player(variables.teamId, variables.playerId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.players(variables.teamId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.allPlayers() });
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
            queryClient.invalidateQueries({ queryKey: queryKeys.allPlayers() });
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
