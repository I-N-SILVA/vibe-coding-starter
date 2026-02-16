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

const DEMO_MATCHES: Array<Record<string, unknown>> = [
    {
        id: '1',
        homeTeam: { id: '1', name: 'FC United', shortName: 'FCU' },
        awayTeam: { id: '2', name: 'City Rangers', shortName: 'CRG' },
        homeScore: 2,
        awayScore: 1,
        status: 'live' as const,
        matchTime: "72'",
    },
    {
        id: '2',
        homeTeam: { id: '3', name: 'Phoenix FC', shortName: 'PHX' },
        awayTeam: { id: '4', name: 'Eagles', shortName: 'EGL' },
        homeScore: 0,
        awayScore: 0,
        status: 'live' as const,
        matchTime: "28'",
    },
    {
        id: '3',
        homeTeam: { id: '5', name: 'Rovers', shortName: 'ROV' },
        awayTeam: { id: '6', name: 'Athletic', shortName: 'ATH' },
        status: 'scheduled' as const,
        matchTime: '3:00 PM',
        date: 'Today',
        venue: 'Main Stadium',
    },
];

export default function PublicScoreboard() {
    const router = useRouter();
    const [matches, setMatches] = useState<any[]>(DEMO_MATCHES);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        // Simulate initial load
        const timer = setTimeout(() => setIsLoading(false), 600);

        const channel = subscribeToAllLiveMatches((updatedMatch) => {
            setMatches((prev) =>
                prev.map((m) =>
                    m.id === updatedMatch.id ? { ...m, ...updatedMatch } : m
                )
            );
            setLastUpdated(new Date());
        });

        return () => {
            clearTimeout(timer);
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
                            liveMatches.map(match => (
                                <MatchCard
                                    key={match.id}
                                    homeTeam={match.homeTeam}
                                    awayTeam={match.awayTeam}
                                    homeScore={match.homeScore}
                                    awayScore={match.awayScore}
                                    status={match.status}
                                    matchTime={match.matchTime}
                                    onPress={() => router.push(`/league/public/teams/${match.homeTeam.id}`)}
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
                                    homeTeam={match.homeTeam}
                                    awayTeam={match.awayTeam}
                                    status={match.status}
                                    matchTime={match.matchTime}
                                    date={match.date}
                                    venue={match.venue}
                                    onPress={() => router.push(`/league/public/teams/${match.homeTeam.id}`)}
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
