'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Badge,
} from '@/components/plyaz';
import { coachNavItems } from '@/lib/constants/navigation';
import { stagger, fadeUp } from '@/lib/animations';
import { MOCK_SQUAD, type RosterPlayer, type Position } from '@/lib/mock/fixtures';

const positionOrder: Position[] = ['GK', 'DF', 'MF', 'FW'];
const positionLabels: Record<Position, string> = { GK: 'Goalkeepers', DF: 'Defenders', MF: 'Midfielders', FW: 'Forwards' };
const positionColors: Record<Position, string> = {
    GK: 'bg-yellow-100 text-yellow-700',
    DF: 'bg-blue-100 text-blue-700',
    MF: 'bg-green-100 text-green-700',
    FW: 'bg-red-100 text-red-700',
};

const statusConfig: Record<string, { label: string; color: string }> = {
    fit: { label: 'Fit', color: 'bg-green-100 text-green-700 border-green-200' },
    injured: { label: 'Injured', color: 'bg-red-100 text-red-700 border-red-200' },
    suspended: { label: 'Suspended', color: 'bg-orange-100 text-orange-700 border-orange-200' },
};

export default function CoachRosterPage() {
    const [filter, setFilter] = useState<Position | 'all'>('all');
    const [search, setSearch] = useState('');

    const filteredPlayers = MOCK_SQUAD.filter((p) => {
        const matchesPosition = filter === 'all' || p.position === filter;
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchesPosition && matchesSearch;
    });

    const grouped = positionOrder
        .map((pos) => ({
            position: pos,
            label: positionLabels[pos],
            players: filteredPlayers.filter((p) => p.position === pos),
        }))
        .filter((g) => g.players.length > 0);

    const fitCount = MOCK_SQUAD.filter((p) => p.status === 'fit').length;
    const injuredCount = MOCK_SQUAD.filter((p) => p.status === 'injured').length;
    const suspendedCount = MOCK_SQUAD.filter((p) => p.status === 'suspended').length;


    return (
        <PageLayout navItems={coachNavItems} title="SQUAD">
            <PageHeader
                label="Team Management"
                title="Full Roster"
            />

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-8"
            >
                {/* Summary Stats */}
                <motion.section variants={fadeUp} className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Total', value: MOCK_SQUAD.length, color: 'text-gray-900' },
                        { label: 'Available', value: fitCount, color: 'text-green-600' },
                        { label: 'Injured', value: injuredCount, color: 'text-red-600' },
                        { label: 'Suspended', value: suspendedCount, color: 'text-orange-600' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-center">
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">{stat.label}</p>
                            <p className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </motion.section>

                {/* Search & Filter */}
                <motion.section variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:border-gray-900 transition-colors"
                    />
                    <div className="flex gap-2">
                        {(['all', ...positionOrder] as const).map((pos) => (
                            <button
                                key={pos}
                                onClick={() => setFilter(pos)}
                                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === pos
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                {pos === 'all' ? 'All' : pos}
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* Player Groups */}
                {grouped.map((group) => (
                    <motion.section key={group.position} variants={fadeUp}>
                        <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-4 flex items-center gap-3">
                            {group.label} ({group.players.length})
                            <div className="h-px flex-1 bg-gray-100" />
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {group.players.map((player) => (
                                <div
                                    key={player.id}
                                    className="flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-gray-200 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-base">
                                        {player.number}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm tracking-tight text-gray-900 truncate">{player.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${positionColors[player.position]}`}>
                                                {player.position}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium">Age {player.age}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge
                                            variant="secondary"
                                            className={`text-[8px] ${statusConfig[player.status].color} border`}
                                        >
                                            {statusConfig[player.status].label}
                                        </Badge>
                                        <p className="text-[9px] text-gray-400 mt-1 font-medium">
                                            {player.appearances} apps · {player.goals} gls
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                ))}
            </motion.div>
        </PageLayout>
    );
}
