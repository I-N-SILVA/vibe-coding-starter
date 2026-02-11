'use client';

import { useState, useEffect } from 'react';
import { subscribeToMatch } from '@/lib/supabase/realtime';
import type { Match, MatchEvent } from '@/types';
import { useToast } from '@/components/providers';

/**
 * useLiveMatch Hook - PLYAZ League Manager
 * Manages live match state and subscriptions
 * 
 * @param initialMatch The match data from initial SSR or static fetch
 * @returns Current match data and live status
 */
export const useLiveMatch = (initialMatch: Match) => {
    const [match, setMatch] = useState<Match>(initialMatch);
    const [isLive, setIsLive] = useState(match.status === 'live');
    const [lastEvent, setLastEvent] = useState<MatchEvent | null>(null);
    const { info } = useToast();

    useEffect(() => {
        if (!match.id) return;

        // Subscribing to matches table updates
        const channel = subscribeToMatch(match.id, {
            onMatchUpdate: (updatedMatch) => {
                setMatch((prev) => ({
                    ...prev,
                    ...updatedMatch,
                    // Preserve nested objects if they aren't in the update
                    homeTeam: updatedMatch.homeTeam || prev.homeTeam,
                    awayTeam: updatedMatch.awayTeam || prev.awayTeam,
                }));

                if (updatedMatch.status) {
                    setIsLive(updatedMatch.status === 'live');
                }
            },
            onEventNew: (event) => {
                setLastEvent(event);

                // Add event to local match state
                setMatch((prev) => ({
                    ...prev,
                    events: prev.events ? [event, ...prev.events] : [event]
                }));

                // Visual feedback (Quick Win integrated)
                if (event.type === 'goal') {
                    info(`GOAL! ${event.playerName} scores for ${event.teamId === match.homeTeam.id ? match.homeTeam.shortName : match.awayTeam.shortName}`);
                }
            },
        });

        return () => {
            channel.unsubscribe();
        };
    }, [match.id, match.homeTeam.id, match.homeTeam.shortName, match.awayTeam.id, match.awayTeam.shortName, info]);

    return {
        match,
        isLive,
        lastEvent,
    };
};
