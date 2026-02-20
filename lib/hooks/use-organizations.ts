/**
 * Organization Hooks - PLYAZ League Manager
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgService } from '@/services/org';
import { apiClient } from '@/lib/api';
import { queryKeys } from './query-keys';
import type { CreateOrganizationDto, CreateInviteDto } from '@/types';

export function useOrganization() {
    return useQuery({
        queryKey: queryKeys.organization,
        queryFn: () => orgService.getOrganization('current'),
    });
}

export function useActivity() {
    return useQuery({
        queryKey: queryKeys.activity,
        queryFn: () => orgService.getActivity(),
    });
}

export function useCreateOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrganizationDto) => orgService.createOrganization(data.name, data.slug),
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
