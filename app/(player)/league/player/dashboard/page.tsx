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
import { playerNavItems } from '@/lib/constants/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { stagger, fadeUp } from '@/lib/animations';
import { DiscoveryBoard } from '@/components/plyaz/DiscoveryBoard';
import {
    usePlayerProfile,
    useMatches,
    usePlayers,
    useCurrentPlayer,
} from '@/lib/hooks';
import type { Match } from '@/lib/supabase/types';
import { Trophy, Users, Zap, Target, Shield, Clock } from 'lucide-react';

export default function PlayerDashboard() {
    const { profile } = useAuth();
    const router = useRouter();

    const { data: statsData, isLoading: isStatsLoading } = usePlayerProfile(profile?.id);
    const { data: currentPlayer, isLoading: isPlayersLoading } = useCurrentPlayer(profile?.id);

    const teamId = currentPlayer?.team_id || '';

    const { data: squad, isLoading: isSquadLoading } = usePlayers(teamId);
    const { data: matches, isLoading: isMatchesLoading } = useMatches({ status: 'upcoming' });

    const totalStats = useMemo(() => {
        if (!statsData || statsData.length === 0) return null;

        const totals = statsData.reduce((acc, curr) => ({
            goals: acc.goals + (curr.goals || 0),
            assists: acc.assists + (curr.assists || 0),
            appearances: acc.appearances + (curr.games_played || 0),
            yellowCards: acc.yellowCards + (curr.yellow_cards || 0),
            redCards: acc.redCards + (curr.red_cards || 0),
            minutesPlayed: acc.minutesPlayed + (curr.minutes_played || 0),
            cleanSheets: acc.cleanSheets + (curr.clean_sheets || 0),
        }), { goals: 0, assists: 0, appearances: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, cleanSheets: 0 });

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
            <PageLayout navItems={playerNavItems} title="PLAYER HUB">
                <div className="space-y-8 pb-20 mt-10">
                    <SkeletonStatCard />
                    <SkeletonMatchCard />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout navItems={playerNavItems} title="PLAYER HUB">
            <PageHeader
                label="Athlete Dashboard"
                title={`${profile?.full_name?.split(' ')[0] || 'Player'}`}
                description={hasTeam ? 'Your performance, upcoming games, and squad.' : 'Complete your profile to get started.'}
                rightAction={
                    <Badge variant={hasTeam ? 'success' : 'secondary'} className={hasTeam ? 'animate-pulse' : ''}>
                        {hasTeam ? 'Active Player' : 'Getting Started'}
                    </Badge>
                }
            />

            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 pb-20">

                {/* Player Identity Card */}
                <motion.section variants={fadeUp}>
                    {isStatsLoading ? (
                        <SkeletonStatCard />
                    ) : (
                        <Card elevated className="bg-gray-900 text-white overflow-hidden border-0">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    <div className="p-8 flex-1">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-20 h-20 rounded-2xl bg-orange-600 flex items-center justify-center text-3xl font-black shadow-2xl transform -rotate-3">
                                                {profile?.jersey_number || '–'}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black">{profile?.full_name || 'Player'}</h2>
                                                <p className="text-orange-500 font-bold text-sm tracking-widest uppercase">
                                                    {profile?.position || 'Position TBD'} • Plyaz Athlete
                                                </p>
                                            </div>
                                        </div>

                                        {totalStats ? (
                                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                                                <div>
                                                    <p className="text-2xl font-black">{totalStats.goals}</p>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Goals</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black">{totalStats.assists}</p>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Assists</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black">{totalStats.appearances}</p>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Games</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pt-6 border-t border-white/10">
                                                <p className="text-sm text-gray-400">Play your first match to unlock rating trends and career stats.</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-3 text-orange-500 text-xs p-0 h-auto hover:text-orange-400"
                                                    onClick={() => router.push('/league/player/profile')}
                                                >
                                                    Complete profile settings →
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-orange-600/10 p-8 flex items-center justify-center border-l border-white/5 min-w-[120px]">
                                        {totalStats ? (
                                            <div className="text-center">
                                                <p className="text-4xl font-black mb-1">{totalStats.rating}</p>
                                                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest leading-none">Season Rating</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-14 h-14 rounded-full border-2 border-dashed border-orange-600/40 flex items-center justify-center mx-auto mb-2">
                                                    <Trophy className="w-6 h-6 text-orange-600/40" />
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-none">Rating Pending</p>
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
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500">Next Game</h3>
                        <Button variant="ghost" size="sm" className="text-[10px]" onClick={() => router.push('/league/matches')}>All fixtures →</Button>
                    </div>

                    {isMatchesLoading ? (
                        <SkeletonMatchCard />
                    ) : nextMatch ? (
                        <Card elevated hoverable>
                            <CardContent className="p-6">
                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4 text-center">
                                    Upcoming Fixture
                                </p>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 text-center">
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            {nextMatch.home_team?.name ?? 'Home Team'}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {nextMatch.home_team?.short_name ?? 'HOME'}
                                        </p>
                                    </div>
                                    <div className="px-6 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 min-w-[80px] text-center">
                                        <p className="text-sm font-black text-gray-900 dark:text-white">
                                            {nextMatch.scheduled_at
                                                ? new Date(nextMatch.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : 'TBD'}
                                        </p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            {nextMatch.away_team?.name ?? 'Away Team'}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {nextMatch.away_team?.short_name ?? 'AWAY'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            {nextMatch.scheduled_at
                                                ? new Date(nextMatch.scheduled_at).toLocaleDateString()
                                                : 'Schedule pending'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{nextMatch.venue ?? 'TBD'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : !hasTeam ? (
                        <Card elevated>
                            <CardContent className="py-10 text-center">
                                <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-4">
                                    <Zap className="w-5 h-5 text-orange-500" />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Join a squad first</h4>
                                <p className="text-xs text-gray-400 mb-4">Once you&apos;re on a team, your fixtures appear here automatically.</p>
                                <Button variant="primary" size="sm" onClick={() => router.push('/league/join/team')}>
                                    Find a team
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card elevated>
                            <CardContent className="py-10 text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">No fixtures yet</h4>
                                <p className="text-xs text-gray-400">Your next game will appear here once it&apos;s scheduled.</p>
                            </CardContent>
                        </Card>
                    )}
                </motion.section>

                {/* Detailed Stats — only when real data exists */}
                {totalStats && (
                    <motion.section variants={fadeUp} id="stats">
                        <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">Performance Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Minutes', val: totalStats.minutesPlayed, icon: Clock },
                                { label: 'Cards', val: totalStats.yellowCards + totalStats.redCards, icon: Shield },
                                { label: 'Clean Sheets', val: totalStats.cleanSheets, icon: Target },
                                { label: 'Global Rating', val: totalStats.rating, icon: Trophy },
                            ].map((s, idx) => (
                                <Card key={idx} padding="md" elevated>
                                    <s.icon className="w-4 h-4 text-orange-500 mb-2" />
                                    <p className="text-xl font-black text-gray-900 dark:text-white">{s.val}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                                </Card>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Discovery — Find a Team */}
                <motion.section variants={fadeUp} id="discover">
                    <DiscoveryBoard type="team" userRole="player" />
                </motion.section>

                {/* The Squad */}
                <motion.section variants={fadeUp} id="team">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500">The Squad</h3>
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
                                    <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">No squad yet</h4>
                                    <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto">
                                        When you join a team, your teammates will appear here.
                                    </p>
                                    <Button variant="outline" size="sm" onClick={() => router.push('/league/join/team')}>
                                        View team invites
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : squadPreview.length > 0 ? (
                            squadPreview.map((teammate, i) => (
                                <Card key={i} elevated hoverable className="group">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                                                {teammate.jersey_number || '–'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{teammate.name}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{teammate.position || 'Player'}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-[10px] font-bold text-orange-500">Stats</Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card elevated>
                                <CardContent className="py-10 text-center">
                                    <p className="text-xs font-bold text-gray-400">No squad members found.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </motion.section>
            </motion.div>
        </PageLayout>
    );
}
