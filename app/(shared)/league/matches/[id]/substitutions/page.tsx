'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout, PageHeader, Card, CardContent, Button, Badge } from '@/components/plyaz';
import { ArrowLeftRight, Check, Clock, ChevronLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePlayers } from '@/lib/hooks';
import { useToast } from '@/components/providers';

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

export default function SubstitutionsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const { success, error: toastError } = useToast();

    const { data: match } = useQuery({
        queryKey: ['match', id],
        queryFn: async () => {
            const res = await fetch(`/api/league/matches/${id}`);
            if (!res.ok) throw new Error('Failed to fetch match');
            return res.json();
        },
        enabled: !!id,
    });

    const matchMinute = useMemo(() => {
        if (!match) return 0;
        if (match.started_at && match.status === 'live') {
            return Math.floor((Date.now() - new Date(match.started_at).getTime()) / 60000);
        }
        return parseInt(match.match_time || '0', 10);
    }, [match]);

    const { data: rawPlayers = [], isLoading: playersLoading } = usePlayers(match?.home_team_id ?? '');

    const allPlayers: MatchPlayer[] = useMemo(() =>
        rawPlayers.map((p, i) => ({
            id: p.id,
            name: p.name,
            position: p.position ?? 'PLAYER',
            number: p.jersey_number ?? i + 1,
            isOnPitch: i < 11,
            minutesPlayed: i < 11 ? matchMinute : undefined,
        })),
        [rawPlayers, matchMinute]
    );

    const [onPitch, setOnPitch] = useState<MatchPlayer[]>([]);
    const [bench, setBench] = useState<MatchPlayer[]>([]);
    const [initialized, setInitialized] = useState(false);

    // Initialize from real players once loaded
    React.useEffect(() => {
        if (allPlayers.length > 0 && !initialized) {
            setOnPitch(allPlayers.filter(p => p.isOnPitch));
            setBench(allPlayers.filter(p => !p.isOnPitch));
            setInitialized(true);
        }
    }, [allPlayers, initialized]);

    const [selectedOut, setSelectedOut] = useState<MatchPlayer | null>(null);
    const [selectedIn, setSelectedIn] = useState<MatchPlayer | null>(null);
    const [history, setHistory] = useState<SubstitutionRecord[]>([]);
    const maxSubs = 5;

    const handleConfirmSub = async () => {
        if (!selectedOut || !selectedIn) return;

        const record: SubstitutionRecord = {
            id: Date.now().toString(),
            playerOut: selectedOut,
            playerIn: selectedIn,
            minute: matchMinute,
            timestamp: new Date().toLocaleTimeString(),
        };

        // Post to API
        try {
            await fetch(`/api/league/matches/${id}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'substitution',
                    player_id: selectedIn.id,
                    player_name: selectedIn.name,
                    minute: matchMinute,
                    details: { player_out_id: selectedOut.id, player_out_name: selectedOut.name },
                }),
            });
            success(`${selectedIn.name} on · ${selectedOut.name} off`);
        } catch {
            toastError('Failed to log substitution. Recorded locally only.');
        }

        setHistory([record, ...history]);
        setOnPitch(prev => prev.map(p => p.id === selectedOut.id
            ? { ...selectedIn, isOnPitch: true, minutesPlayed: 0 }
            : p
        ));
        setBench(prev => prev.filter(p => p.id !== selectedIn.id));
        setSelectedOut(null);
        setSelectedIn(null);
    };

    const isLoading = !match || playersLoading || !initialized;

    return (
        <PageLayout title="SUBS">
            <div className="max-w-2xl pb-24">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 hover:text-orange-500 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Match
                </button>

                <PageHeader
                    label={match?.status === 'live' ? `Live Match · ${matchMinute}'` : 'Match'}
                    title="Substitutions"
                    description={`${history.length}/${maxSubs} substitutions used`}
                />

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />)}
                    </div>
                ) : (
                    <>
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
                                                        <div className="w-14 h-14 mx-auto rounded-full border-2 border-dashed border-red-300 flex items-center justify-center text-xs text-red-400">?</div>
                                                    )}
                                                </div>
                                                <ArrowLeftRight className="w-6 h-6 text-orange-500 mx-4 flex-shrink-0" />
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
                                                        <div className="w-14 h-14 mx-auto rounded-full border-2 border-dashed border-green-300 flex items-center justify-center text-xs text-green-400">?</div>
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
                                On the Pitch — tap to sub out
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {onPitch.map((player) => (
                                    <motion.button
                                        key={player.id}
                                        layout
                                        onClick={() => setSelectedOut(selectedOut?.id === player.id ? null : player)}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${selectedOut?.id === player.id
                                            ? 'bg-red-50 border-red-300 ring-2 ring-red-200'
                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${selectedOut?.id === player.id ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'}`}>
                                            {player.number}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{player.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">{player.position}</span>
                                                {player.minutesPlayed != null && (
                                                    <span className="text-[8px] text-gray-300 flex items-center gap-0.5">
                                                        <Clock className="w-2.5 h-2.5" /> {player.minutesPlayed}&apos;
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Bench */}
                        <div className="mb-8">
                            <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-3">
                                Bench — tap to bring on
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
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${selectedIn?.id === player.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
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
                                <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-3">Substitution History</h3>
                                <div className="space-y-2">
                                    {history.map((sub) => (
                                        <Card key={sub.id} className="border-0 bg-gray-50 rounded-2xl">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="secondary" className="text-[8px] font-black">{sub.minute}&apos;</Badge>
                                                        <p className="text-sm">
                                                            <span className="text-red-500 font-bold">↓ {sub.playerOut.name}</span>
                                                            <span className="text-gray-300 mx-2">→</span>
                                                            <span className="text-green-500 font-bold">↑ {sub.playerIn.name}</span>
                                                        </p>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400">{sub.timestamp}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PageLayout>
    );
}
