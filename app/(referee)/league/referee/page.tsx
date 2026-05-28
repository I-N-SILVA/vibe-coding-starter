'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Button,
    Badge,
    EmptyState,
    NavIcons,
    StatCard,
} from '@/components/plyaz';
import { DiscoveryBoard } from '@/components/plyaz/DiscoveryBoard';
import { useMatches } from '@/lib/hooks';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Match } from '@/lib/supabase/types';
import { triggerHaptic } from '@/lib/utils';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'secondary' | 'error'> = {
    live: 'success',
    upcoming: 'warning',
    scheduled: 'warning',
    completed: 'secondary',
};

function isToday(dateStr: string | null | undefined): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );
}

function isPast(dateStr: string | null | undefined, status: string): boolean {
    if (status === 'completed' || status === 'finished') return true;
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
}

function formatMatchDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    if (isToday(dateStr)) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

interface MatchCardProps {
    match: Match;
    showStartButton?: boolean;
    onOpen: () => void;
    onStartScoring: () => void;
}

function MatchCard({ match, showStartButton, onOpen, onStartScoring }: MatchCardProps) {
    const homeName = match.home_team?.short_name ?? match.home_team?.name ?? 'Home';
    const awayName = match.away_team?.short_name ?? match.away_team?.name ?? 'Away';
    const dateStr = formatMatchDate(match.scheduled_at);
    const isLive = match.status === 'live';

    return (
        <Card hoverable onClick={onOpen} className="cursor-pointer overflow-hidden">
            {isLive && (
                <div className="h-1 animate-pulse bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
            )}
            <CardContent className="p-5">
                <div className="flex items-center gap-4">
                    {/* Teams + score */}
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="w-20 shrink-0 text-center">
                            <p className="truncate text-sm font-black uppercase">{homeName}</p>
                            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                HOME
                            </p>
                        </div>
                        <div className="flex-1 text-center">
                            {isLive || match.status === 'completed' ? (
                                <p className="text-2xl font-black tabular-nums">
                                    {match.home_score ?? 0} — {match.away_score ?? 0}
                                </p>
                            ) : (
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                    vs
                                </p>
                            )}
                            <p className="mt-1 text-[10px] text-gray-400">{dateStr}</p>
                        </div>
                        <div className="w-20 shrink-0 text-center">
                            <p className="truncate text-sm font-black uppercase">{awayName}</p>
                            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                AWAY
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                        <Badge variant={STATUS_VARIANT[match.status] ?? 'secondary'} size="sm">
                            {isLive ? '● LIVE' : match.status.toUpperCase()}
                        </Badge>
                        {showStartButton ? (
                            <Button
                                size="sm"
                                className="h-9 bg-orange-500 px-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-orange-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    triggerHaptic('medium');
                                    onStartScoring();
                                }}
                            >
                                {isLive ? '▶ RESUME' : '▶ START'}
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    triggerHaptic('light');
                                    onOpen();
                                }}
                            >
                                View
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function RefereeDashboard() {
    const router = useRouter();
    const { profile } = useAuth();
    const refereeId = profile?.id;

    // Fetch only matches assigned to this referee
    const { data: liveMatches = [], isLoading: liveLoading } = useMatches({
        status: 'live',
        refereeId,
    });
    const { data: scheduledMatches = [], isLoading: scheduledLoading } = useMatches({
        status: 'scheduled',
        refereeId,
    });
    const { data: upcomingMatches = [], isLoading: upcomingLoading } = useMatches({
        status: 'upcoming',
        refereeId,
    });
    const { data: completedMatches = [], isLoading: completedLoading } = useMatches({
        status: 'completed',
        refereeId,
    });

    const isLoading = liveLoading || scheduledLoading || upcomingLoading || completedLoading;

    // Every match assigned to this referee, across all statuses.
    const totalMatches =
        liveMatches.length +
        scheduledMatches.length +
        upcomingMatches.length +
        completedMatches.length;

    // Group matches
    const { todayMatches, futureMatches, pastMatches } = useMemo(() => {
        const allScheduled = [...scheduledMatches, ...upcomingMatches];

        const todayScheduled = allScheduled.filter((m) => isToday(m.scheduled_at));
        const future = allScheduled.filter(
            (m) => !isToday(m.scheduled_at) && !isPast(m.scheduled_at, m.status),
        );
        const pastScheduled = allScheduled.filter(
            (m) => isPast(m.scheduled_at, m.status) && !isToday(m.scheduled_at),
        );

        return {
            todayMatches: [...liveMatches, ...todayScheduled],
            futureMatches: future,
            pastMatches: [...completedMatches, ...pastScheduled],
        };
    }, [liveMatches, scheduledMatches, upcomingMatches, completedMatches]);

    const handleStartScoring = (matchId: string) => {
        router.push(`/league/referee/live/${matchId}`);
    };

    const handleOpenMatch = (matchId: string, isLiveOrToday: boolean) => {
        if (isLiveOrToday) {
            router.push(`/league/referee/live/${matchId}`);
        } else {
            router.push(`/league/referee/${matchId}`);
        }
    };

    return (
        <PageLayout title="REFEREE">
            <PageHeader
                label="Referee Panel"
                title="My Dashboard"
                description="Monitor your matches, log events live, and manage your earnings."
            />

            {/* Quick Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard
                    title="Total Matches"
                    value={totalMatches.toString()}
                    icon={<NavIcons.Whistle />}
                />
                <StatCard
                    title="Pending Fees"
                    value={`$${completedMatches.length * 45}`}
                    icon={<NavIcons.Dashboard />}
                    trend={{ value: completedMatches.length > 0 ? 100 : 0, isPositive: true }}
                />
                <StatCard
                    title="Today"
                    value={todayMatches.length.toString()}
                    icon={<NavIcons.Calendar />}
                />
                <Card
                    className="cursor-pointer bg-orange-500 text-white transition-colors hover:bg-orange-600"
                    onClick={() => router.push('/league/referee/payouts')}
                >
                    <CardContent className="p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            Payments
                        </p>
                        <p className="mt-1 text-2xl font-black">View All</p>
                        <div className="mt-2 flex justify-end">
                            <NavIcons.Public className="h-5 w-5 opacity-40" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Find Tournaments */}
            <div className="mb-10">
                <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-secondary-main/40">
                    Opportunities
                </h2>
                <DiscoveryBoard type="competition" userRole="referee" />
            </div>

            {/* TODAY — Live + today's matches */}
            {(todayMatches.length > 0 || isLoading) && (
                <section className="mb-10">
                    <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-secondary-main/40">
                        Today
                    </h2>
                    {isLoading ? (
                        <div className="h-24 animate-pulse rounded-2xl bg-gray-50" />
                    ) : (
                        <div className="space-y-3">
                            {todayMatches.map((match) => (
                                <motion.div
                                    key={match.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <MatchCard
                                        match={match}
                                        showStartButton
                                        onOpen={() => handleOpenMatch(match.id, true)}
                                        onStartScoring={() => handleStartScoring(match.id)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* UPCOMING */}
            <section className="mb-10">
                <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-secondary-main/40">
                    Upcoming Assignments
                </h2>
                {isLoading ? (
                    <div className="space-y-3">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-50" />
                        ))}
                    </div>
                ) : futureMatches.length > 0 ? (
                    <div className="space-y-3">
                        {futureMatches.map((match) => (
                            <motion.div
                                key={match.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <MatchCard
                                    match={match}
                                    showStartButton={false}
                                    onOpen={() => handleOpenMatch(match.id, false)}
                                    onStartScoring={() => handleStartScoring(match.id)}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<NavIcons.Matches />}
                        title="No Upcoming Matches"
                        description="You have no scheduled matches. Check back later or contact your league organizer."
                    />
                )}
            </section>

            {/* PAST */}
            {pastMatches.length > 0 && (
                <section className="mb-10">
                    <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-secondary-main/40">
                        Past Matches
                    </h2>
                    <div className="space-y-3 opacity-70">
                        {pastMatches.slice(0, 5).map((match) => (
                            <motion.div
                                key={match.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <MatchCard
                                    match={match}
                                    showStartButton={false}
                                    onOpen={() => handleOpenMatch(match.id, false)}
                                    onStartScoring={() => handleStartScoring(match.id)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}
        </PageLayout>
    );
}
