/**
 * Competition Hooks - PLYAZ League Manager
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgService } from '@/services/org';
import { apiClient } from '@/lib/api';
import { queryKeys } from './query-keys';
import type {
    CreateCompetitionDto,
    CreateVenueDto,
    CreateCategoryDto
} from '@/types';

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
// COMP STATS HOOKS
// ============================================

export function useCompetitionStats(competitionId: string) {
    return useQuery({
        queryKey: queryKeys.competitionStats(competitionId),
        queryFn: () => apiClient.get(`/api/league/competitions/${competitionId}/stats`),
        enabled: !!competitionId,
    });
}
