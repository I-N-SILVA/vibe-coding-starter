'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
} from '@/components/plyaz';
import { publicNavItems } from '@/lib/constants/navigation';
import { cn } from '@/lib/utils';

const standingsData = [
    { rank: 1, team: 'FC United', shortName: 'FCU', played: 12, won: 9, drawn: 2, lost: 1, gf: 28, ga: 10, gd: 18, points: 29, form: ['W', 'W', 'D', 'W', 'L'], change: 0 },
    { rank: 2, team: 'Phoenix FC', shortName: 'PHX', played: 12, won: 8, drawn: 3, lost: 1, gf: 24, ga: 12, gd: 12, points: 27, form: ['W', 'D', 'W', 'W', 'W'], change: 1 },
    { rank: 3, team: 'City Rangers', shortName: 'CRG', played: 12, won: 7, drawn: 2, lost: 3, gf: 20, ga: 15, gd: 5, points: 23, form: ['L', 'W', 'W', 'D', 'W'], change: -1 },
    { rank: 4, team: 'Eagles', shortName: 'EGL', played: 12, won: 6, drawn: 3, lost: 3, gf: 18, ga: 16, gd: 2, points: 21, form: ['D', 'W', 'L', 'W', 'D'], change: 0 },
    { rank: 5, team: 'Rovers', shortName: 'ROV', played: 12, won: 5, drawn: 2, lost: 5, gf: 15, ga: 18, gd: -3, points: 17, form: ['L', 'D', 'W', 'L', 'W'], change: 1 },
    { rank: 6, team: 'Athletic', shortName: 'ATH', played: 12, won: 4, drawn: 3, lost: 5, gf: 14, ga: 17, gd: -3, points: 15, form: ['W', 'L', 'L', 'D', 'W'], change: -1 },
];

export default function PublicStandings() {
    return (
        <PageLayout navItems={publicNavItems} title="PLYAZ TABLE">
            <PageHeader label="Standings" title="League Table" />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card padding="md" className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 w-12 text-center">#</th>
                                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Team</th>
                                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">P</th>
                                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">W</th>
                                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">D</th>
                                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">L</th>
                                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center hidden sm:table-cell">GD</th>
                                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-900 text-center bg-gray-100/50">Pts</th>
                                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center hidden lg:table-cell">Form</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standingsData.map((row, idx) => (
                                    <motion.tr
                                        key={row.team}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.04, duration: 0.3 }}
                                        className={cn(
                                            'border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors',
                                            row.rank <= 3 && 'border-l-2 border-l-orange-500'
                                        )}
                                    >
                                        <td className="px-4 py-5 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-sm font-bold text-gray-400">{row.rank}</span>
                                                {row.change !== 0 && (
                                                    <span className={cn(
                                                        'text-[9px]',
                                                        row.change > 0 ? 'text-green-500' : 'text-red-500'
                                                    )}>
                                                        {row.change > 0 ? '▲' : '▼'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                    {row.shortName}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 tracking-tight">{row.team}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 text-sm text-center text-gray-600 tabular-nums">{row.played}</td>
                                        <td className="px-4 py-5 text-sm text-center text-gray-600 tabular-nums">{row.won}</td>
                                        <td className="px-4 py-5 text-sm text-center text-gray-600 tabular-nums">{row.drawn}</td>
                                        <td className="px-4 py-5 text-sm text-center text-gray-600 tabular-nums">{row.lost}</td>
                                        <td className={cn(
                                            "px-4 py-5 text-sm text-center tabular-nums hidden sm:table-cell",
                                            row.gd > 0 ? "text-green-600" : row.gd < 0 ? "text-red-600" : "text-gray-400"
                                        )}>
                                            {row.gd > 0 ? `+${row.gd}` : row.gd}
                                        </td>
                                        <td className="px-4 py-5 text-sm font-bold text-center text-gray-900 tabular-nums bg-gray-50/30">
                                            {row.points}
                                        </td>
                                        <td className="px-4 py-5 hidden lg:table-cell">
                                            <div className="flex items-center justify-center gap-1">
                                                {row.form.map((res, i) => (
                                                    <span
                                                        key={i}
                                                        className={cn(
                                                            'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold',
                                                            res === 'W' ? 'bg-gray-900 text-white' :
                                                            res === 'D' ? 'bg-gray-200 text-gray-600' :
                                                            'border border-gray-200 text-gray-400'
                                                        )}
                                                    >
                                                        {res}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>

            <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                    P: Played &bull; W: Won &bull; D: Drawn &bull; L: Lost &bull; GD: Goal Difference &bull; Pts: Points
                </p>
            </div>
        </PageLayout>
    );
}
