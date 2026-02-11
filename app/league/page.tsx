'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    NavIcons,
    StatCard,
    MatchCard,
    Card,
    CardContent,
    Button,
    Modal,
    Input,
    Select,
    EmptyState,
    SkeletonStatCard,
    SkeletonMatchCard,
} from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';

const DEFAULT_LIVE_MATCHES = [
    {
        id: '1',
        homeTeam: { id: '1', name: 'FC United', shortName: 'FCU' },
        awayTeam: { id: '2', name: 'City Rangers', shortName: 'CRG' },
        homeScore: 2,
        awayScore: 1,
        status: 'live' as const,
        matchTime: "67'",
    },
    {
        id: '2',
        homeTeam: { id: '3', name: 'Phoenix FC', shortName: 'PHX' },
        awayTeam: { id: '4', name: 'Eagles', shortName: 'EGL' },
        homeScore: 0,
        awayScore: 0,
        status: 'live' as const,
        matchTime: "23'",
    },
];

const DEFAULT_UPCOMING_MATCHES = [
    {
        id: '3',
        homeTeam: { id: '5', name: 'Rovers', shortName: 'ROV' },
        awayTeam: { id: '6', name: 'Athletic', shortName: 'ATH' },
        status: 'upcoming' as const,
        matchTime: '3:00 PM',
        date: 'Today',
        venue: 'Main Stadium',
    },
];

