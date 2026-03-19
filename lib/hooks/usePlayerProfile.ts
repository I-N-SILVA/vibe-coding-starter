/**
 * Player Profile Hook - PLYAZ League Manager
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from './query-keys';
import type { PlayerCompetitionStats } from '@/types';

/**
 * Joined type for player stats with competition name
 */
export type PlayerProfileStats = PlayerCompetitionStats & {
    competitions: {
        name: string;
    }
};

/**
 * Hook to fetch player profile statistics
 * 
 * @param playerId - ID of the player to fetch stats for
 * @returns Object containing data, isLoading, and error
 */
export function usePlayerProfile(playerId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.playerCareerStats(playerId || ''),
        queryFn: () => apiClient.get<PlayerProfileStats[]>(`/api/league/players/${playerId}/stats`),
        enabled: !!playerId,
    });
}
