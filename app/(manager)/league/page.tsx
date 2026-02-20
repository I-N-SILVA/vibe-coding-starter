'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompetitions, useLiveMatches, useMatches, useTeams } from '@/lib/hooks';
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
import { stagger, fadeUp } from '@/lib/animations';
import { useToast } from '@/components/providers';

export default function AdminDashboard() {
    const router = useRouter();
    const toast = useToast();
    const [isCreateLeagueOpen, setIsCreateLeagueOpen] = useState(false);
    const [newLeague, setNewLeague] = useState({ name: '', type: 'league', startDate: '' });
    const [recentActivity, setRecentActivity] = useState<Array<{ id: string; action: string; detail: string; time: string }>>([]);

    const { data: competitions = [], isLoading: compsLoading, error: compsError } = useCompetitions();
    const { data: liveMatches = [], isLoading: liveLoading, error: liveError } = useLiveMatches();
    const { data: upcomingMatches = [], isLoading: upcomingLoading, error: upcomingError } = useMatches({ status: 'upcoming' });
    const { data: teams = [], isLoading: teamsLoading } = useTeams();
    const [isCreating, setIsCreating] = useState(false);

    const isLoading = compsLoading || liveLoading || upcomingLoading;

    // Fetch player count
    const [playerCount, setPlayerCount] = useState<number | null>(null);
    useEffect(() => {
        async function fetchPlayers() {
            try {
                const res = await fetch('/api/league/players');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setPlayerCount(data.length);
                }
            } catch { /* ignore */ }
        }
        fetchPlayers();
    }, []);

    // Log errors from query hooks
    useEffect(() => {
        if (compsError) console.error('Failed to fetch competitions:', compsError);
        if (liveError) console.error('Failed to fetch live matches:', liveError);
        if (upcomingError) console.error('Failed to fetch upcoming matches:', upcomingError);
    }, [compsError, liveError, upcomingError]);

    // Redirect to onboarding if no competitions
    useEffect(() => {
        if (!compsLoading && Array.isArray(competitions) && competitions.length === 0) {
            setTimeout(() => {
                router.push('/onboarding');
            }, 1500);
        }
    }, [compsLoading, competitions, router]);

    // Fetch activity
    useEffect(() => {
        async function fetchActivity() {
            try {
                const activityRes = await fetch('/api/league/activity');
                if (activityRes.ok) {
                    const activity = await activityRes.json();
                    if (Array.isArray(activity)) setRecentActivity(activity);
                }
            } catch (error) {
                console.error('Failed to fetch activity:', error);
            }
        }
        fetchActivity();
    }, []);

    const handleCreateLeague = async () => {
        if (!newLeague.name.trim()) return;

        try {
            setIsCreating(true);
            // API expects snake_case fields directly
            await fetch('/api/league/competitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newLeague.name,
                    type: newLeague.type,
                    status: 'draft',
                    start_date: newLeague.startDate || null,
                }),
            }).then(async (res) => {
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to create league');
                }
            });
            toast.success('League created successfully');
            setIsCreateLeagueOpen(false);
            setNewLeague({ name: '', type: 'league', startDate: '' });
            // Refresh competitions list
            window.location.reload();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to create league');
        } finally {
            setIsCreating(false);
        }
    };

    const teamCount = Array.isArray(teams) ? teams.length : 0;
    const compCount = Array.isArray(competitions) ? competitions.length : 0;

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
                                    value={compCount.toString()}
                                    icon={<NavIcons.Trophy />}
                                />
                            </motion.div>
                            <motion.div variants={fadeUp}>
                                <StatCard
                                    title="Teams"
                                    value={teamsLoading ? '—' : teamCount.toString()}
                                    icon={<NavIcons.Teams />}
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
                                    value={playerCount !== null ? playerCount.toString() : '—'}
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
                    <Button variant="secondary" onClick={() => router.push('/league/invites')}>
                        Invite Members
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
                    {upcomingMatches.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingMatches.map((match) => (
                                <MatchCard
                                    key={match.id}
                                    homeTeam={match.homeTeam}
                                    awayTeam={match.awayTeam}
                                    status={match.status}
                                    matchTime={match.matchTime}
                                    date={match.scheduledDate ? new Date(match.scheduledDate).toLocaleDateString() : 'TBD'}
                                    venue={match.venue}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<NavIcons.Calendar />}
                            title="No Upcoming Matches"
                            description="Schedule your first match to get started."
                        />
                    )}
                </section>

                <section>
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-secondary-main/30 mb-4">
                        Recent Activity
                    </h2>
                    <Card>
                        <CardContent>
                            {recentActivity.length > 0 ? (
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
                                            <span className="text-[10px] text-secondary-main/40 uppercase tracking-wider flex-shrink-0 ml-2">
                                                {activity.time}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-xs text-gray-400">No recent activity yet.</p>
                                </div>
                            )}
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
                    <Input
                        label="League Name"
                        placeholder="e.g., Premier Division"
                        value={newLeague.name}
                        onChange={(e) => setNewLeague({ ...newLeague, name: e.target.value })}
                    />
                    <Select
                        label="Format"
                        options={[
                            { value: 'league', label: 'League (Round Robin)' },
                            { value: 'knockout', label: 'Cup (Knockout)' },
                            { value: 'group_knockout', label: 'Group Stage + Knockout' },
                        ]}
                        value={newLeague.type}
                        onChange={(e) => setNewLeague({ ...newLeague, type: e.target.value })}
                    />
                    <Input
                        label="Start Date"
                        type="date"
                        value={newLeague.startDate}
                        onChange={(e) => setNewLeague({ ...newLeague, startDate: e.target.value })}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setIsCreateLeagueOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateLeague}
                            disabled={!newLeague.name.trim() || isCreating}
                            isLoading={isCreating}
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </Modal>
        </PageLayout>
    );
}
