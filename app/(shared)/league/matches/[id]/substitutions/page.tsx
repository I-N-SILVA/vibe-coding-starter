'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout, PageHeader, Card, CardContent, Button, Badge } from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { ArrowLeftRight, Check, Clock, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Substitution Manager
 * Allows managers to request substitutions during a live match.
 */

interface MatchPlayer {
    id: string;
    name: string;
    position: string;
    number: number;
    isOnPitch: boolean;
    minutesPlayed?: number;
}

interface SubstitutionRecord {
    id: string;
    playerOut: MatchPlayer;
    playerIn: MatchPlayer;
    minute: number;
    timestamp: string;
}

const MOCK_CURRENT_LINEUP: MatchPlayer[] = [
    { id: 'p1', name: 'D. Silva', position: 'GK', number: 1, isOnPitch: true, minutesPlayed: 67 },
    { id: 'p3', name: 'A. Cole', position: 'LB', number: 3, isOnPitch: true, minutesPlayed: 67 },
    { id: 'p4', name: 'R. Keane', position: 'CB', number: 4, isOnPitch: true, minutesPlayed: 67 },
    { id: 'p5', name: 'J. Stones', position: 'CB', number: 5, isOnPitch: true, minutesPlayed: 67 },
    { id: 'p2', name: 'T. Walker', position: 'RB', number: 2, isOnPitch: true, minutesPlayed: 67 },
    { id: 'p8', name: 'L. Modric', position: 'CM', number: 8, isOnPitch: true, minutesPlayed: 67 },
    { id: 'p10', name: 'K. De Bruyne', position: 'CM', number: 10, isOnPitch: true, minutesPlayed: 67 },
    { id: 'p7', name: 'N. Kanté', position: 'CM', number: 7, isOnPitch: true, minutesPlayed: 67 },
    { id: 'p11', name: 'S. Mané', position: 'LW', number: 11, isOnPitch: true, minutesPlayed: 67 },
    { id: 'p9', name: 'M. Rivera', position: 'ST', number: 9, isOnPitch: true, minutesPlayed: 67 },
    { id: 'p6', name: 'M. Salah', position: 'RW', number: 6, isOnPitch: true, minutesPlayed: 67 },
];

const MOCK_BENCH: MatchPlayer[] = [
    { id: 'p12', name: 'C. Peres', position: 'GK', number: 12, isOnPitch: false },
    { id: 'p15', name: 'H. Maguire', position: 'CB', number: 15, isOnPitch: false },
    { id: 'p14', name: 'F. Henderson', position: 'CM', number: 14, isOnPitch: false },
    { id: 'p17', name: 'J. Lingard', position: 'RW', number: 17, isOnPitch: false },
    { id: 'p18', name: 'A. Martial', position: 'ST', number: 18, isOnPitch: false },
];

