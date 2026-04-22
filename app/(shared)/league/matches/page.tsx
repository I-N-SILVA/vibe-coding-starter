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
} from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { generateMatchReport } from '@/lib/utils/pdf-generator';

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

    const filteredMatches = activeTab === 'all'
        ? matches
        : matches.filter((m) => m.status === activeTab);

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

            <div className="space-y-6">
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
                ) : filteredMatches.length > 0 ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                        >
                            {filteredMatches.map((match) => (
                                                            <MatchCard
                                                                key={match.id}
                                                                homeTeam={match.home_team ?? { id: match.home_team_id ?? '', name: 'Home Team', shortName: 'HOM' }}
                                                                awayTeam={match.away_team ?? { id: match.away_team_id ?? '', name: 'Away Team', shortName: 'AWY' }}
                                                                homeScore={match.home_score}
                                                                awayScore={match.away_score}
                                                                status={match.status}
                                                                matchTime={match.match_time ?? undefined}
                                                                date={match.scheduled_at ? new Date(match.scheduled_at).toLocaleDateString() : 'TBD'}
                                                                venue={match.venue ?? undefined}
                                                                onPress={() => router.push(`/league/referee/${match.id}`)}
                                                                onDownloadReport={() => {
                                                                    generateMatchReport({
                                                                        homeTeam: match.home_team?.name ?? 'Home Team',
                                                                        awayTeam: match.away_team?.name ?? 'Away Team',
                                                                        homeScore: match.home_score ?? 0,
                                                                        awayScore: match.away_score ?? 0,
                                                                        date: match.scheduled_at ? new Date(match.scheduled_at).toLocaleDateString() : 'TBD',
                                                                        venue: match.venue ?? 'TBD',
                                                                        competition: 'PLYAZ LEAGUE',
                                                                        events: [], // To be populated from match_events if available
                                                                        refereeName: 'Official Referee',
                                                                    });
                                                                }}
                                                            />
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
        </PageLayout>
    );
}
