'use client';

import React, { useMemo } from 'react';
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
    EmptyState,
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
import type { MatchUI } from '@/lib/mappers';

export default function PlayerDashboard() {
    const { profile } = useAuth();

    // 1. Fetch competition stats
    const {
        data: statsData,
        isLoading: isStatsLoading,
    } = usePlayerProfile(profile?.id);

    // 2. Fetch current player specifically
    const {
        data: currentPlayer,
        isLoading: isPlayersLoading,
    } = useCurrentPlayer(profile?.id);
 
    const teamId = currentPlayer?.team_id || '';

    // 4. Fetch squad for current team
    const {
        data: squad,
        isLoading: isSquadLoading,
    } = usePlayers(teamId);

    // 5. Fetch upcoming matches
    const {
        data: matches,
        isLoading: isMatchesLoading,
    } = useMatches({ status: 'upcoming' });

    // Aggregate Stats
    const totalStats = useMemo(() => {
        if (!statsData || statsData.length === 0) {
            return {
                goals: 0,
                assists: 0,
                appearances: 0,
                yellowCards: 0,
                redCards: 0,
                minutesPlayed: 0,
                cleanSheets: 0,
                rating: '0.0'
            };
        }

        const totals = statsData.reduce((acc, curr) => ({
            goals: acc.goals + (curr.goals || 0),
            assists: acc.assists + (curr.assists || 0),
            appearances: acc.appearances + (curr.games_played || 0),
            yellowCards: acc.yellowCards + (curr.yellow_cards || 0),
            redCards: acc.redCards + (curr.red_cards || 0),
            minutesPlayed: acc.minutesPlayed + (curr.minutes_played || 0),
            cleanSheets: acc.cleanSheets + (curr.clean_sheets || 0),
        }), {
            goals: 0,
            assists: 0,
            appearances: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0,
            cleanSheets: 0
        });

        return {
            ...totals,
            rating: '8.4' // Default for now until we have rating logic
        };
    }, [statsData]);

    // Find Next Match for Team
    const nextMatch = useMemo(() => {
        if (!matches || !teamId) return null;
        return matches.find((m: MatchUI) =>
            m.homeTeamId === teamId || m.awayTeamId === teamId
        );
    }, [matches, teamId]);

    const squadPreview = squad?.slice(0, 3) || [];

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
                title={`Welcome, ${profile?.full_name?.split(' ')[0] || 'Player'}`}
                description="Your performance, upcoming games, and squad status."
                rightAction={
                    <Badge variant="success" className="animate-pulse">Active Player</Badge>
                }
            />

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-8 pb-20"
            >
                {/* Profile Snapshot */}
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
                                                {profile?.jersey_number || '10'}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black">{profile?.full_name || 'Demo Player'}</h2>
                                                <p className="text-orange-500 font-bold text-sm tracking-widest uppercase">
                                                    {profile?.position || 'Player'} • Plyaz Athlete
                                                </p>
                                            </div>
                                        </div>

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
                                    </div>
                                    <div className="bg-orange-600/10 p-8 flex items-center justify-center border-l border-white/5">
                                        <div className="text-center">
                                            <p className="text-4xl font-black mb-1">{totalStats.rating}</p>
                                            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest leading-none">Global Rating</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.section>

                {/* Upcoming Match */}
                <motion.section variants={fadeUp} id="schedule">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500">Next Game</h3>
                        <Button variant="ghost" size="sm" className="text-[10px]">View Schedule ↗</Button>
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
                                        <p className="text-lg font-bold text-gray-900">
                                            {nextMatch.homeTeam?.name ?? 'Home Team'}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {nextMatch.homeTeam?.shortName ?? 'HOME'}
                                        </p>
                                    </div>
                                    <div className="px-6 py-2 bg-gray-50 rounded-xl border border-gray-100 min-w-[80px] text-center">
                                        <p className="text-sm font-black text-gray-900">
                                            {nextMatch.scheduledAt
                                                ? new Date(nextMatch.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : 'TBD'}
                                        </p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-lg font-bold text-gray-900">
                                            {nextMatch.awayTeam?.name ?? 'Away Team'}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {nextMatch.awayTeam?.shortName ?? 'AWAY'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">📅</span>
                                        <span className="text-xs font-semibold text-gray-600">
                                            {nextMatch.scheduledAt
                                                ? new Date(nextMatch.scheduledAt).toLocaleDateString()
                                                : 'Schedule pending'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">📍</span>
                                        <span className="text-xs font-semibold text-gray-600">{nextMatch.venue ?? 'TBD'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <EmptyState
                            title="No Games Scheduled"
                            description="Take some time to rest or practice. Check back later for your next fixture."
                            action={{
                                label: "View all games",
                                onClick: () => {}
                            }}
                        />
                    )}
                </motion.section>

                {/* Stats Breakdown */}
                <motion.section variants={fadeUp} id="stats">
                    <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">Detailed Performance</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Played', val: totalStats.minutesPlayed, unit: 'mins' },
                            { label: 'Cards', val: totalStats.yellowCards + totalStats.redCards, unit: 'total' },
                            { label: 'Cleans', val: totalStats.cleanSheets, unit: 'sheets' },
                            { label: 'Rating', val: totalStats.rating, unit: 'global' },
                        ].map((s, idx) => (
                            <Card key={idx} padding="md">
                                {isStatsLoading ? (
                                    <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />
                                ) : (
                                    <>
                                        <p className="text-xl font-black text-gray-900">{s.val}</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{s.label} ({s.unit})</p>
                                    </>
                                )}
                            </Card>
                        ))}
                    </div>
                </motion.section>

                {/* Find a Team - Discovery Board */}
                <motion.section variants={fadeUp} id="discover">
                    <DiscoveryBoard type="team" userRole="player" />
                </motion.section>

                {/* Squad List */}
                <motion.section variants={fadeUp} id="team">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500">The Squad</h3>
                        {!isSquadLoading && teamId && <Badge variant="secondary">{squad?.length || 0} Members</Badge>}
                    </div>

                    <div className="space-y-3">
                        {isSquadLoading ? (
                            [1, 2, 3].map((i) => <SkeletonCard key={i} />)
                        ) : squadPreview.length > 0 ? (
                            squadPreview.map((teammate, i) => (
                                <Card key={i} elevated hoverable className="group">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                                                {teammate.jersey_number || '-'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{teammate.name}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{teammate.position || 'Player'}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-[10px] font-bold text-orange-500">Stats</Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="p-10 border-2 border-dashed border-gray-200 rounded-3xl text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No squad members found</p>
                            </div>
                        )}
                    </div>
                </motion.section>
            </motion.div>
        </PageLayout>
    );
}
