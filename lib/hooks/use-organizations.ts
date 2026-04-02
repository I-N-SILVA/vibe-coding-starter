/**
 * Organization Hooks - PLYAZ League Manager
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from './query-keys';
import type { CreateOrganizationDto, CreateInviteDto, Organization, ActivityItem } from '@/types';

export function useOrganization() {
    return useQuery({
        queryKey: queryKeys.organization,
        queryFn: () => apiClient.get<Organization | null>('/api/league/organizations'),
        staleTime: 60_000,
    });
}

export function useOrganizations() {
    return useQuery({
        queryKey: ['organizations'],
        queryFn: async () => {
            const data = await apiClient.get('/api/league/organizations');
            return Array.isArray(data) ? data : data ? [data] : [];
        },
        staleTime: 60_000,
    });
}

export function useActivity() {
    return useQuery({
        queryKey: queryKeys.activity,
        queryFn: () => apiClient.get<ActivityItem[]>('/api/league/activity'),
        staleTime: 30_000,
    });
}

export function useCreateOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrganizationDto) => apiClient.post('/api/league/organizations', { name: data.name, slug: data.slug }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.organization });
        },
    });
}

// ============================================
// INVITE HOOKS
// ============================================

export function useInvites() {
    return useQuery({
        queryKey: queryKeys.invites,
        queryFn: () => apiClient.get('/api/league/invites'),
        staleTime: 2 * 60_000, // Invites don't change every second
    });
}

export function useCreateInvite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateInviteDto) => apiClient.post('/api/league/invites', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invites });
        },
    });
}
