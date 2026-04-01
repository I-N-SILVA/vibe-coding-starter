'use client';

import React, { useState, useEffect } from 'react';
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
} from '@/components/plyaz';
import { publicNavItems } from '@/lib/constants/navigation';
import { stagger, fadeUp } from '@/lib/animations';

const TABS = [
    { label: 'All', value: 'all' },
    { label: 'Live', value: 'live' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
];

interface Match {
    id: string;
    homeTeam?: { name: string; shortName: string };
    awayTeam?: { name: string; shortName: string };
    home_team?: { name: string; shortName: string };
    away_team?: { name: string; shortName: string };
    homeScore?: number;
    awayScore?: number;
    home_score?: number;
    away_score?: number;
    status: string;
    matchTime?: string;
    match_time?: string;
    venue?: string;
    competition?: string;
    date?: string;
    matchday?: string;
}

export default function PublicMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    useEffect(() => {
        async function fetchMatches() {
            try {
                const res = await fetch('/api/league/matches');
                if (res.ok) setMatches(await res.json());
                else {
                    setMatches([
                        {
                            id: '1',
                            homeTeam: { name: 'FC United', shortName: 'FCU' },
                            awayTeam: { name: 'City Rangers', shortName: 'CRG' },
                            homeScore: 2,
                            awayScore: 1,
                            status: 'completed',
                            matchTime: "FT",
                            venue: 'Main Stadium',
                            competition: 'Premier Division',
                            date: 'Apr 1, 2026',
                            matchday: 'Matchday 14',
                        },
                        {
                            id: '2',
                            homeTeam: { name: 'Phoenix FC', shortName: 'PHX' },
                            awayTeam: { name: 'Eagles Athletic', shortName: 'EGL' },
                            homeScore: 0,
                            awayScore: 0,
                            status: 'upcoming',
                            matchTime: '3:00 PM',
                            venue: 'Pitch 2',
                            competition: 'Premier Division',
                            date: 'Apr 5, 2026',
                        },
                        {
                            id: '3',
                            homeTeam: { name: 'Strikers FC', shortName: 'STK' },
                            awayTeam: { name: 'Rovers United', shortName: 'RVU' },
                            homeScore: 3,
                            awayScore: 3,
                            status: 'completed',
                            matchTime: "FT",
                            venue: 'Arena Park',
                            competition: 'Sunday Cup',
                            date: 'Mar 29, 2026',
                            matchday: 'Quarter Final',
                        },
                    ]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchMatches();
    }, []);

    const filteredMatches = activeTab === 'all'
        ? matches
        : matches.filter((m) => m.status === activeTab);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live': return 'bg-green-500';
            case 'completed': return 'bg-neutral-300 dark:bg-neutral-600';
            default: return 'bg-blue-400';
        }
    };

    return (
        <PageLayout navItems={publicNavItems} title="PLYAZ MATCHES">
            <PageHeader
                label="Match Results"
                title="Fixtures & Scores"
                description="Live scores and full-time results from across the league."
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
                            const home = match.homeTeam || match.home_team || { name: 'Home', shortName: 'HOM' };
                            const away = match.awayTeam || match.away_team || { name: 'Away', shortName: 'AWY' };
                            const hScore = match.homeScore ?? match.home_score ?? 0;
                            const aScore = match.awayScore ?? match.away_score ?? 0;
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
                                                                {home.name}
                                                            </p>
                                                            <p className="text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                                                                {home.shortName}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-3 px-6 py-2 rounded-xl bg-neutral-900 dark:bg-white/10 text-white min-w-[100px] justify-center">
                                                            <span className="text-2xl font-black">{match.status === 'upcoming' ? '-' : hScore}</span>
                                                            <span className="text-neutral-500 text-sm">:</span>
                                                            <span className="text-2xl font-black">{match.status === 'upcoming' ? '-' : aScore}</span>
                                                        </div>

                                                        <div className="flex-1 pl-6">
                                                            <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                                                {away.name}
                                                            </p>
                                                            <p className="text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                                                                {away.shortName}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-50 dark:border-neutral-700/50">
                                                        <span className="text-xs text-neutral-400 dark:text-neutral-500">{match.venue || 'Venue TBD'}</span>
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
                                                                {match.status === 'live' ? `LIVE ${match.matchTime || match.match_time}` : match.status?.toUpperCase()}
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
                            <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl border-2 border-dashed border-neutral-100 dark:border-neutral-800" data-testid="empty-matches">
                                <p className="text-neutral-400 dark:text-neutral-500 text-sm">No {activeTab} matches at the moment.</p>
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
                            homeTeam={selectedMatch.homeTeam || selectedMatch.home_team || { name: 'Home' }}
                            awayTeam={selectedMatch.awayTeam || selectedMatch.away_team || { name: 'Away' }}
                            homeScore={selectedMatch.homeScore ?? selectedMatch.home_score ?? 0}
                            awayScore={selectedMatch.awayScore ?? selectedMatch.away_score ?? 0}
                            competition={selectedMatch.competition || 'League Match'}
                            date={selectedMatch.date || 'Date TBD'}
                            venue={selectedMatch.venue}
                            matchday={selectedMatch.matchday}
                        />
                    </div>
                )}
            </Modal>
        </PageLayout>
    );
}