export default function SubstitutionsPage() {
    const router = useRouter();
    const [onPitch, setOnPitch] = useState<MatchPlayer[]>(MOCK_CURRENT_LINEUP);
    const [bench, setBench] = useState<MatchPlayer[]>(MOCK_BENCH);
    const [selectedOut, setSelectedOut] = useState<MatchPlayer | null>(null);
    const [selectedIn, setSelectedIn] = useState<MatchPlayer | null>(null);
    const [history, setHistory] = useState<SubstitutionRecord[]>([]);
    const [matchMinute] = useState(67);
    const maxSubs = 5;

    const handleConfirmSub = () => {
        if (!selectedOut || !selectedIn) return;

        const record: SubstitutionRecord = {
            id: Date.now().toString(),
            playerOut: selectedOut,
            playerIn: selectedIn,
            minute: matchMinute,
            timestamp: new Date().toLocaleTimeString(),
        };

        setHistory([record, ...history]);
        setOnPitch(prev => prev.map(p => p.id === selectedOut.id ? { ...selectedIn, isOnPitch: true, minutesPlayed: 0 } : p));
        setBench(prev => prev.filter(p => p.id !== selectedIn.id));
        setSelectedOut(null);
        setSelectedIn(null);
    };

    return (
        <PageLayout navItems={adminNavItems} title="SUBS">
            <div className="max-w-2xl pb-24">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 hover:text-orange-500 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Match
                </button>

                <PageHeader
                    label="Live Match · 67'"
                    title="Substitutions"
                    description={`${history.length}/${maxSubs} substitutions used`}
                />

                {/* Active Swap Preview */}
                <AnimatePresence>
                    {(selectedOut || selectedIn) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                        >
                            <Card className="border-2 border-orange-300 bg-orange-50 rounded-3xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        {/* Player Out */}
                                        <div className="flex-1 text-center">
                                            {selectedOut ? (
                                                <div>
                                                    <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center text-lg font-black text-red-600 mb-2">
                                                        {selectedOut.number}
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900">{selectedOut.name}</p>
                                                    <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1">OUT</p>
                                                </div>
                                            ) : (
                                                <div className="w-14 h-14 mx-auto rounded-full border-2 border-dashed border-red-300 flex items-center justify-center text-xs text-red-400">
                                                    ?
                                                </div>
                                            )}
                                        </div>

                                        {/* Arrow */}
                                        <ArrowLeftRight className="w-6 h-6 text-orange-500 mx-4 flex-shrink-0" />

                                        {/* Player In */}
                                        <div className="flex-1 text-center">
                                            {selectedIn ? (
                                                <div>
                                                    <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center text-lg font-black text-green-600 mb-2">
                                                        {selectedIn.number}
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900">{selectedIn.name}</p>
                                                    <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest mt-1">IN</p>
                                                </div>
                                            ) : (
                                                <div className="w-14 h-14 mx-auto rounded-full border-2 border-dashed border-green-300 flex items-center justify-center text-xs text-green-400">
                                                    ?
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedOut && selectedIn && (
                                        <Button
                                            fullWidth
                                            className="h-12 mt-6 bg-orange-500 text-white rounded-2xl font-black tracking-widest text-sm"
                                            onClick={handleConfirmSub}
                                        >
                                            <Check className="w-4 h-4 mr-2" /> CONFIRM SUBSTITUTION
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* On Pitch */}
                <div className="mb-6">
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-3">
                        ⚽ On the Pitch — Select player to sub out
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {onPitch.map((player) => (
                            <motion.button
                                key={player.id}
                                layout
                                onClick={() => {
                                    setSelectedOut(selectedOut?.id === player.id ? null : player);
                                }}
                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${selectedOut?.id === player.id
                                        ? 'bg-red-50 border-red-300 ring-2 ring-red-200'
                                        : 'bg-white border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${selectedOut?.id === player.id ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'
                                    }`}>
                                    {player.number}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{player.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[8px] font-bold text-gray-400 uppercase">{player.position}</span>
                                        <span className="text-[8px] text-gray-300 flex items-center gap-0.5">
                                            <Clock className="w-2.5 h-2.5" /> {player.minutesPlayed}&apos;
                                        </span>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Bench */}
                <div className="mb-8">
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-3">
                        🪑 Bench — Select player to bring on
                    </h3>
                    {bench.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {bench.map((player) => (
                                <motion.button
                                    key={player.id}
                                    layout
                                    onClick={() => {
                                        if (!selectedOut) return;
                                        setSelectedIn(selectedIn?.id === player.id ? null : player);
                                    }}
                                    disabled={!selectedOut}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${selectedIn?.id === player.id
                                            ? 'bg-green-50 border-green-300 ring-2 ring-green-200'
                                            : !selectedOut
                                                ? 'bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed'
                                                : 'bg-white border-gray-100 hover:border-green-200'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${selectedIn?.id === player.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {player.number}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{player.name}</p>
                                        <span className="text-[8px] font-bold text-gray-400 uppercase">{player.position}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-300 text-sm font-bold">
                            No more substitutes available
                        </div>
                    )}
                </div>

                {/* Substitution History */}
                {history.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-3">
                            📋 Substitution History
                        </h3>
                        <div className="space-y-2">
                            {history.map((sub) => (
                                <Card key={sub.id} className="border-0 bg-gray-50 rounded-2xl">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="text-[8px] font-black">{sub.minute}&apos;</Badge>
                                                <div>
                                                    <p className="text-sm">
                                                        <span className="text-red-500 font-bold">↓ {sub.playerOut.name}</span>
                                                        <span className="text-gray-300 mx-2">→</span>
                                                        <span className="text-green-500 font-bold">↑ {sub.playerIn.name}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400">{sub.timestamp}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
