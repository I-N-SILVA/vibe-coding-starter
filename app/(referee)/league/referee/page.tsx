'use client';

import React from 'react';
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
import type { Match } from '@/lib/supabase/types';
import { triggerHaptic } from '@/lib/utils';

const statusVariant: Record<string, 'success' | 'warning' | 'secondary'> = {
    live: 'success',
    upcoming: 'warning',
    scheduled: 'warning',
};

function MatchRow({ match, onOpen }: { match: Match; onOpen: () => void }) {
    const homeName = match.home_team?.short_name ?? match.home_team?.name ?? 'Home';
    const awayName = match.away_team?.short_name ?? match.away_team?.name ?? 'Away';
    const date = match.scheduled_at
        ? new Date(match.scheduled_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
        : 'TBD';

    return (
        <Card hoverable onClick={onOpen} className="cursor-pointer">
            <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="text-center w-20 shrink-0">
                            <p className="font-black text-base uppercase truncate">{homeName}</p>
                        </div>
                        <div className="flex-1 text-center">
                            {match.status === 'live' ? (
                                <p className="text-2xl font-black tabular-nums">
                                    {match.home_score} — {match.away_score}
                                </p>
                            ) : (
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">vs</p>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1">{date}</p>
                        </div>
                        <div className="text-center w-20 shrink-0">
                            <p className="font-black text-base uppercase truncate">{awayName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={statusVariant[match.status] ?? 'secondary'} size="sm">
                            {match.status === 'live' ? '● LIVE' : match.status.toUpperCase()}
                        </Badge>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); triggerHaptic('light'); onOpen(); }}>
                            Open
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function RefereeDashboard() {
    const router = useRouter();
    const { data: liveMatches = [], isLoading: liveLoading } = useMatches({ status: 'live' });
    const { data: upcomingMatches = [], isLoading: upcomingLoading } = useMatches({ status: 'scheduled' });
    const { data: completedMatches = [] } = useMatches({ status: 'completed' });

    const isLoading = liveLoading || upcomingLoading;

    return (
        <PageLayout title="REFEREE">
            <PageHeader
                label="Referee Panel"
                title="My Dashboard"
                description="Monitor your matches, log events live, and manage your earnings."
            />

            {/* Earnings Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    title="Total Matches" 
                    value={completedMatches.length.toString()} 
                    icon={<NavIcons.Whistle />} 
                />
                <StatCard 
                    title="Pending Fees" 
                    value={`$${completedMatches.length * 45}`} 
                    icon={<NavIcons.Dashboard />}
                    trend={{ value: completedMatches.length > 0 ? 100 : 0, isPositive: true }}
                />
                <StatCard 
                    title="Next Payout" 
                    value="Aug 15" 
                    icon={<NavIcons.Calendar />} 
                />
                <Card className="bg-orange-500 text-white cursor-pointer hover:bg-orange-600 transition-colors" onClick={() => router.push('/league/referee/payouts')}>
                    <CardContent className="p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Payments</p>
                        <p className="text-2xl font-black mt-1">View All</p>
                        <div className="flex justify-end mt-2">
                            <NavIcons.Public className="w-5 h-5 opacity-40" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Find Tournaments */}
            <div className="mb-10">
                <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-secondary-main/40 mb-4">
                    Opportunities
                </h2>
                <DiscoveryBoard type="competition" userRole="referee" />
            </div>

            {/* Live Matches */}
            {(liveMatches.length > 0 || liveLoading) && (
                <section className="mb-10">
                    <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-secondary-main/40 mb-4">
                        Live Now
                    </h2>
                    {isLoading ? (
                        <div className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                    ) : (
                        <div className="space-y-3">
                            {liveMatches.map((match) => (
                                <motion.div
                                    key={match.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <MatchRow
                                        match={match}
                                        onOpen={() => router.push(`/league/referee/live/${match.id}`)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Upcoming / Scheduled Matches */}
            <section className="mb-10">
                <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-secondary-main/40 mb-4">
                    Upcoming Assignments
                </h2>
                {isLoading ? (
                    <div className="space-y-3">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : upcomingMatches.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingMatches.map((match) => (
                            <motion.div
                                key={match.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <MatchRow
                                    match={match}
                                    onOpen={() => router.push(`/league/referee/${match.id}`)}
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
        </PageLayout>
    );
}