const DEFAULT_RECENT_ACTIVITY = [
    { id: '1', action: 'Goal scored', detail: 'J. Smith (FC United)', time: '2 min ago' },
    { id: '2', action: 'Yellow card', detail: 'M. Johnson (City Rangers)', time: '5 min ago' },
    { id: '3', action: 'Match started', detail: 'Phoenix FC vs Eagles', time: '23 min ago' },
    { id: '4', action: 'Team created', detail: 'West Ham Juniors', time: '1 hour ago' },
];

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function AdminDashboard() {
    const router = useRouter();
    const [isCreateLeagueOpen, setIsCreateLeagueOpen] = useState(false);
    const [competitions, setCompetitions] = useState<any[]>([]);
    const [liveMatches, setLiveMatches] = useState<any[]>(DEFAULT_LIVE_MATCHES);
    const [upcomingMatches] = useState<any[]>(DEFAULT_UPCOMING_MATCHES);
    const [recentActivity, setRecentActivity] = useState<any[]>(DEFAULT_RECENT_ACTIVITY);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [complRes, matchesRes, activityRes] = await Promise.all([
                    fetch('/api/league/competitions'),
                    fetch('/api/league/matches?status=live'),
                    fetch('/api/league/activity')
                ]);

                if (complRes.ok) {
                    const comps = await complRes.json();
                    if (comps && Array.isArray(comps)) {
                        setCompetitions(comps);
                    }
                }

                if (matchesRes.ok) {
                    const matches = await matchesRes.json();
                    if (matches && Array.isArray(matches) && matches.length > 0) {
                        setLiveMatches(matches);
                    }
                }

                if (activityRes.ok) {
                    const activity = await activityRes.json();
                    if (activity && Array.isArray(activity) && activity.length > 0) {
                        setRecentActivity(activity);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <PageLayout navItems={adminNavItems} title="PLYAZ">
            <PageHeader label="Dashboard" title="Welcome back" />

            {/* Stats Grid */}
            <motion.section
                variants={stagger}
                initial="hidden"
                animate="show"
                className="mb-10"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {isLoading ? (
                        [1, 2, 3, 4].map((i) => (
                            <motion.div key={i} variants={fadeUp}>
                                <SkeletonStatCard />
                            </motion.div>
                        ))
                    ) : (
                        <>
                            <motion.div variants={fadeUp}>
                                <StatCard
                                    title="Leagues"
                                    value={competitions.length > 0 ? competitions.length.toString() : "4"}
                                    icon={<NavIcons.Trophy />}
                                />
                            </motion.div>
                            <motion.div variants={fadeUp}>
                                <StatCard
                                    title="Teams"
                                    value="24"
                                    icon={<NavIcons.Teams />}
                                    trend={{ value: 12, isPositive: true }}
                                />
                            </motion.div>
                            <motion.div variants={fadeUp}>
                                <StatCard
                                    title="Live Now"
                                    value={liveMatches.length.toString()}
                                    icon={<NavIcons.Matches />}
                                />
                            </motion.div>
                            <motion.div variants={fadeUp}>
                                <StatCard
                                    title="Players"
                                    value="156"
                                    icon={<NavIcons.Statistics />}
                                />
                            </motion.div>
                        </>
                    )}
                </div>
            </motion.section>

            {/* Live Matches */}
            <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mb-10"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-secondary-main/30 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-main/20 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-main" />
                        </span>
                        Live Now
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/league/matches')}>
                        View All
                    </Button>
                </div>
                {isLoading ? (
                    <div className="space-y-4">
                        <SkeletonMatchCard />
                        <SkeletonMatchCard />
                    </div>
                ) : liveMatches.length > 0 ? (
                    <div className="space-y-4">
                        {liveMatches.map((match) => (
                            <MatchCard
                                key={match.id}
                                homeTeam={match.homeTeam}
                                awayTeam={match.awayTeam}
                                homeScore={match.homeScore}
                                awayScore={match.awayScore}
                                status={match.status}
                                matchTime={match.matchTime}
                                onPress={() => router.push(`/league/referee/${match.id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<NavIcons.Matches />}
                        title="No Live Matches"
                        description="There are no matches currently in progress."
                    />
                )}
            </motion.section>

            {/* Quick Actions */}
            <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mb-10"
            >
                <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-secondary-main/30 mb-4">
                    Quick Actions
                </h2>
                <div className="flex flex-wrap gap-3">
                    <Button variant="primary" onClick={() => setIsCreateLeagueOpen(true)}>
                        Create League
                    </Button>
                    <Button variant="secondary" onClick={() => router.push('/league/teams')}>
                        Add Team
                    </Button>
                    <Button variant="secondary" onClick={() => router.push('/league/matches/schedule')}>
                        Schedule Match
                    </Button>
                </div>
            </motion.section>

            {/* Upcoming Matches & Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="grid md:grid-cols-2 gap-6"
            >
                <section>
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-secondary-main/30 mb-4">
                        Upcoming
                    </h2>
                    <div className="space-y-4">
                        {upcomingMatches.map((match) => (
                            <MatchCard
                                key={match.id}
                                homeTeam={match.homeTeam}
                                awayTeam={match.awayTeam}
                                status={match.status}
                                matchTime={match.matchTime}
                                date={match.date}
                                venue={match.venue}
                            />
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-secondary-main/30 mb-4">
                        Recent Activity
                    </h2>
                    <Card>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start justify-between py-2 border-b border-secondary-main/5 last:border-0"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-primary-main">{activity.action}</p>
                                            <p className="text-xs text-secondary-main/40">{activity.detail}</p>
                                        </div>
                                        <span className="text-[10px] text-secondary-main/40 uppercase tracking-wider">
                                            {activity.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </motion.div>

            {/* Create League Modal */}
            <Modal
                isOpen={isCreateLeagueOpen}
                onClose={() => setIsCreateLeagueOpen(false)}
                title="Create League"
                description="Set up a new competition"
            >
                <div className="space-y-4">
                    <Input label="League Name" placeholder="e.g., Premier Division" />
                    <Select
                        label="Format"
                        placeholder="Select format"
                        options={[
                            { value: 'league', label: 'League (Round Robin)' },
                            { value: 'cup', label: 'Cup (Knockout)' },
                            { value: 'group', label: 'Group Stage + Knockout' },
                        ]}
                    />
                    <Input label="Start Date" type="date" />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setIsCreateLeagueOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setIsCreateLeagueOpen(false)}>
                            Create
                        </Button>
                    </div>
                </div>
            </Modal>
        </PageLayout>
    );
}
