'use client';

import { useState, useEffect, useRef } from 'react';
import { toCamelCase } from '@/lib/mappers';
import type { MatchUI } from '@/lib/mappers';
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
export const useLiveMatch = (initialMatch: MatchUI) => {
    const [match, setMatch] = useState<MatchUI>(initialMatch);
    const [isLive, setIsLive] = useState(match.status === 'live');
    const [lastEvent, setLastEvent] = useState<MatchEvent | null>(null);
    const { info } = useToast();
    // Keep latest match in a ref so the subscription callback can read it
    // without being included in the effect dependency array (prevents re-subscribe on every update)
    const matchRef = useRef(match);
    matchRef.current = match;

    useEffect(() => {
        if (!initialMatch.id) return;

        const channel = subscribeToMatch(initialMatch.id, {
            // Supabase sends snake_case — convert to camelCase and merge into MatchUI state
            onMatchUpdate: (updatedMatch) => {
                const mapped = toCamelCase(updatedMatch as Match);
                setMatch((prev) => ({
                    ...prev,
                    ...mapped,
                    // Preserve enriched team summaries; realtime doesn't include them
                    homeTeam: prev.homeTeam,
                    awayTeam: prev.awayTeam,
                }));

                if (updatedMatch.status) {
                    setIsLive(updatedMatch.status === 'live');
                }
            },
            onEventNew: (event) => {
                setLastEvent(event);

                setMatch((prev) => ({
                    ...prev,
                    events: prev.events ? [event, ...prev.events] : [event],
                }));

                if (event.type === 'goal') {
                    const current = matchRef.current;
                    const homeTeam = current.homeTeam;
                    const awayTeam = current.awayTeam;
                    const isHome = event.team_id === (homeTeam?.id ?? current.homeTeamId);
                    const scoringTeam = isHome
                        ? (homeTeam?.shortName ?? 'HOME')
                        : (awayTeam?.shortName ?? 'AWAY');
                    info(`GOAL! ${event.player_name ?? 'Someone'} scores for ${scoringTeam}`);
                }
            },
        });

        return () => {
            channel.unsubscribe();
        };
        // Only re-subscribe if the match ID changes — team metadata is read via ref
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialMatch.id]);

    return {
        match,
        isLive,
        lastEvent,
    };
};
