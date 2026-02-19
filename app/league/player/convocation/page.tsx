'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout, Badge, Button, Card, CardContent } from '@/components/plyaz';
import { playerNavItems } from '@/lib/constants/navigation';
import { MapPin, Clock, Calendar, ChevronLeft, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Match Convocation Page
 * Shows the player whether they've been selected for the next match:
 * STARTING XI, BENCH, or NOT CALLED.
 */

type SelectionStatus = 'starting' | 'bench' | 'not_called';

const STATUS_CONFIG: Record<SelectionStatus, { label: string; color: string; bg: string; border: string; emoji: string }> = {
    starting: { label: 'STARTING XI', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', emoji: '🟢' },
    bench: { label: 'ON THE BENCH', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', emoji: '🟡' },
    not_called: { label: 'NOT CALLED UP', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', emoji: '🔴' },
};

// Mock match data
const MOCK_MATCH = {
    id: 'm1',
    homeTeam: 'Phoenix FC',
    awayTeam: 'City Rangers',
    date: 'Saturday, 22 Feb 2026',
    time: '15:00',
    venue: 'Central Park Stadium',
    reportTime: '13:30',
    competition: 'Premier League 2026',
};

// Mock current player convocation
const MOCK_CONVOCATION = {
    status: 'starting' as SelectionStatus,
    position: 'ST',
    jerseyNumber: 9,
    playerName: 'Marcus Rivera',
};

// Mock formation (4-3-3 with positions on a pitch grid)
const FORMATION_POSITIONS = [
    { x: 50, y: 88, role: 'GK', player: 'D. Silva', number: 1 },
    { x: 20, y: 70, role: 'LB', player: 'A. Cole', number: 3 },
    { x: 40, y: 72, role: 'CB', player: 'R. Keane', number: 4 },
    { x: 60, y: 72, role: 'CB', player: 'J. Stones', number: 5 },
    { x: 80, y: 70, role: 'RB', player: 'T. Walker', number: 2 },
    { x: 30, y: 50, role: 'CM', player: 'L. Modric', number: 8 },
    { x: 50, y: 45, role: 'CM', player: 'K. De Bruyne', number: 10 },
    { x: 70, y: 50, role: 'CM', player: 'N. Kanté', number: 7 },
    { x: 20, y: 25, role: 'LW', player: 'S. Mané', number: 11 },
    { x: 50, y: 18, role: 'ST', player: 'M. Rivera', number: 9, isCurrentPlayer: true },
    { x: 80, y: 25, role: 'RW', player: 'M. Salah', number: 6 },
];

const BENCH_PLAYERS = [
    { name: 'C. Peres', position: 'GK', number: 12 },
    { name: 'H. Maguire', position: 'CB', number: 15 },
    { name: 'F. Henderson', position: 'CM', number: 14 },
    { name: 'J. Lingard', position: 'RW', number: 17 },
    { name: 'D. Calvert', position: 'ST', number: 20 },
];

export default function ConvocationPage() {
    const router = useRouter();
    const [selectedView, setSelectedView] = useState<'lineup' | 'squad'>('lineup');
    const status = STATUS_CONFIG[MOCK_CONVOCATION.status];

    return (
        <PageLayout navItems={playerNavItems} title="MATCH DAY">
            <div className="max-w-md mx-auto pb-24">
                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 hover:text-orange-500 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {/* Match Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl bg-gray-950 text-white p-8 mb-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full blur-[60px]" />
                    <div className="relative">
                        <Badge variant="secondary" className="bg-white/10 border-0 text-white/60 text-[8px] font-bold tracking-widest uppercase mb-4">
                            {MOCK_MATCH.competition}
                        </Badge>
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-center flex-1">
                                <div className="text-xl font-black">{MOCK_MATCH.homeTeam}</div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Home</div>
                            </div>
                            <div className="text-center px-4">
                                <div className="text-2xl font-black text-orange-500">VS</div>
                            </div>
                            <div className="text-center flex-1">
                                <div className="text-xl font-black">{MOCK_MATCH.awayTeam}</div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Away</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {MOCK_MATCH.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {MOCK_MATCH.time}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" /> {MOCK_MATCH.venue}
                        </div>
                    </div>
                </motion.div>

                {/* Selection Status */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className={`rounded-3xl ${status.bg} border-2 ${status.border} p-8 text-center mb-6`}
                >
                    <div className="text-4xl mb-3">{status.emoji}</div>
                    <div className={`text-2xl font-black ${status.color} tracking-wider`}>{status.label}</div>
                    <div className="text-sm text-gray-400 font-bold mt-2">
                        Position: <span className="text-white font-black">{MOCK_CONVOCATION.position}</span> · Jersey <span className="text-white font-black">#{MOCK_CONVOCATION.jerseyNumber}</span>
                    </div>
                </motion.div>

                {/* Match Details */}
                <Card className="border-0 rounded-3xl bg-gray-50 mb-6">
                    <CardContent className="p-6">
                        <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-4">Your Match Details</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-lg font-black text-gray-900">{MOCK_CONVOCATION.position}</div>
                                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Position</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-black text-gray-900">#{MOCK_CONVOCATION.jerseyNumber}</div>
                                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Jersey</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-black text-gray-900">{MOCK_MATCH.reportTime}</div>
                                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Report</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                    {(['lineup', 'squad'] as const).map((view) => (
                        <button
                            key={view}
                            onClick={() => setSelectedView(view)}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedView === view ? 'bg-black text-white shadow-lg' : 'text-gray-400'
                                }`}
                        >
                            {view === 'lineup' ? '⚽ Formation' : '👥 Full Squad'}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {selectedView === 'lineup' ? (
                        <motion.div
                            key="lineup"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {/* Mini Pitch */}
                            <div className="relative aspect-[3/4] bg-gradient-to-b from-green-800 to-green-900 rounded-3xl overflow-hidden border border-green-700/30 shadow-xl">
                                {/* Pitch markings */}
                                <div className="absolute inset-4 border border-white/15 rounded-xl" />
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/10" />
                                {/* Penalty areas */}
                                <div className="absolute left-1/2 -translate-x-1/2 top-4 w-32 h-16 border border-white/10" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-32 h-16 border border-white/10" />

                                {/* Player dots */}
                                {FORMATION_POSITIONS.map((pos, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 + i * 0.05 }}
                                        className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                    >
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shadow-lg ${pos.isCurrentPlayer
                                                ? 'bg-orange-500 text-white ring-2 ring-orange-300 ring-offset-1 ring-offset-green-800'
                                                : 'bg-white/90 text-gray-900'
                                            }`}>
                                            {pos.number}
                                        </div>
                                        <span className={`text-[7px] font-bold mt-0.5 ${pos.isCurrentPlayer ? 'text-orange-300' : 'text-white/60'}`}>
                                            {pos.player.split(' ').pop()}
                                        </span>
                                    </motion.div>
                                ))}

                                {/* Formation label */}
                                <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm rounded-xl px-3 py-1.5">
                                    <span className="text-[8px] font-black text-white/70 uppercase tracking-widest">4-3-3</span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="squad"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-3"
                        >
                            {/* Starting */}
                            <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase flex items-center gap-2">
                                <Users className="w-3 h-3" /> Starting XI
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {FORMATION_POSITIONS.map((p, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border ${p.isCurrentPlayer
                                                ? 'bg-orange-50 border-orange-200'
                                                : 'bg-white border-gray-100'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${p.isCurrentPlayer ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {p.number}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-900 truncate">{p.player}</p>
                                            <p className="text-[8px] text-gray-400 font-bold uppercase">{p.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bench */}
                            <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase flex items-center gap-2 pt-4">
                                🪑 Bench
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {BENCH_PLAYERS.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                            {p.number}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                                            <p className="text-[8px] text-gray-400 font-bold uppercase">{p.position}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Confirm Attendance */}
                <div className="mt-8">
                    <Button fullWidth className="h-14 bg-black text-white rounded-2xl font-black tracking-widest text-sm">
                        ✓ CONFIRM ATTENDANCE
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
}
