'use client';

import { useState, useEffect, useRef } from 'react';
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
    // Keep latest match in a ref so the subscription callback can read it
    // without being included in the effect dependency array (prevents re-subscribe on every update)
    const matchRef = useRef(match);
    matchRef.current = match;

    useEffect(() => {
        if (!initialMatch.id) return;

        const channel = subscribeToMatch(initialMatch.id, {
            onMatchUpdate: (updatedMatch) => {
                setMatch((prev) => ({
                    ...prev,
                    ...updatedMatch,
                    homeTeam: updatedMatch.homeTeam ?? prev.homeTeam,
                    awayTeam: updatedMatch.awayTeam ?? prev.awayTeam,
                }));

                if (updatedMatch.status) {
                    setIsLive(updatedMatch.status === 'live');
                }
            },
            onEventNew: (event) => {
                setLastEvent(event);

                setMatch((prev) => ({
                    ...prev,
                    events: prev.events ? [event, ...prev.events] : [event]
                }));

                if (event.type === 'goal') {
                    const current = matchRef.current;
                    const homeTeam = current.homeTeam;
                    const awayTeam = current.awayTeam;
                    const isHome = event.teamId === (homeTeam?.id ?? current.home_team_id);
                    const scoringTeam = isHome
                        ? (homeTeam?.shortName ?? current.home_team?.short_name ?? 'HOME')
                        : (awayTeam?.shortName ?? current.away_team?.short_name ?? 'AWAY');
                    info(`GOAL! ${event.playerName ?? event.player_name ?? 'Someone'} scores for ${scoringTeam}`);
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
