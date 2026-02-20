/**
 * Tournament Hooks - PLYAZ League Manager
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from './query-keys';
import type { CreateGroupDto, CreateRegistrationDto } from '@/types';

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
            const competitionId = variables.competitionId || variables.competition_id || '';
            if (competitionId) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.groups(competitionId),
                });
            }
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
            const competitionId = variables.competitionId || variables.competition_id || '';
            if (competitionId) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.registrations(competitionId),
                });
            }
        },
    });
}
