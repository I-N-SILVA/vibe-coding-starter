'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Badge,
    TabPills,
    SkeletonMatchCard,
    ShareableMatchCard,
    Modal,
    NavIcons,
} from '@/components/plyaz';
import { stagger, fadeUp } from '@/lib/animations';
import type { Match } from '@/lib/supabase/types';
import { PushSubscription } from '@/components/app/PushSubscription';

const TABS = [
    { label: 'All', value: 'all' },
    { label: 'Live', value: 'live' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
];

export default function PublicMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    useEffect(() => {
        async function fetchMatches() {
            try {
                const res = await fetch('/api/league/public/matches');
                if (res.status === 503) {
                    setError('SERVER_CONFIG_ERROR');
                } else if (!res.ok) {
                    setError('FETCH_ERROR');
                } else {
                    setMatches(await res.json());
                }
            } catch {
                setError('FETCH_ERROR');
            } finally {
                setIsLoading(false);
            }
        }
        fetchMatches();

        // Realtime updates
        const { createClient } = require('@/lib/supabase/client');
        const supabase = createClient();

        const channel = supabase
            .channel('public-matches')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'matches' },
                (payload: { new: Match }) => {
                    setMatches((prev) =>
                        prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m)),
                    );
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredMatches =
        activeTab === 'all' ? matches : matches.filter((m) => m.status === activeTab);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live':
                return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
            case 'completed':
                return 'bg-emerald-500';
            default:
                return 'bg-neutral-400 dark:bg-neutral-600';
        }
    };

    if (error === 'SERVER_CONFIG_ERROR') {
        return (
            <PageLayout title="PLYAZ MATCHES">
                <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
                    <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10">
                        <svg
                            className="h-8 w-8 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="mb-4 text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
                        Configuration Required
                    </h2>
                    <p className="mb-10 max-w-md text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                        The live data protocol requires a valid Supabase connection. Please verify
                        your{' '}
                        <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-orange-500 dark:bg-neutral-800">
                            NEXT_PUBLIC_SUPABASE_URL
                        </code>{' '}
                        and{' '}
                        <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-orange-500 dark:bg-neutral-800">
                            SUPABASE_SERVICE_ROLE_KEY
                        </code>
                        .
                    </p>
                    <Link
                        href="/"
                        className="inline-flex h-12 items-center justify-center rounded-full bg-neutral-900 px-8 text-xs font-bold uppercase tracking-[0.2em] text-white transition-transform hover:scale-105 dark:bg-white dark:text-neutral-900"
                    >
                        Return Home
                    </Link>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="PLYAZ MATCHES">
            <PageHeader
                label="Match Results"
                title="Fixtures & Scores"
                description="Live scores and full-time results from across the league."
                rightAction={<PushSubscription />}
            />

            <TabPills tabs={TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <SkeletonMatchCard key={i} />
                    ))}
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        {filteredMatches.length > 0 ? (
                            filteredMatches.map((match) => {
                                const homeName = match.home_team?.name ?? 'Home';
                                const homeShort =
                                    match.home_team?.short_name ??
                                    homeName.slice(0, 3).toUpperCase();
                                const awayName = match.away_team?.name ?? 'Away';
                                const awayShort =
                                    match.away_team?.short_name ??
                                    awayName.slice(0, 3).toUpperCase();
                                const isCompleted = match.status === 'completed';

                                return (
                                    <motion.div
                                        key={match.id}
                                        variants={fadeUp}
                                        onClick={() => isCompleted && setSelectedMatch(match)}
                                        className={isCompleted ? 'cursor-pointer' : ''}
                                    >
                                        <Card
                                            elevated
                                            className="group overflow-hidden transition-shadow hover:shadow-md dark:hover:shadow-black/20"
                                            data-testid={`match-card-${match.id}`}
                                        >
                                            <CardContent className="p-0">
                                                <div className="flex items-center">
                                                    <div
                                                        className={`w-1.5 self-stretch ${getStatusColor(match.status)}`}
                                                    />

                                                    <div className="flex-1 p-3 md:p-6">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 pr-3 text-right md:pr-6">
                                                                <p className="truncate text-sm font-bold text-neutral-900 dark:text-white md:text-lg">
                                                                    {homeName}
                                                                </p>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                                                                    {homeShort}
                                                                </p>
                                                            </div>

                                                            <div className="flex min-w-[80px] items-center justify-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-white dark:bg-white/10 md:min-w-[100px] md:px-6">
                                                                <span className="text-xl font-black md:text-2xl">
                                                                    {match.status === 'upcoming' ||
                                                                    match.status === 'scheduled'
                                                                        ? '-'
                                                                        : match.home_score}
                                                                </span>
                                                                <span className="text-sm text-neutral-500">
                                                                    :
                                                                </span>
                                                                <span className="text-xl font-black md:text-2xl">
                                                                    {match.status === 'upcoming' ||
                                                                    match.status === 'scheduled'
                                                                        ? '-'
                                                                        : match.away_score}
                                                                </span>
                                                            </div>

                                                            <div className="flex-1 pl-3 md:pl-6">
                                                                <p className="truncate text-sm font-bold text-neutral-900 dark:text-white md:text-lg">
                                                                    {awayName}
                                                                </p>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                                                                    {awayShort}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 flex items-center justify-between border-t border-neutral-50 pt-4 dark:border-neutral-700/50">
                                                            <span className="text-xs text-neutral-400 dark:text-neutral-500">
                                                                {match.venue ?? 'Venue TBD'}
                                                            </span>
                                                            <div className="flex items-center gap-3">
                                                                {isCompleted && (
                                                                    <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-300 transition-colors group-hover:text-orange-500 dark:text-neutral-600">
                                                                        Share
                                                                    </span>
                                                                )}
                                                                <Badge
                                                                    variant={
                                                                        match.status === 'live'
                                                                            ? 'success'
                                                                            : 'secondary'
                                                                    }
                                                                    size="sm"
                                                                >
                                                                    {match.status === 'live'
                                                                        ? `LIVE ${match.match_time ?? ''}`
                                                                        : match.status.toUpperCase()}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div
                                className="flex flex-col items-center rounded-3xl border-2 border-dashed border-neutral-100 bg-neutral-50/50 py-24 text-center dark:border-neutral-800 dark:bg-neutral-900/20"
                                data-testid="empty-matches"
                            >
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
                                    <NavIcons.Trophy className="h-8 w-8" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
                                    No {activeTab} matches scheduled
                                </h3>
                                <p className="mb-8 max-w-xs text-sm text-neutral-400 dark:text-neutral-500">
                                    Matches will appear here as soon as the tournament organizers
                                    publish the schedule.
                                </p>
                                <Link
                                    href="/login?mode=signup"
                                    className="inline-flex h-10 items-center justify-center rounded-full bg-orange-500 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-orange-600"
                                >
                                    Launch Your Own League
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Share Modal */}
            <Modal
                isOpen={!!selectedMatch}
                onClose={() => setSelectedMatch(null)}
                title="Share Match Result"
                size="md"
            >
                {selectedMatch && (
                    <div className="py-4">
                        <ShareableMatchCard
                            homeTeam={{
                                name: selectedMatch.home_team?.name ?? 'Home',
                                shortName: selectedMatch.home_team?.short_name ?? undefined,
                            }}
                            awayTeam={{
                                name: selectedMatch.away_team?.name ?? 'Away',
                                shortName: selectedMatch.away_team?.short_name ?? undefined,
                            }}
                            homeScore={selectedMatch.home_score}
                            awayScore={selectedMatch.away_score}
                            competition="League Match"
                            date={
                                selectedMatch.scheduled_at
                                    ? new Date(selectedMatch.scheduled_at).toLocaleDateString()
                                    : 'Date TBD'
                            }
                            venue={selectedMatch.venue ?? undefined}
                            matchday={
                                selectedMatch.matchday != null
                                    ? `Matchday ${selectedMatch.matchday}`
                                    : undefined
                            }
                        />
                    </div>
                )}
            </Modal>
        </PageLayout>
    );
}
