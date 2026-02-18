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
import type { BracketRound } from '@/components/plyaz/KnockoutBracket';
import { publicNavItems } from '@/lib/constants/navigation';
import { cn } from '@/lib/utils';
import { Trophy, LayoutGrid, List } from 'lucide-react';

// MOCK DATA FOR LEAGUE
const standingsData = [
    { rank: 1, team: 'FC United', shortName: 'FCU', played: 12, won: 9, drawn: 2, lost: 1, gf: 28, ga: 10, gd: 18, points: 29, form: ['W', 'W', 'D', 'W', 'L'], change: 0 },
    { rank: 2, team: 'Phoenix FC', shortName: 'PHX', played: 12, won: 8, drawn: 3, lost: 1, gf: 24, ga: 12, gd: 12, points: 27, form: ['W', 'D', 'W', 'W', 'W'], change: 1 },
    { rank: 3, team: 'City Rangers', shortName: 'CRG', played: 12, won: 7, drawn: 2, lost: 3, gf: 20, ga: 15, gd: 5, points: 23, form: ['L', 'W', 'W', 'D', 'W'], change: -1 },
    { rank: 4, team: 'Eagles', shortName: 'EGL', played: 12, won: 6, drawn: 3, lost: 3, gf: 18, ga: 16, gd: 2, points: 21, form: ['D', 'W', 'L', 'W', 'D'], change: 0 },
];

// MOCK DATA FOR BRACKET
const mockBracketRounds: BracketRound[] = [
    {
        round: 1,
        name: 'Quarter-Finals',
        matchups: [
            { id: 'm1', round: 1, position: 0, homeTeamName: 'Phoenix FC', awayTeamName: 'Eagles', homeScore: 3, awayScore: 1, winnerId: 'home', status: 'completed' },
            { id: 'm2', round: 1, position: 1, homeTeamName: 'City Rangers', awayTeamName: 'Rovers', homeScore: 0, awayScore: 2, winnerId: 'away', status: 'completed' },
            { id: 'm3', round: 1, position: 2, homeTeamName: 'FC United', awayTeamName: 'Strikers', homeScore: 2, awayScore: 2, status: 'live' },
            { id: 'm4', round: 1, position: 3, homeTeamName: 'Titans', awayTeamName: 'Falcons', homeScore: 0, awayScore: 0, status: 'upcoming' },
        ]
    },
    {
        round: 2,
        name: 'Semi-Finals',
        matchups: [
            { id: 'm5', round: 2, position: 0, homeTeamName: 'Phoenix FC', awayTeamName: 'Rovers', status: 'upcoming' },
            { id: 'm6', round: 2, position: 1, homeTeamName: 'TBD', awayTeamName: 'TBD', status: 'upcoming' },
        ]
    },
    {
        round: 3,
        name: 'Final',
        matchups: [
            { id: 'm7', round: 3, position: 0, homeTeamName: 'TBD', awayTeamName: 'TBD', status: 'upcoming' },
        ]
    }
];

export default function PublicStandings() {
    const searchParams = useSearchParams();
    const competitionId = searchParams.get('competitionId');
    const [format, setFormat] = useState<'league' | 'knockout'>('league');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Toggle format for demo purposes if no competitionId, or fetch real data
        if (!competitionId) {
            setFormat('league');
            setIsLoading(false);
            return;
        }

        async function fetchCompetition() {
            try {
                const res = await fetch(`/api/league/competitions?id=${competitionId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data?.type === 'knockout' || data?.type === 'group_knockout') {
                        setFormat('knockout');
                    } else {
                        setFormat('league');
                    }
                }
            } catch (err) {
                console.error('Failed to fetch format', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCompetition();
    }, [competitionId]);

    return (
        <PageLayout navItems={publicNavItems} title="PLYAZ PULSE">
            <PageHeader
                label={format === 'league' ? "League Table" : "Tournament Bracket"}
                title="Pulse Rankings"
            />

            <div className="flex items-center gap-2 mb-8 p-1 bg-gray-100/50 rounded-xl w-fit border border-gray-100">
                <button
                    onClick={() => setFormat('league')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                        format === 'league' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <List className="w-4 h-4" />
                    Table
                </button>
                <button
                    onClick={() => setFormat('knockout')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                        format === 'knockout' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
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
                        <Card className="!p-0 overflow-hidden border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-50 bg-gray-50/30">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 w-12 text-center">#</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Team</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">P</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">W</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center text-gray-900 bg-orange-50/50">Pts</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center hidden lg:table-cell">Form</th>
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
                                                    'border-b border-gray-50 last:border-0 hover:bg-orange-50/10 transition-colors group',
                                                    row.rank <= 2 && 'border-l-2 border-l-orange-500'
                                                )}
                                            >
                                                <td className="px-6 py-5 text-center">
                                                    <span className="text-sm font-black text-gray-900 tabular-nums">{row.rank}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                                                            {row.shortName}
                                                        </div>
                                                        <span className="text-sm font-black text-gray-900 tracking-tight uppercase">{row.team}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-sm text-center text-gray-500 font-bold tabular-nums">{row.played}</td>
                                                <td className="px-4 py-5 text-sm text-center text-gray-500 font-bold tabular-nums">{row.won}</td>
                                                <td className="px-4 py-5 text-sm font-black text-center text-gray-900 tabular-nums bg-orange-50/20">
                                                    {row.points}
                                                </td>
                                                <td className="px-6 py-5 hidden lg:table-cell">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {row.form.map((res, i) => (
                                                            <span
                                                                key={i}
                                                                className={cn(
                                                                    'w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black border-2 transition-all',
                                                                    res === 'W' ? 'bg-black border-black text-white' :
                                                                        res === 'D' ? 'bg-gray-100 border-gray-100 text-gray-600' :
                                                                            'bg-white border-gray-100 text-gray-300'
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
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 min-h-[600px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Trophy className="w-64 h-64 rotate-12" />
                            </div>
                            <KnockoutBracket rounds={mockBracketRounds} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 group">
                <div className="p-6 rounded-2xl bg-gray-900 text-white flex items-center justify-between overflow-hidden relative">
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
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pulse Logic Engine v1.0</span>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
