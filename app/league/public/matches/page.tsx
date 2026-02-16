'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Button,
    Badge,
    TabPills,
    SkeletonMatchCard,
} from '@/components/plyaz';
import { publicNavItems } from '@/lib/constants/navigation';

const TABS = [
    { label: 'All', value: 'all' },
    { label: 'Live', value: 'live' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
];

import { stagger, fadeUp } from '@/lib/animations';

export default function PublicMatches() {
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        async function fetchMatches() {
            try {
                const res = await fetch('/api/league/matches');
                if (res.ok) setMatches(await res.json());
                else {
                    // Fallback to demo data if API fails
                    setMatches([
                        {
                            id: '1',
                            homeTeam: { name: 'FC United', shortName: 'FCU' },
                            awayTeam: { name: 'City Rangers', shortName: 'CRG' },
                            homeScore: 2,
                            awayScore: 1,
                            status: 'live',
                            matchTime: "72'",
                            venue: 'Main Stadium'
                        },
                        {
                            id: '2',
                            homeTeam: { name: 'Phoenix FC', shortName: 'PHX' },
                            awayTeam: { name: 'Eagles', shortName: 'EGL' },
                            homeScore: 0,
                            awayScore: 0,
                            status: 'upcoming',
                            matchTime: '3:00 PM',
                            venue: 'Pitch 2'
                        }
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
                        {filteredMatches.length > 0 ? filteredMatches.map((match) => (
                            <motion.div key={match.id} variants={fadeUp}>
                                <Card elevated className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="flex items-center">
                                            {/* Status bar */}
                                            <div className={`w-1.5 self-stretch ${match.status === 'live' ? 'bg-green-500' : match.status === 'completed' ? 'bg-gray-300' : 'bg-blue-400'}`} />

                                            <div className="flex-1 p-6">
                                                <div className="flex items-center justify-between">
                                                    {/* Home Team */}
                                                    <div className="flex-1 text-right pr-6">
                                                        <p className="text-lg font-bold text-gray-900">
                                                            {match.homeTeam?.name || match.home_team?.name || 'Home'}
                                                        </p>
                                                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                                            {match.homeTeam?.shortName || match.home_team?.shortName || 'HOM'}
                                                        </p>
                                                    </div>

                                                    {/* Score */}
                                                    <div className="flex items-center gap-3 px-6 py-2 rounded-xl bg-gray-900 text-white min-w-[100px] justify-center">
                                                        <span className="text-2xl font-black">{match.homeScore ?? match.home_score ?? '-'}</span>
                                                        <span className="text-gray-500 text-sm">:</span>
                                                        <span className="text-2xl font-black">{match.awayScore ?? match.away_score ?? '-'}</span>
                                                    </div>

                                                    {/* Away Team */}
                                                    <div className="flex-1 pl-6">
                                                        <p className="text-lg font-bold text-gray-900">
                                                            {match.awayTeam?.name || match.away_team?.name || 'Away'}
                                                        </p>
                                                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                                            {match.awayTeam?.shortName || match.away_team?.shortName || 'AWY'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                                    <span className="text-xs text-gray-400">{match.venue || 'Venue TBD'}</span>
                                                    <Badge
                                                        variant={match.status === 'live' ? 'success' : 'secondary'}
                                                        size="sm"
                                                    >
                                                        {match.status === 'live' ? `⚡ ${match.matchTime || match.match_time}` : match.status?.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )) : (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                <p className="text-gray-400 text-sm">No {activeTab} matches at the moment.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            )}
        </PageLayout>
    );
}
