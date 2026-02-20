'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Button,
    Badge,
} from '@/components/plyaz';
import { playerNavItems } from '@/lib/constants/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { stagger, fadeUp } from '@/lib/animations';

import { MOCK_SQUAD, MOCK_NEXT_MATCH, MOCK_PLAYER_PROFILE } from '@/lib/mock/fixtures';

export default function PlayerDashboard() {
    const { profile } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    const playerStats = MOCK_PLAYER_PROFILE.seasonStats;
    const nextMatch = MOCK_NEXT_MATCH;
    const squadPreview = MOCK_SQUAD.slice(0, 3);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <PageLayout navItems={playerNavItems} title="PLAYER HUB">
            <PageHeader
                label="Athlete Dashboard"
                title={`Welcome, ${profile?.full_name?.split(' ')[0] || 'Player'}`}
                description="Your performance, upcoming games, and squad status."
                rightAction={
                    <Badge variant="success" className="animate-pulse">Active Squad</Badge>
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
                                                {profile?.position || 'Forward'} • Plyaz Stars
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                                        <div>
                                            <p className="text-2xl font-black">{playerStats.goals}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Goals</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black">{playerStats.assists}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Assists</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black">{playerStats.appearances}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Games</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-orange-600/10 p-8 flex items-center justify-center border-l border-white/5">
                                    <div className="text-center">
                                        <p className="text-4xl font-black mb-1">8.4</p>
                                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest leading-none">Season Rating</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.section>

                {/* Upcoming Match */}
                <motion.section variants={fadeUp} id="schedule">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500">Next Game</h3>
                        <Button variant="ghost" size="sm" className="text-[10px]">View Schedule ↗</Button>
                    </div>
                    <Card elevated hoverable>
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4 text-center">
                                {nextMatch.competition}
                            </p>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 text-center">
                                    <p className="text-lg font-bold text-gray-900">Phoenix FC</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PHX</p>
                                </div>
                                <div className="px-6 py-2 bg-gray-50 rounded-xl border border-gray-100 min-w-[80px] text-center">
                                    <p className="text-sm font-black text-gray-900">{nextMatch.time}</p>
                                </div>
                                <div className="flex-1 text-center">
                                    <p className="text-lg font-bold text-gray-900">{nextMatch.opponent}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{nextMatch.opponent.substring(0, 3).toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">📅</span>
                                    <span className="text-xs font-semibold text-gray-600">{nextMatch.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">📍</span>
                                    <span className="text-xs font-semibold text-gray-600">{nextMatch.venue}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.section>

                {/* Stats Breakdown */}
                <motion.section variants={fadeUp} id="stats">
                    <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">Detailed Performance</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Played', val: playerStats.minutesPlayed, unit: 'mins' },
                            { label: 'Cards', val: playerStats.yellowCards, unit: 'yellow' },
                            { label: 'Cleans', val: playerStats.cleanSheets, unit: 'sheets' },
                            { label: 'Impact', val: '88%', unit: 'passing' },
                        ].map((s, idx) => (
                            <Card key={idx} padding="md">
                                <p className="text-xl font-black text-gray-900">{s.val}</p>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{s.label} ({s.unit})</p>
                            </Card>
                        ))}
                    </div>
                </motion.section>

                {/* Squad List */}
                <motion.section variants={fadeUp} id="team">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500">The Squad</h3>
                        <Badge variant="secondary">{MOCK_SQUAD.length} Members</Badge>
                    </div>
                    <div className="space-y-3">
                        {squadPreview.map((teammate, i) => (
                            <Card key={i} elevated hoverable className="group">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                                            {teammate.number}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{teammate.name}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{teammate.position}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-[10px] font-bold text-orange-500">Stats</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.section>
            </motion.div>
        </PageLayout>
    );
}
