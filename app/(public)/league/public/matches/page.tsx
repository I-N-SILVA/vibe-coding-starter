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
                        prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m))
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredMatches = activeTab === 'all'
        ? matches
        : matches.filter((m) => m.status === activeTab);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live': return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
            case 'completed': return 'bg-emerald-500';
            default: return 'bg-neutral-400 dark:bg-neutral-600';
        }
    };

    if (error === 'SERVER_CONFIG_ERROR') {
        return (
            <PageLayout title="PLYAZ MATCHES">
                <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-8">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-4 uppercase tracking-tight">Configuration Required</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-md text-sm leading-relaxed mb-10">
                        The live data protocol requires a valid Supabase connection. Please verify your <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-orange-500">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-orange-500">SUPABASE_SERVICE_ROLE_KEY</code>.
                    </p>
                    <Link 
                        href="/"
                        className="h-12 px-8 inline-flex items-center justify-center bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold tracking-[0.2em] rounded-full hover:scale-105 transition-transform uppercase"
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
                    {[1, 2, 3].map((i) => <SkeletonMatchCard key={i} />)}
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
                        {filteredMatches.length > 0 ? filteredMatches.map((match) => {
                            const homeName = match.home_team?.name ?? 'Home';
                            const homeShort = match.home_team?.short_name ?? homeName.slice(0, 3).toUpperCase();
                            const awayName = match.away_team?.name ?? 'Away';
                            const awayShort = match.away_team?.short_name ?? awayName.slice(0, 3).toUpperCase();
                            const isCompleted = match.status === 'completed';

                            return (
                                <motion.div
                                    key={match.id}
                                    variants={fadeUp}
                                    onClick={() => isCompleted && setSelectedMatch(match)}
                                    className={isCompleted ? 'cursor-pointer' : ''}
                                >
                                    <Card elevated className="overflow-hidden group hover:shadow-md dark:hover:shadow-black/20 transition-shadow" data-testid={`match-card-${match.id}`}>
                                        <CardContent className="p-0">
                                            <div className="flex items-center">
                                                <div className={`w-1.5 self-stretch ${getStatusColor(match.status)}`} />

                                                <div className="flex-1 p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 text-right pr-6">
                                                            <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                                                {homeName}
                                                            </p>
                                                            <p className="text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                                                                {homeShort}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-3 px-6 py-2 rounded-xl bg-neutral-900 dark:bg-white/10 text-white min-w-[100px] justify-center">
                                                            <span className="text-2xl font-black">{match.status === 'upcoming' || match.status === 'scheduled' ? '-' : match.home_score}</span>
                                                            <span className="text-neutral-500 text-sm">:</span>
                                                            <span className="text-2xl font-black">{match.status === 'upcoming' || match.status === 'scheduled' ? '-' : match.away_score}</span>
                                                        </div>

                                                        <div className="flex-1 pl-6">
                                                            <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                                                {awayName}
                                                            </p>
                                                            <p className="text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                                                                {awayShort}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-50 dark:border-neutral-700/50">
                                                        <span className="text-xs text-neutral-400 dark:text-neutral-500">{match.venue ?? 'Venue TBD'}</span>
                                                        <div className="flex items-center gap-3">
                                                            {isCompleted && (
                                                                <span className="text-[9px] font-semibold tracking-wider text-neutral-300 dark:text-neutral-600 uppercase group-hover:text-orange-500 transition-colors">
                                                                    Share
                                                                </span>
                                                            )}
                                                            <Badge
                                                                variant={match.status === 'live' ? 'success' : 'secondary'}
                                                                size="sm"
                                                            >
                                                                {match.status === 'live' ? `LIVE ${match.match_time ?? ''}` : match.status.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        }) : (
                            <div className="text-center py-24 bg-neutral-50/50 dark:bg-neutral-900/20 rounded-3xl border-2 border-dashed border-neutral-100 dark:border-neutral-800 flex flex-col items-center" data-testid="empty-matches">
                                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-6 text-neutral-400 dark:text-neutral-500">
                                    <NavIcons.Trophy className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-tight">No {activeTab} matches scheduled</h3>
                                <p className="text-neutral-400 dark:text-neutral-500 text-sm max-w-xs mb-8">Matches will appear here as soon as the tournament organizers publish the schedule.</p>
                                <Link 
                                    href="/login?mode=signup"
                                    className="h-10 px-6 inline-flex items-center justify-center bg-orange-500 text-white text-[10px] font-bold tracking-[0.2em] rounded-full hover:bg-orange-600 transition-colors uppercase"
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
                            date={selectedMatch.scheduled_at ? new Date(selectedMatch.scheduled_at).toLocaleDateString() : 'Date TBD'}
                            venue={selectedMatch.venue ?? undefined}
                            matchday={selectedMatch.matchday != null ? `Matchday ${selectedMatch.matchday}` : undefined}
                        />
                    </div>
                )}
            </Modal>
        </PageLayout>
    );
}
