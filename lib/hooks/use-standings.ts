/**
 * Standings Hooks - PLYAZ League Manager
 */

'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from './query-keys';
import { createClient } from '@/lib/supabase/client';

export function useStandings(competitionId: string) {
    const queryClient = useQueryClient();

    // Realtime subscription — invalidate standings when any match in this competition is updated
    useEffect(() => {
        if (!competitionId) return;

        const supabase = createClient();
        const channel = supabase
            .channel(`standings-${competitionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'standings',
                    filter: `competition_id=eq.${competitionId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: queryKeys.standings(competitionId) });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [competitionId, queryClient]);

    return useQuery({
        queryKey: queryKeys.standings(competitionId),
        queryFn: () => apiClient.get(`/api/league/competitions/${competitionId}/standings`),
        enabled: !!competitionId,
        staleTime: 5 * 60_000,
    });
}
