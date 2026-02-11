'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

const TABS = [
    { label: 'All', value: 'all' },
    { label: 'Live', value: 'live' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
];

export default function AdminMatches() {
    const router = useRouter();
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        async function fetchMatches() {
            try {
                const res = await fetch('/api/league/matches');
                if (res.ok) setMatches(await res.json());
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
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {filteredMatches.map((match) => (
                                <MatchCard
                                    key={match.id}
                                    homeTeam={match.home_team || { name: 'Home Team', shortName: 'HOM' }}
                                    awayTeam={match.away_team || { name: 'Away Team', shortName: 'AWY' }}
                                    homeScore={match.home_score}
                                    awayScore={match.away_score}
                                    status={match.status}
                                    matchTime={match.match_time}
                                    date={match.scheduled_at ? new Date(match.scheduled_at).toLocaleDateString() : 'TBD'}
                                    venue={match.venue}
                                    onPress={() => router.push(`/league/referee/${match.id}`)}
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
