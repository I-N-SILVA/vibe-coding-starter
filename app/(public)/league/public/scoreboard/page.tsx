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
import { publicNavItems } from '@/lib/constants/navigation';
import { subscribeToAllLiveMatches } from '@/lib/supabase/realtime';
import type { Match } from '@/lib/supabase/types';

export default function PublicScoreboard() {
    const router = useRouter();
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        async function fetchMatches() {
            try {
                const [liveRes, upcomingRes] = await Promise.all([
                    fetch('/api/league/public/matches?status=live'),
                    fetch('/api/league/public/matches?status=scheduled'),
                ]);
                const live: Match[] = liveRes.ok ? await liveRes.json() : [];
                const upcoming: Match[] = upcomingRes.ok ? await upcomingRes.json() : [];
                setMatches([...live, ...upcoming]);
            } catch {
                // silently fail — user may not be authenticated
            } finally {
                setIsLoading(false);
            }
        }

        fetchMatches();

        const channel = subscribeToAllLiveMatches((updatedMatch) => {
            setMatches((prev) =>
                prev.map((m) =>
                    m.id === updatedMatch.id ? { ...m, ...updatedMatch } : m
                )
            );
            setLastUpdated(new Date());
        });

        return () => {
            channel.unsubscribe();
        };
    }, []);

    const liveMatches = matches.filter(m => m.status === 'live');
    const upcomingMatches = matches.filter(m => m.status === 'scheduled' || m.status === 'upcoming');

    return (
        <PageLayout navItems={publicNavItems} title="PLYAZ LIVE">
            <PageHeader
                label="Public Scoreboard"
                title="Live Matches"
                rightAction={
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                        Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                }
            />

            <div className="space-y-12">
                {/* Live Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                        <h2 className="text-xs font-bold tracking-wider uppercase text-gray-900">
                            In Progress
                        </h2>
                    </div>

                    <div className="grid gap-4">
                        {isLoading ? (
                            [1, 2].map((i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                    <SkeletonMatchCard />
                                </motion.div>
                            ))
                        ) : liveMatches.length > 0 ? (
                            liveMatches.map(match => (
                                <MatchCard
                                    key={match.id}
                                    homeTeam={match.home_team ?? { id: match.home_team_id, name: 'Home' }}
                                    awayTeam={match.away_team ?? { id: match.away_team_id, name: 'Away' }}
                                    homeScore={match.home_score}
                                    awayScore={match.away_score}
                                    status={match.status}
                                    matchTime={match.match_time ?? undefined}
                                    onPress={() => router.push(`/league/public/teams/${match.home_team_id}`)}
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

                {/* Upcoming Section */}
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    <h2 className="text-xs font-bold tracking-wider uppercase text-gray-900 mb-6">
                        Upcoming Fixtures
                    </h2>
                    <div className="grid gap-4">
                        {isLoading ? (
                            <SkeletonMatchCard />
                        ) : upcomingMatches.length > 0 ? (
                            upcomingMatches.map(match => (
                                <MatchCard
                                    key={match.id}
                                    homeTeam={match.home_team ?? { id: match.home_team_id, name: 'Home' }}
                                    awayTeam={match.away_team ?? { id: match.away_team_id, name: 'Away' }}
                                    status={match.status}
                                    matchTime={match.match_time ?? undefined}
                                    date={match.scheduled_at ? new Date(match.scheduled_at).toLocaleDateString() : undefined}
                                    venue={match.venue ?? undefined}
                                    onPress={() => router.push(`/league/public/teams/${match.home_team_id}`)}
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
