'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMatches } from '@/lib/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    MatchCard,
    Button,
    EmptyState,
    TabPills,
    SkeletonMatchCard,
    NavIcons,
    MatchDayMultiBoard,
    SocialTicker
} from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { generateMatchReport } from '@/lib/utils/pdf-generator';
import { triggerHaptic } from '@/lib/utils';
import { mapMatchToUI } from '@/lib/mappers';

const TABS = [
    { label: 'All', value: 'all' },
    { label: 'Live', value: 'live' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
];

export default function AdminMatches() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('all');

    const { data: matches = [], isLoading, error } = useMatches();

    useEffect(() => {
        if (error) console.error('Failed to fetch matches:', error);
    }, [error]);

    const uiMatches = matches.map(mapMatchToUI);

    const filteredMatches = activeTab === 'all'
        ? uiMatches
        : uiMatches.filter((m) => m.status === activeTab);

    // Ticker events for live matches
    const tickerEvents = uiMatches
        .filter(m => m.status === 'live')
        .map(m => ({
            id: m.id,
            text: `${m.homeTeam?.shortName || m.homeTeam?.name} ${m.homeScore} - ${m.awayScore} ${m.awayTeam?.shortName || m.awayTeam?.name} • LIVE`,
            type: 'goal' as const
        }));

    return (
        <PageLayout navItems={adminNavItems} title="MATCHES">
            <PageHeader
                label="Management"
                title="Schedule & Results"
                rightAction={
                    <Button variant="primary" onClick={() => router.push('/league/matches/schedule')}>
                        Schedule New
                    </Button>
                }
            />

            <TabPills tabs={TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

            <div className="space-y-6 pb-24">
                {isLoading ? (
                    [1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <SkeletonMatchCard />
                        </motion.div>
                    ))
                ) : activeTab === 'live' && filteredMatches.length > 0 ? (
                    <MatchDayMultiBoard 
                        matches={filteredMatches} 
                        onMatchPress={(id) => router.push(`/league/referee/live/${id}`)} 
                    />
                ) : filteredMatches.length > 0 ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                        >
                            {filteredMatches.map((match) => (
                                <div key={match.id} className="relative mb-4 overflow-hidden rounded-[2rem]">
                                    {/* Action Layers */}
                                    <div className="absolute inset-0 flex justify-between items-center px-6">
                                        <div className="bg-green-500 text-white px-6 py-4 rounded-2xl flex items-center gap-2">
                                            <NavIcons.Referee className="w-5 h-5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Protocol</span>
                                        </div>
                                        <div className="bg-orange-500 text-white px-6 py-4 rounded-2xl flex items-center gap-2">
                                            <NavIcons.Document className="w-5 h-5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Report</span>
                                        </div>
                                    </div>

                                    <motion.div
                                        drag="x"
                                        dragConstraints={{ left: -120, right: 120 }}
                                        dragElastic={0.1}
                                        onDragEnd={(_, info) => {
                                            if (info.offset.x > 100) {
                                                router.push(`/league/referee/live/${match.id}`);
                                                triggerHaptic('success');
                                            } else if (info.offset.x < -100) {
                                                generateMatchReport({
                                                    homeTeam: match.homeTeam?.name ?? 'Home Team',
                                                    awayTeam: match.awayTeam?.name ?? 'Away Team',
                                                    homeScore: match.homeScore ?? 0,
                                                    awayScore: match.awayScore ?? 0,
                                                    date: match.scheduledAt ? new Date(match.scheduledAt).toLocaleDateString() : 'TBD',
                                                    venue: match.venue ?? 'TBD',
                                                    competition: 'PLYAZ LEAGUE',
                                                    events: [],
                                                    refereeName: 'Official Referee',
                                                });
                                                triggerHaptic('success');
                                            }
                                        }}
                                        className="relative z-10 bg-white dark:bg-slate-900"
                                    >
                                        <MatchCard
                                            homeTeam={match.homeTeam ?? { id: match.homeTeamId ?? '', name: 'Home Team', shortName: 'HOM' }}
                                            awayTeam={match.awayTeam ?? { id: match.awayTeamId ?? '', name: 'Away Team', shortName: 'AWY' }}
                                            homeScore={match.homeScore}
                                            awayScore={match.awayScore}
                                            status={match.status}
                                            matchTime={match.matchTime ?? undefined}
                                            date={match.scheduledAt ? new Date(match.scheduledAt).toLocaleDateString() : 'TBD'}
                                            venue={match.venue ?? undefined}
                                            onPress={() => router.push(`/league/referee/${match.id}`)}
                                            onDownloadReport={() => {
                                                generateMatchReport({
                                                    homeTeam: match.homeTeam?.name ?? 'Home Team',
                                                    awayTeam: match.awayTeam?.name ?? 'Away Team',
                                                    homeScore: match.homeScore ?? 0,
                                                    awayScore: match.awayScore ?? 0,
                                                    date: match.scheduledAt ? new Date(match.scheduledAt).toLocaleDateString() : 'TBD',
                                                    venue: match.venue ?? 'TBD',
                                                    competition: 'PLYAZ LEAGUE',
                                                    events: [],
                                                    refereeName: 'Official Referee',
                                                });
                                            }}
                                        />
                                    </motion.div>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <EmptyState
                        icon={<NavIcons.Matches />}
                        title="No Matches Found"
                        description={activeTab === 'all'
                            ? 'No matches scheduled. Start by scheduling your first match.'
                            : `No ${activeTab} matches at the moment.`}
                        action={activeTab === 'all' ? {
                            label: 'Schedule Match',
                            onClick: () => router.push('/league/matches/schedule'),
                        } : undefined}
                    />
                )}
            </div>

            {tickerEvents.length > 0 && <SocialTicker events={tickerEvents} />}
        </PageLayout>
    );
}
