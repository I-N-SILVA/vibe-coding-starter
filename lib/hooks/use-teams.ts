/**
 * Team Hooks - PLYAZ League Manager
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '@/services/team';
import { queryKeys } from './query-keys';
import type { CreateTeamDto } from '@/types';

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
