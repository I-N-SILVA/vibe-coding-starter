/**
 * Standings Hooks - PLYAZ League Manager
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from './query-keys';

export function useStandings(competitionId: string) {
    return useQuery({
        queryKey: queryKeys.standings(competitionId),
        queryFn: () => apiClient.get(`/api/league/competitions/${competitionId}/standings`),
        enabled: !!competitionId,
        staleTime: 5 * 60_000, // Standings update infrequently — avoid refetch on every tab focus
    });
}
