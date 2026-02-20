'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Badge,
    Button,
} from '@/components/plyaz';
import { coachNavItems } from '@/lib/constants/navigation';
import { stagger, fadeUp } from '@/lib/animations';
import { MOCK_TEAM, MOCK_NEXT_MATCH, MOCK_SQUAD, MOCK_MATCHES } from '@/lib/mock/fixtures';

// Derive top performers and recent results from centralized fixtures
const topPerformers = MOCK_SQUAD.slice(0, 3).map(p => ({
    name: p.name,
    position: p.position,
    goals: p.goals,
    assists: Math.floor(p.goals / 2),
    number: p.number
}));

const recentResults = MOCK_MATCHES.slice(0, 3);

export default function CoachDashboard() {
    return (
        <PageLayout navItems={coachNavItems} title="COACH HUB">
            <PageHeader
                label="Coaching Dashboard"
                title={`${MOCK_TEAM.name}`}
            />

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-8"
            >
                {/* Team Overview Cards */}
                <motion.section variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Squad Size', value: MOCK_TEAM.players, accent: false },
                        { label: 'Goalkeepers', value: MOCK_TEAM.goalkeepers, accent: false },
                        { label: 'Outfield', value: MOCK_TEAM.defenders + MOCK_TEAM.midfielders + MOCK_TEAM.forwards, accent: false },
                        { label: 'Form', value: 'W-D-W', accent: true },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">{stat.label}</p>
                            <p className={`text-3xl font-black tracking-tight ${stat.accent ? 'text-orange-500' : 'text-gray-900'}`}>
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </motion.section>

                {/* Next Match */}
                <motion.section variants={fadeUp}>
                    <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-4 flex items-center gap-3">
                        Next Match
                        <div className="h-px flex-1 bg-gray-100" />
                    </h2>
                    <div className="bg-gray-900 text-white rounded-3xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <Badge variant="secondary" className="bg-white/10 border-white/10 text-white/60 text-[9px]">
                                {MOCK_NEXT_MATCH.competition}
                            </Badge>
                            <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
                                {MOCK_NEXT_MATCH.date} · {MOCK_NEXT_MATCH.time}
                            </span>
                        </div>
                        <div className="flex items-center justify-center gap-8">
                            <div className="text-center">
                                <p className="text-2xl font-black tracking-tight">{MOCK_TEAM.shortName}</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Home</p>
                            </div>
                            <span className="text-4xl font-black text-white/10">VS</span>
                            <div className="text-center">
                                <p className="text-2xl font-black tracking-tight">{MOCK_NEXT_MATCH.opponent}</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Away</p>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-white/30 mt-4 tracking-widest uppercase">
                            📍 {MOCK_NEXT_MATCH.venue}
                        </p>
                    </div>
                </motion.section>

                {/* Two Column: Top Players + Recent Results */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Top Performers */}
                    <motion.section variants={fadeUp}>
                        <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-4 flex items-center gap-3">
                            Top Performers
                            <div className="h-px flex-1 bg-gray-100" />
                        </h2>
                        <div className="space-y-3">
                            {topPerformers.map((player) => (
                                <div
                                    key={player.name}
                                    className="flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-200 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-sm">
                                        {player.number}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm tracking-tight text-gray-900">{player.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{player.position}</p>
                                    </div>
                                    <div className="flex gap-3 text-center">
                                        <div>
                                            <p className="text-lg font-black text-gray-900">{player.goals}</p>
                                            <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Goals</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-gray-900">{player.assists}</p>
                                            <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Assists</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Recent Results */}
                    <motion.section variants={fadeUp}>
                        <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-4 flex items-center gap-3">
                            Recent Results
                            <div className="h-px flex-1 bg-gray-100" />
                        </h2>
                        <div className="space-y-3">
                            {recentResults.map((result) => (
                                <div
                                    key={result.opponent}
                                    className="flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${result.result === 'W' ? 'bg-green-100 text-green-700' :
                                        result.result === 'D' ? 'bg-gray-100 text-gray-500' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {result.result}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm tracking-tight text-gray-900">vs {result.opponent}</p>
                                    </div>
                                    <p className="text-xl font-black tracking-tight text-gray-900">{result.score}</p>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                </div>

                {/* Quick Actions */}
                <motion.section variants={fadeUp} className="grid grid-cols-2 gap-4">
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => window.location.href = '/league/coach/roster'}
                        className="h-16"
                    >
                        View Full Roster
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        fullWidth
                        onClick={() => window.location.href = '/league/matches'}
                        className="h-16"
                    >
                        View Schedule
                    </Button>
                </motion.section>
            </motion.div>
        </PageLayout>
    );
}
