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
    SkeletonStatCard,
    SkeletonMatchCard,
    SkeletonCard,
} from '@/components/plyaz';
import { useAuth } from '@/lib/auth/AuthProvider';
import { stagger, fadeUp } from '@/lib/animations';
import { DiscoveryBoard } from '@/components/plyaz/DiscoveryBoard';
import { usePlayerProfile, useMatches, usePlayers, useCurrentPlayer } from '@/lib/hooks';
import { usePlayerCareerStats } from '@/lib/hooks/use-players';
import type { Match } from '@/lib/supabase/types';
import { Trophy, Users, Zap, Target, Shield, Clock } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function PlayerDashboard() {
    const { profile } = useAuth();
    const router = useRouter();

    const { data: statsData, isLoading: isStatsLoading } = usePlayerProfile(profile?.id);
    const { data: currentPlayer, isLoading: isPlayersLoading } = useCurrentPlayer(profile?.id);

    const { data: careerStats } = usePlayerCareerStats(currentPlayer?.id ?? '');

    const teamId = currentPlayer?.team_id || '';

    const { data: squad, isLoading: isSquadLoading } = usePlayers(teamId);
    const { data: matches, isLoading: isMatchesLoading } = useMatches({ status: 'upcoming' });

    const totalStats = useMemo(() => {
        if (!statsData || statsData.length === 0) return null;

        const totals = statsData.reduce(
            (acc, curr) => ({
                goals: acc.goals + (curr.goals || 0),
                assists: acc.assists + (curr.assists || 0),
                appearances: acc.appearances + (curr.games_played || 0),
                yellowCards: acc.yellowCards + (curr.yellow_cards || 0),
                redCards: acc.redCards + (curr.red_cards || 0),
                minutesPlayed: acc.minutesPlayed + (curr.minutes_played || 0),
                cleanSheets: acc.cleanSheets + (curr.clean_sheets || 0),
            }),
            {
                goals: 0,
                assists: 0,
                appearances: 0,
                yellowCards: 0,
                redCards: 0,
                minutesPlayed: 0,
                cleanSheets: 0,
            },
        );

        const hasAnyData = Object.values(totals).some((v) => v > 0);
        if (!hasAnyData) return null;

        return { ...totals, rating: '8.4' };
    }, [statsData]);

    const nextMatch = useMemo(() => {
        if (!matches || !teamId) return null;
        return matches.find((m: Match) => m.home_team_id === teamId || m.away_team_id === teamId);
    }, [matches, teamId]);

    const squadPreview = squad?.slice(0, 3) || [];
    const hasTeam = Boolean(teamId);

    const isGlobalLoading = !profile || isPlayersLoading;

    if (isGlobalLoading) {
        return (
            <PageLayout title="PLAYER HUB">
                <div className="mt-10 space-y-8 pb-20">
                    <SkeletonStatCard />
                    <SkeletonMatchCard />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="PLAYER HUB">
            <PageHeader
                label="Athlete Dashboard"
                title={`${profile?.full_name?.split(' ')[0] || 'Player'}`}
                description={
                    hasTeam
                        ? 'Your performance, upcoming games, and squad.'
                        : 'Complete your profile to get started.'
                }
                rightAction={
                    <Badge
                        variant={hasTeam ? 'success' : 'secondary'}
                        className={hasTeam ? 'animate-pulse' : ''}
                    >
                        {hasTeam ? 'Active Player' : 'Getting Started'}
                    </Badge>
                }
            />

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-8 pb-20"
            >
                {/* Player Identity Card */}
                <motion.section variants={fadeUp}>
                    {isStatsLoading ? (
                        <SkeletonStatCard />
                    ) : (
                        <Card elevated className="overflow-hidden border-0 bg-gray-900 text-white">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    <div className="flex-1 p-8">
                                        <div className="mb-6 flex items-center gap-4">
                                            <div className="flex h-20 w-20 -rotate-3 transform items-center justify-center rounded-2xl bg-orange-600 text-3xl font-black shadow-2xl">
                                                {profile?.jersey_number || '–'}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black">
                                                    {profile?.full_name || 'Player'}
                                                </h2>
                                                <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                                                    {profile?.position || 'Position TBD'} • Plyaz
                                                    Athlete
                                                </p>
                                            </div>
                                        </div>

                                        {totalStats ? (
                                            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                                                <div>
                                                    <p className="text-2xl font-black">
                                                        {totalStats.goals}
                                                    </p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                        Goals
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black">
                                                        {totalStats.assists}
                                                    </p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                        Assists
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black">
                                                        {totalStats.appearances}
                                                    </p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                        Games
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border-t border-white/10 pt-6">
                                                <p className="text-sm text-gray-400">
                                                    Play your first match to unlock rating trends
                                                    and career stats.
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-3 h-auto p-0 text-xs text-orange-500 hover:text-orange-400"
                                                    onClick={() =>
                                                        router.push('/league/player/profile')
                                                    }
                                                >
                                                    Complete profile settings →
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex min-w-[120px] items-center justify-center border-l border-white/5 bg-orange-600/10 p-8">
                                        {totalStats ? (
                                            <div className="text-center">
                                                <p className="mb-1 text-4xl font-black">
                                                    {totalStats.rating}
                                                </p>
                                                <p className="text-[10px] font-bold uppercase leading-none tracking-widest text-orange-500">
                                                    Season Rating
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-orange-600/40">
                                                    <Trophy className="h-6 w-6 text-orange-600/40" />
                                                </div>
                                                <p className="text-[10px] font-bold uppercase leading-none tracking-widest text-gray-600">
                                                    Rating Pending
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.section>

                {/* Next Game */}
                <motion.section variants={fadeUp} id="schedule">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            Next Game
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px]"
                            onClick={() => router.push('/league/matches')}
                        >
                            All fixtures →
                        </Button>
                    </div>

                    {isMatchesLoading ? (
                        <SkeletonMatchCard />
                    ) : nextMatch ? (
                        <Card elevated hoverable>
                            <CardContent className="p-6">
                                <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                                    Upcoming Fixture
                                </p>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 text-center">
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            {nextMatch.home_team?.name ?? 'Home Team'}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            {nextMatch.home_team?.short_name ?? 'HOME'}
                                        </p>
                                    </div>
                                    <div className="min-w-[80px] rounded-xl border border-gray-100 bg-gray-50 px-6 py-2 text-center dark:border-gray-700 dark:bg-gray-800">
                                        <p className="text-sm font-black text-gray-900 dark:text-white">
                                            {nextMatch.scheduled_at
                                                ? new Date(
                                                      nextMatch.scheduled_at,
                                                  ).toLocaleTimeString([], {
                                                      hour: '2-digit',
                                                      minute: '2-digit',
                                                  })
                                                : 'TBD'}
                                        </p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            {nextMatch.away_team?.name ?? 'Away Team'}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            {nextMatch.away_team?.short_name ?? 'AWAY'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center justify-center gap-6 border-t border-gray-50 pt-6 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            {nextMatch.scheduled_at
                                                ? new Date(
                                                      nextMatch.scheduled_at,
                                                  ).toLocaleDateString()
                                                : 'Schedule pending'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-gray-400" />
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            {nextMatch.venue ?? 'TBD'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : !hasTeam ? (
                        <Card elevated>
                            <CardContent className="py-10 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20">
                                    <Zap className="h-5 w-5 text-orange-500" />
                                </div>
                                <h4 className="mb-1 font-bold text-gray-900 dark:text-white">
                                    Join a squad first
                                </h4>
                                <p className="mb-4 text-xs text-gray-400">
                                    Once you&apos;re on a team, your fixtures appear here
                                    automatically.
                                </p>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => router.push('/league/join/team')}
                                >
                                    Find a team
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card elevated>
                            <CardContent className="py-10 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                                    <Clock className="h-5 w-5 text-gray-400" />
                                </div>
                                <h4 className="mb-1 font-bold text-gray-900 dark:text-white">
                                    No fixtures yet
                                </h4>
                                <p className="text-xs text-gray-400">
                                    Your next game will appear here once it&apos;s scheduled.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </motion.section>

                {/* Detailed Stats — only when real data exists */}
                {totalStats && (
                    <motion.section variants={fadeUp} id="stats">
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                            Performance Breakdown
                        </h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {[
                                { label: 'Minutes', val: totalStats.minutesPlayed, icon: Clock },
                                {
                                    label: 'Cards',
                                    val: totalStats.yellowCards + totalStats.redCards,
                                    icon: Shield,
                                },
                                {
                                    label: 'Clean Sheets',
                                    val: totalStats.cleanSheets,
                                    icon: Target,
                                },
                                { label: 'Global Rating', val: totalStats.rating, icon: Trophy },
                            ].map((s, idx) => (
                                <Card key={idx} padding="md" elevated>
                                    <s.icon className="mb-2 h-4 w-4 text-orange-500" />
                                    <p className="text-xl font-black text-gray-900 dark:text-white">
                                        {s.val}
                                    </p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                        {s.label}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Performance Trend */}
                {(() => {
                    const trendData = Array.isArray(careerStats)
                        ? (
                              careerStats as Array<{
                                  competition_id: string;
                                  goals: number;
                                  assists: number;
                                  competitions?: { name: string };
                              }>
                          ).map((cs) => ({
                              name: (cs.competitions?.name ?? 'Unknown').slice(0, 10),
                              goals: cs.goals,
                              assists: cs.assists,
                          }))
                        : [];

                    return (
                        <motion.section variants={fadeUp} id="trend">
                            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                                Performance Trend
                            </h3>
                            <Card elevated>
                                <CardContent className="p-6">
                                    {trendData.length < 2 ? (
                                        <p className="py-4 text-center text-sm text-gray-400">
                                            Play in more competitions to see your trend
                                        </p>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart
                                                data={trendData}
                                                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                                            >
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fontSize: 10, fontWeight: 700 }}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 10 }}
                                                    allowDecimals={false}
                                                />
                                                <Tooltip />
                                                <Legend
                                                    wrapperStyle={{ fontSize: 10, fontWeight: 700 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="goals"
                                                    stroke="#f97316"
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    name="Goals"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="assists"
                                                    stroke="#111827"
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    name="Assists"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.section>
                    );
                })()}

                {/* Discovery — Find a Team */}
                <motion.section variants={fadeUp} id="discover">
                    <DiscoveryBoard type="team" userRole="player" />
                </motion.section>

                {/* The Squad */}
                <motion.section variants={fadeUp} id="team">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            The Squad
                        </h3>
                        {!isSquadLoading && hasTeam && (
                            <Badge variant="secondary">{squad?.length || 0} Members</Badge>
                        )}
                    </div>

                    <div className="space-y-3">
                        {isSquadLoading ? (
                            [1, 2, 3].map((i) => <SkeletonCard key={i} />)
                        ) : !hasTeam ? (
                            <Card elevated>
                                <CardContent className="py-12 text-center">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                                        <Users className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <h4 className="mb-2 font-bold text-gray-900 dark:text-white">
                                        No squad yet
                                    </h4>
                                    <p className="mx-auto mb-5 max-w-xs text-xs text-gray-400">
                                        When you join a team, your teammates will appear here.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push('/league/join/team')}
                                    >
                                        View team invites
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : squadPreview.length > 0 ? (
                            squadPreview.map((teammate, i) => (
                                <Card key={i} elevated hoverable className="group">
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-400 transition-colors group-hover:bg-gray-900 group-hover:text-white dark:bg-gray-800">
                                                {teammate.jersey_number || '–'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">
                                                    {teammate.name}
                                                </p>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                                    {teammate.position || 'Player'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[10px] font-bold text-orange-500"
                                        >
                                            Stats
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card elevated>
                                <CardContent className="py-10 text-center">
                                    <p className="text-xs font-bold text-gray-400">
                                        No squad members found.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </motion.section>
            </motion.div>
        </PageLayout>
    );
}
