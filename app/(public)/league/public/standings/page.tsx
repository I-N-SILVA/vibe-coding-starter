'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    KnockoutBracket
} from '@/components/plyaz';
import { cn } from '@/lib/utils';
import { Trophy, LayoutGrid, List } from 'lucide-react';
import { MOCK_STANDINGS, MOCK_BRACKET } from '@/lib/mock/fixtures';

export default function PublicStandings() {
    const searchParams = useSearchParams();
    const competitionId = searchParams.get('competitionId');
    const [format, setFormat] = useState<'league' | 'knockout'>('league');

    useEffect(() => {
        if (!competitionId) { setFormat('league'); return; }
        async function fetchCompetition() {
            try {
                const res = await fetch(`/api/league/competitions?id=${competitionId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data?.type === 'knockout' || data?.type === 'group_knockout') setFormat('knockout');
                    else setFormat('league');
                }
            } catch (err) { console.error('Failed to fetch format', err); }
        }
        fetchCompetition();
    }, [competitionId]);

    return (
        <PageLayout title="PLYAZ PULSE">
            <PageHeader
                label={format === 'league' ? "League Table" : "Tournament Bracket"}
                title="Pulse Rankings"
            />

            <div className="flex items-center gap-2 mb-8 p-1 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-xl w-fit border border-neutral-100 dark:border-neutral-700/50">
                <button
                    onClick={() => setFormat('league')}
                    data-testid="standings-table-btn"
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                        format === 'league'
                            ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                            : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                    )}
                >
                    <List className="w-4 h-4" />
                    Table
                </button>
                <button
                    onClick={() => setFormat('knockout')}
                    data-testid="standings-bracket-btn"
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                        format === 'knockout'
                            ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                            : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                    )}
                >
                    <LayoutGrid className="w-4 h-4" />
                    Bracket
                </button>
            </div>

            <AnimatePresence mode="wait">
                {format === 'league' ? (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="!p-0 overflow-hidden border-neutral-100 dark:border-neutral-700/50" data-testid="standings-table">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-50 dark:border-neutral-700/50 bg-neutral-50/30 dark:bg-neutral-800/30">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 w-12 text-center">#</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Team</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 text-center">P</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 text-center">W</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-white text-center bg-orange-50/50 dark:bg-orange-500/5">Pts</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 text-center hidden lg:table-cell">Form</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {MOCK_STANDINGS.map((row, idx) => (
                                            <motion.tr
                                                key={row.team}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.04, duration: 0.3 }}
                                                data-testid={`standings-row-${idx}`}
                                                className={cn(
                                                    'border-b border-neutral-50 dark:border-neutral-800/50 last:border-0 hover:bg-orange-50/10 dark:hover:bg-orange-500/5 transition-colors group',
                                                    row.rank <= 2 && 'border-l-2 border-l-orange-500'
                                                )}
                                            >
                                                <td className="px-6 py-5 text-center">
                                                    <span className="text-sm font-black text-neutral-900 dark:text-white tabular-nums">{row.rank}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-black text-neutral-400 dark:text-neutral-500 group-hover:bg-white dark:group-hover:bg-neutral-700 border border-transparent group-hover:border-neutral-100 dark:group-hover:border-neutral-600 transition-all">
                                                            {row.shortName}
                                                        </div>
                                                        <span className="text-sm font-black text-neutral-900 dark:text-white tracking-tight uppercase">{row.team}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-sm text-center text-neutral-500 dark:text-neutral-400 font-bold tabular-nums">{row.played}</td>
                                                <td className="px-4 py-5 text-sm text-center text-neutral-500 dark:text-neutral-400 font-bold tabular-nums">{row.won}</td>
                                                <td className="px-4 py-5 text-sm font-black text-center text-neutral-900 dark:text-white tabular-nums bg-orange-50/20 dark:bg-orange-500/5">
                                                    {row.points}
                                                </td>
                                                <td className="px-6 py-5 hidden lg:table-cell">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {row.form.map((res: string, i: number) => (
                                                            <span
                                                                key={i}
                                                                className={cn(
                                                                    'w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black border-2 transition-all',
                                                                    res === 'W' ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-900' :
                                                                    res === 'D' ? 'bg-neutral-100 dark:bg-neutral-700 border-neutral-100 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300' :
                                                                    'bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 text-neutral-300 dark:text-neutral-600'
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
                ) : (
                    <motion.div
                        key="bracket"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="bg-white dark:bg-neutral-800/50 rounded-3xl border border-neutral-100 dark:border-neutral-700/50 shadow-sm p-4 min-h-[600px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Trophy className="w-64 h-64 rotate-12" />
                            </div>
                            <KnockoutBracket rounds={MOCK_BRACKET} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 group">
                <div className="p-6 rounded-2xl bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-between overflow-hidden relative" data-testid="live-updates-banner">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-0.5">Live Updates</div>
                            <div className="text-sm font-black tracking-tight">Real-time standings are active for {competitionId ? 'this league' : 'all leagues'}.</div>
                        </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-0 h-full flex items-center pr-8">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Pulse Logic Engine v1.0</span>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
