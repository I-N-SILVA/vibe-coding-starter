'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    TabPills,
} from '@/components/plyaz';
import { PlayerCard } from '@/components/plyaz/cards/PlayerCard';
import { publicNavItems } from '@/lib/constants/navigation';
import { cn } from '@/lib/utils';

const TABS = [
    { label: 'Top Scorers', value: 'goals' },
    { label: 'Most Assists', value: 'assists' },
    { label: 'Discipline', value: 'cards' },
];

const TOP_SCORERS = [
    { id: '1', name: 'James Smith', team: 'FC United', goals: 12, assists: 4, appearances: 8 },
    { id: '2', name: 'Marc Wilson', team: 'FC United', goals: 9, assists: 7, appearances: 8 },
    { id: '3', name: 'Alex Johnson', team: 'City Rangers', goals: 8, assists: 2, appearances: 7 },
    { id: '4', name: 'Ryan Brown', team: 'Eagles', goals: 7, assists: 5, appearances: 8 },
    { id: '5', name: 'Chris Miller', team: 'Rovers', goals: 6, assists: 1, appearances: 6 },
];

const RANK_COLORS = ['bg-yellow-400 text-yellow-900', 'bg-gray-300 text-gray-700', 'bg-orange-400 text-orange-900'];

export default function StatisticsPage() {
    const [statType, setStatType] = useState('goals');

    return (
        <PageLayout navItems={publicNavItems} title="Statistics">
            <PageHeader label="Player Performance" title="Leaderboards" />

            <TabPills tabs={TABS} activeTab={statType} onChange={setStatType} className="mb-8" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={statType}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {/* Top 3 Featured */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold tracking-wider uppercase text-gray-900 mb-4">
                            Featured Players
                        </h2>
                        <div className="grid gap-4">
                            {TOP_SCORERS.slice(0, 3).map((player, index) => (
                                <div key={player.id} className="relative">
                                    {/* Rank Badge */}
                                    <div className={cn(
                                        'absolute -left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold z-10 shadow-sm',
                                        RANK_COLORS[index]
                                    )}>
                                        {index + 1}
                                    </div>
                                    <div
                                        className="ml-4 cursor-pointer"
                                        onClick={() => window.location.href = `/league/public/players/${player.id}`}
                                    >
                                        <PlayerCard
                                            name={player.name}
                                            position="Forward"
                                            number={index + 1}
                                            stats={{
                                                goals: player.goals,
                                                assists: player.assists,
                                                appearances: player.appearances
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Full Table */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold tracking-wider uppercase text-gray-900 mb-4">
                            All Players
                        </h2>
                        <Card padding="sm" className="overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Player</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">G</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">A</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">P</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {TOP_SCORERS.map((player) => (
                                        <tr
                                            key={player.id}
                                            className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                            onClick={() => window.location.href = `/league/public/players/${player.id}`}
                                        >
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-bold text-gray-900 leading-none mb-1">{player.name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-medium">{player.team}</p>
                                            </td>
                                            <td className="px-4 py-4 text-center text-sm font-bold text-gray-900">{player.goals}</td>
                                            <td className="px-4 py-4 text-center text-sm text-gray-600">{player.assists}</td>
                                            <td className="px-4 py-4 text-center text-sm text-gray-600 font-medium">{player.appearances}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </div>
                </motion.div>
            </AnimatePresence>
        </PageLayout>
    );
}
