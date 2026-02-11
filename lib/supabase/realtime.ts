'use client';

import { createClient } from './client';
import { RealtimeChannel } from '@supabase/supabase-js';
import type { Match, MatchEvent } from '@/types';

/**
 * Supabase Realtime Utilities - PLYAZ League Manager
 * Utilities for subscribing to live updates
 */

const supabase = createClient();

interface RealtimeConfig {
    onMatchUpdate?: (match: Partial<Match>) => void;
    onEventNew?: (event: MatchEvent) => void;
}

/**
 * Subscribes to updates for a specific match
 * @param matchId The UUID of the match
 * @param config Callback functions for updates
 * @returns Supabase RealtimeChannel
 */
export const subscribeToMatch = (
    matchId: string,
    config: RealtimeConfig
): RealtimeChannel => {
    const channel = supabase
        .channel(`match-${matchId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'matches',
                filter: `id=eq.${matchId}`,
            },
            (payload) => {
                if (config.onMatchUpdate) {
                    config.onMatchUpdate(payload.new as Partial<Match>);
                }
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'match_events',
                filter: `match_id=eq.${matchId}`,
            },
            (payload) => {
                if (config.onEventNew) {
                    config.onEventNew(payload.new as MatchEvent);
                }
            }
        )
        .subscribe();

    return channel;
};

/**
 * Subscribes to ALL live matches for the public scoreboard
 * @param onUpdate Callback for any match update
 */
export const subscribeToAllLiveMatches = (
    onUpdate: (match: Partial<Match>) => void
): RealtimeChannel => {
    const channel = supabase
        .channel('live-matches')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'matches',
                filter: 'status=eq.live',
            },
            (payload) => {
                onUpdate(payload.new as Partial<Match>);
            }
        )
        .subscribe();

    return channel;
};
