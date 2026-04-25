/**
 * Team Hooks - PLYAZ League Manager
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from './query-keys';
import type { CreateTeamDto } from '@/types';
import type { Team } from '@/lib/supabase/types';

function toApiTeamDto(data: CreateTeamDto) {
    const dto: Record<string, any> = {
        name: data.name,
        short_name: data.short_name ?? data.shortName,
        competition_id: data.competition_id ?? data.competitionId,
    };

    if (data.logoUrl) dto.logo_url = data.logoUrl;
    if (data.primaryColor || data.primary_color) dto.primary_color = data.primaryColor ?? data.primary_color;
    if (data.secondaryColor || data.secondary_color) dto.secondary_color = data.secondaryColor ?? data.secondary_color;

    return dto;
}

export function useTeams(competitionId?: string) {
    return useQuery({
        queryKey: queryKeys.teams(competitionId),
        queryFn: () => {
            const url = competitionId
                ? `/api/league/teams?competitionId=${competitionId}`
                : '/api/league/teams';
            return apiClient.get<Team[]>(url);
        },
        staleTime: 30_000,
    });
}

export function useTeam(id: string) {
    return useQuery({
        queryKey: queryKeys.team(id),
        queryFn: () => apiClient.get<Team>(`/api/league/teams/${id}`),
        enabled: !!id,
        staleTime: 30_000,
    });
}

export function useCreateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTeamDto) =>
            apiClient.post('/api/league/teams', toApiTeamDto(data)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teams() });
        },
    });
}

export function useUpdateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateTeamDto> }) =>
            apiClient.patch(`/api/league/teams/${id}`, toApiTeamDto(data as CreateTeamDto)),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.team(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.teams() });
        },
    });
}

export function useDeleteTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiClient.delete(`/api/league/teams/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teams() });
        },
    });
}
