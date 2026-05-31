'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    MatchCard,
    EmptyState,
    SkeletonMatchCard,
    NavIcons,
} from '@/components/plyaz';
import { subscribeToAllLiveMatches } from '@/lib/supabase/realtime';
import type { Match } from '@/lib/supabase/types';

export default function PublicScoreboard() {
    const router = useRouter();
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        // Scope to a single competition when the fan hub links here with ?competitionId=…
        const competitionId =
            typeof window !== 'undefined'
                ? new URLSearchParams(window.location.search).get('competitionId')
                : null;
        const compParam = competitionId ? `&competitionId=${competitionId}` : '';

        async function fetchMatches() {
            try {
                const [liveRes, completedRes, upcomingRes] = await Promise.all([
                    fetch(`/api/league/public/matches?status=live${compParam}`),
                    fetch(`/api/league/public/matches?status=completed${compParam}`),
                    fetch(`/api/league/public/matches?status=scheduled${compParam}`),
                ]);
                const live: Match[] = liveRes.ok ? await liveRes.json() : [];
                const completed: Match[] = completedRes.ok ? await completedRes.json() : [];
                const upcoming: Match[] = upcomingRes.ok ? await upcomingRes.json() : [];
                setMatches([...live, ...completed, ...upcoming]);
            } catch {
                // silently fail — user may not be authenticated
            } finally {
                setIsLoading(false);
            }
        }

        fetchMatches();

        const channel = subscribeToAllLiveMatches((updatedMatch) => {
            setMatches((prev) =>
                prev.map((m) => (m.id === updatedMatch.id ? { ...m, ...updatedMatch } : m)),
            );
            setLastUpdated(new Date());
        });

        return () => {
            channel.unsubscribe();
        };
    }, []);

    const liveMatches = matches.filter((m) => m.status === 'live');
    const completedMatches = matches
        .filter((m) => m.status === 'completed')
        .sort((a, b) => {
            const da = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0;
            const db = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0;
            return db - da; // most recent results first
        });
    const upcomingMatches = matches.filter(
        (m) => m.status === 'scheduled' || m.status === 'upcoming',
    );

    return (
        <PageLayout title="PLYAZ LIVE">
            <PageHeader
                label="Public Scoreboard"
                title="Live Matches"
                rightAction={
                    <span className="text-[10px] uppercase tracking-widest text-gray-400">
                        Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                }
            />

            <div className="space-y-12">
                {/* Live Section */}
                <section>
                    <div className="mb-6 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                        </span>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                            In Progress
                        </h2>
                    </div>

                    <div className="grid gap-4">
                        {isLoading ? (
                            [1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <SkeletonMatchCard />
                                </motion.div>
                            ))
                        ) : liveMatches.length > 0 ? (
                            liveMatches.map((match) => (
                                <MatchCard
                                    key={match.id}
                                    homeTeam={
                                        match.home_team ?? { id: match.home_team_id, name: 'Home' }
                                    }
                                    awayTeam={
                                        match.away_team ?? { id: match.away_team_id, name: 'Away' }
                                    }
                                    homeScore={match.home_score}
                                    awayScore={match.away_score}
                                    status={match.status}
                                    matchTime={match.match_time ?? undefined}
                                    onPress={() =>
                                        router.push(`/league/public/teams/${match.home_team_id}`)
                                    }
                                />
                            ))
                        ) : (
                            <EmptyState
                                icon={<NavIcons.Matches />}
                                title="No Live Matches"
                                description="No matches currently in progress."
                            />
                        )}
                    </div>
                </section>

                {/* Results Section — completed matches with final scores */}
                {(isLoading || completedMatches.length > 0) && (
                    <motion.section
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                    >
                        <h2 className="mb-6 text-xs font-bold uppercase tracking-wider text-gray-900">
                            Results
                        </h2>
                        <div className="grid gap-4">
                            {isLoading ? (
                                <SkeletonMatchCard />
                            ) : (
                                completedMatches.map((match) => (
                                    <MatchCard
                                        key={match.id}
                                        homeTeam={
                                            match.home_team ?? {
                                                id: match.home_team_id,
                                                name: 'Home',
                                            }
                                        }
                                        awayTeam={
                                            match.away_team ?? {
                                                id: match.away_team_id,
                                                name: 'Away',
                                            }
                                        }
                                        homeScore={match.home_score}
                                        awayScore={match.away_score}
                                        status={match.status}
                                        date={
                                            match.scheduled_at
                                                ? new Date(match.scheduled_at).toLocaleDateString()
                                                : undefined
                                        }
                                        venue={match.venue ?? undefined}
                                        onPress={() =>
                                            router.push(
                                                `/league/public/teams/${match.home_team_id}`,
                                            )
                                        }
                                    />
                                ))
                            )}
                        </div>
                    </motion.section>
                )}

                {/* Upcoming Section */}
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    <h2 className="mb-6 text-xs font-bold uppercase tracking-wider text-gray-900">
                        Upcoming Fixtures
                    </h2>
                    <div className="grid gap-4">
                        {isLoading ? (
                            <SkeletonMatchCard />
                        ) : upcomingMatches.length > 0 ? (
                            upcomingMatches.map((match) => (
                                <MatchCard
                                    key={match.id}
                                    homeTeam={
                                        match.home_team ?? { id: match.home_team_id, name: 'Home' }
                                    }
                                    awayTeam={
                                        match.away_team ?? { id: match.away_team_id, name: 'Away' }
                                    }
                                    status={match.status}
                                    matchTime={match.match_time ?? undefined}
                                    date={
                                        match.scheduled_at
                                            ? new Date(match.scheduled_at).toLocaleDateString()
                                            : undefined
                                    }
                                    venue={match.venue ?? undefined}
                                    onPress={() =>
                                        router.push(`/league/public/teams/${match.home_team_id}`)
                                    }
                                />
                            ))
                        ) : (
                            <EmptyState
                                icon={<NavIcons.Calendar />}
                                title="No Upcoming Fixtures"
                                description="No fixtures scheduled at the moment."
                            />
                        )}
                    </div>
                </motion.section>
            </div>
        </PageLayout>
    );
}
