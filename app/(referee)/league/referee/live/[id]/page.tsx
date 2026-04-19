'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    PageLayout,
    Card,
    CardContent,
    Button,
    Badge,
    NavIcons,
    Modal,
    Input
} from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * Referee Live Match Protocol (High Fidelity)
 * Mobile-first interface for match officials to record events with precision.
 */

export default function RefereeLiveConsole({ params }: { params: Promise<{ id: string }> }) {
    const { id: matchId } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [clock, setClock] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    const [eventModal, setEventModal] = useState<{ open: boolean, type: string, team: 'home' | 'away' }>({
        open: false,
        type: '',
        team: 'home'
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<string>('');
    const [notes, setNotes] = useState('');

    // --- Data Fetching with React Query polling ---
    const { data: match, isLoading } = useQuery({
        queryKey: ['match', matchId],
        queryFn: async () => {
            const res = await fetch(`/api/league/matches/${matchId}`);
            if (!res.ok) throw new Error('Failed to fetch match');
            return res.json();
        },
    });

    const { data: events = [] } = useQuery({
        queryKey: ['matchEvents', matchId],
        queryFn: async () => {
            const res = await fetch(`/api/league/matches/${matchId}/events`);
            if (!res.ok) throw new Error('Failed to fetch events');
            return res.json();
        },
    });

    // --- Real-time Subscriptions ---
    useEffect(() => {
        if (!matchId) return;

        const channel = supabase
            .channel(`referee-live-${matchId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'matches',
                    filter: `id=eq.${matchId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['match', matchId] });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'match_events',
                    filter: `match_id=eq.${matchId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['matchEvents', matchId] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [matchId, queryClient]);

    // Handle Clock Sync
    useEffect(() => {
        if (match && !isLoading) {
            // Using match.match_time string, parsing to int. Default to 0.
            const serverTime = parseInt(match.match_time || '0', 10) || 0;
            // Only sync local clock if not running or if it's way off
            if (!isRunning || Math.abs(serverTime - clock) > 10) {
                setClock(serverTime);
            }
            setIsRunning(match.status === 'live');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [match?.status, match?.match_time, isLoading]);

    // Local Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setClock(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Mutations ---
    const startMatchMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/league/matches/${matchId}/start`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to start match');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['match', matchId] });
            setIsRunning(true);
        }
    });

    const endMatchMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/league/matches/${matchId}/end`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to end match');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['match', matchId] });
            router.push('/league/matches');
        }
    });

    const addEventMutation = useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: async (eventData: any) => {
            const res = await fetch(`/api/league/matches/${matchId}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
            if (!res.ok) throw new Error('Failed to add event');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matchEvents', matchId] });
            queryClient.invalidateQueries({ queryKey: ['match', matchId] });
            setEventModal({ open: false, type: '', team: 'home' });
        }
    });

    const handleOpenEventModal = async (type: string, team: 'home' | 'away') => {
        const teamId = team === 'home' ? match.home_team_id : match.away_team_id;
        try {
            const res = await fetch(`/api/league/teams/${teamId}/players`);
            if (res.ok) setTeamPlayers(await res.json());
        } catch (e) {
            console.error('Failed to load players', e);
        }
        setEventModal({ open: true, type, team });
        setSelectedPlayer('');
        setNotes('');
    };

    const handleRecordEvent = async () => {
        if (!selectedPlayer) return;

        const typeMap: Record<string, string> = {
            '⚽ Goal': 'goal',
            '🟡 Yellow Card': 'yellow_card',
            '🔴 Red Card': 'red_card',
            '🔄 Substitution': 'substitution'
        };

        const mappedType = typeMap[eventModal.type] || 'goal';
        const teamId = eventModal.team === 'home' ? match.home_team_id : match.away_team_id;
        const player = teamPlayers.find(p => p.id === selectedPlayer);

        const eventData = {
            type: mappedType,
            team_id: teamId,
            player_id: selectedPlayer,
            player_name: player?.full_name || player?.name || 'Unknown',
            minute: Math.floor(clock / 60),
            details: notes ? { notes } : {}
        };

        addEventMutation.mutate(eventData);

        // Update score optimistically for goals
        if (mappedType === 'goal') {
            const newHomeScore = eventModal.team === 'home' ? (match.home_score || 0) + 1 : (match.home_score || 0);
            const newAwayScore = eventModal.team === 'away' ? (match.away_score || 0) + 1 : (match.away_score || 0);

            // Only optimistic update locally; server updates score in match triggers, 
            // but we might need to manually call score API if needed according to previous code
            // Actually, the new prompt asks events to just call /events.

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            queryClient.setQueryData(['match', matchId], (old: any) => ({
                ...old,
                home_score: newHomeScore,
                away_score: newAwayScore
            }));
        }
    };

    const toggleMatchStatus = () => {
        if (!isRunning) {
            startMatchMutation.mutate();
        } else {
            // Note: the prompt requested counting up from 0 and "Start Match", but no "Pause Match" API requirement.
            // We just stop the local timer. Ideally a "pause" endpoint would be called.
            setIsRunning(false);
        }
    };

    const handleEndMatch = () => {
        if (confirm('Are you sure you want to end the match?')) {
            endMatchMutation.mutate();
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading Console...</div>;
    if (!match) return <div className="min-h-screen flex items-center justify-center">Match Not Found</div>;

    const homeScore = match.home_score ?? 0;
    const awayScore = match.away_score ?? 0;

    return (
        <PageLayout navItems={adminNavItems} title="MATCH CONTROL">
            {/* High-Contrast Scoreboard */}
            <div className="sticky top-0 z-30 -mx-4 px-4 py-6 bg-black text-white shadow-2xl border-b border-orange-500/20">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <div className="text-center w-24">
                        <div className="text-2xl font-black mb-1 truncate">{match.home_team?.short_name || match.home_team?.name?.substring(0, 3)}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Home</div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center gap-6 mb-2">
                            <span className="text-6xl font-black tabular-nums">{homeScore}</span>
                            <span className="text-2xl text-orange-500 font-bold">:</span>
                            <span className="text-6xl font-black tabular-nums">{awayScore}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant={isRunning ? 'success' : 'secondary'} size="sm" className="font-mono px-3">
                                {isRunning ? '● LIVE' : (match.status === 'scheduled' ? 'SCHEDULED' : (match.status === 'finished' ? 'FINISHED' : 'PAUSED'))}
                            </Badge>
                            <span className="font-mono text-xl text-orange-500 font-black tracking-tighter">
                                {formatTime(clock)}
                            </span>
                        </div>
                    </div>

                    <div className="text-center w-24">
                        <div className="text-2xl font-black mb-1 truncate">{match.away_team?.short_name || match.away_team?.name?.substring(0, 3)}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Away</div>
                    </div>
                </div>
            </div>

            <main className="py-8 max-w-lg mx-auto space-y-6">
                {/* Precision Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Home Actions */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase text-center">{match.home_team?.name}</h4>
                        <Button
                            fullWidth
                            className="h-20 bg-green-600 hover:bg-green-700 text-white border-0 rounded-2xl flex flex-col gap-1 items-center justify-center"
                            onClick={() => handleOpenEventModal('⚽ Goal', 'home')}
                        >
                            <span className="text-2xl">⚽</span>
                            <span className="text-[10px] font-black tracking-widest uppercase">Goal</span>
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="secondary"
                                className="h-14 rounded-xl flex flex-col gap-1 items-center justify-center bg-gray-100 border-0"
                                onClick={() => handleOpenEventModal('🟡 Yellow Card', 'home')}
                            >
                                <span className="text-xs">🟡</span>
                                <span className="text-[8px] font-black uppercase">Yellow</span>
                            </Button>
                            <Button
                                variant="danger"
                                className="h-14 rounded-xl flex flex-col gap-1 items-center justify-center bg-red-50 text-red-600 border-0"
                                onClick={() => handleOpenEventModal('🔴 Red Card', 'home')}
                            >
                                <span className="text-xs">🔴</span>
                                <span className="text-[8px] font-black uppercase">Red</span>
                            </Button>
                        </div>
                        <Button
                            variant="secondary"
                            fullWidth
                            className="h-12 rounded-xl bg-gray-50 border-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-widest"
                            onClick={() => handleOpenEventModal('🔄 Substitution', 'home')}
                        >
                            🔄 Substitution
                        </Button>
                    </div>

                    {/* Away Actions */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase text-center">{match.away_team?.name}</h4>
                        <Button
                            fullWidth
                            className="h-20 bg-green-600 hover:bg-green-700 text-white border-0 rounded-2xl flex flex-col gap-1 items-center justify-center"
                            onClick={() => handleOpenEventModal('⚽ Goal', 'away')}
                        >
                            <span className="text-2xl">⚽</span>
                            <span className="text-[10px] font-black tracking-widest uppercase">Goal</span>
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="secondary"
                                className="h-14 rounded-xl flex flex-col gap-1 items-center justify-center bg-gray-100 border-0"
                                onClick={() => handleOpenEventModal('🟡 Yellow Card', 'away')}
                            >
                                <span className="text-xs">🟡</span>
                                <span className="text-[8px] font-black uppercase">Yellow</span>
                            </Button>
                            <Button
                                variant="danger"
                                className="h-14 rounded-xl flex flex-col gap-1 items-center justify-center bg-red-50 text-red-600 border-0"
                                onClick={() => handleOpenEventModal('🔴 Red Card', 'away')}
                            >
                                <span className="text-xs">🔴</span>
                                <span className="text-[8px] font-black uppercase">Red</span>
                            </Button>
                        </div>
                        <Button
                            variant="secondary"
                            fullWidth
                            className="h-12 rounded-xl bg-gray-50 border-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-widest"
                            onClick={() => handleOpenEventModal('🔄 Substitution', 'away')}
                        >
                            🔄 Substitution
                        </Button>
                    </div>
                </div>

                {/* Control Panel */}
                <Card elevated className="border-0 bg-gray-50 rounded-3xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4">
                            <Button
                                className={`flex-1 h-14 rounded-2xl font-black tracking-widest ${isRunning ? 'bg-orange-600 hover:bg-orange-700' : 'bg-black'} text-white`}
                                onClick={toggleMatchStatus}
                                disabled={startMatchMutation.isPending}
                            >
                                {isRunning ? '⏸ PAUSE CLOCK' : '▶ START PERIOD'}
                            </Button>
                            <Button
                                variant="secondary"
                                className="h-14 px-6 rounded-2xl border-gray-200 text-gray-400"
                                onClick={handleEndMatch}
                                disabled={endMatchMutation.isPending}
                            >
                                <NavIcons.Settings className="w-5 h-5" /> END
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Live Feed */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">Precision Match Feed</h3>
                    <AnimatePresence>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {events.slice(0, 10).map((event: any, i: number) => (
                            <motion.div
                                key={event.id || i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xs font-mono font-bold text-gray-400">
                                    {event.minute}'
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black capitalize">{event.type.replace('_', ' ')}</span>
                                        <Badge variant="secondary" size="sm" className="text-[8px]">{event.team_id === match.home_team_id ? 'HOME' : 'AWAY'}</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold">{event.player_name || event.player?.full_name}</p>
                                </div>
                                {event.details?.notes && <div className="text-[10px] text-gray-300">📄</div>}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {events.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                            <p className="text-[10px] font-black tracking-widest text-gray-300 uppercase">Waiting for first blood...</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Event Recording Modal */}
            <Modal
                isOpen={eventModal.open}
                onClose={() => setEventModal({ ...eventModal, open: false })}
                title={`Record ${eventModal.type}`}
            >
                <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 gap-4">
                        <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Select Player</label>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                            {teamPlayers.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedPlayer(p.id)}
                                    className={`p-3 rounded-xl border text-left transition-all ${selectedPlayer === p.id
                                        ? 'bg-black text-white border-black ring-2 ring-orange-500'
                                        : 'bg-gray-50 border-gray-100 hover:border-gray-200 text-gray-900'
                                        }`}
                                >
                                    <div className="text-[8px] font-black text-orange-500 mb-1">#{p.jersey_number || '??'}</div>
                                    <div className="text-xs font-bold truncate">{p.full_name || p.name}</div>
                                </button>
                            ))}
                            {teamPlayers.length === 0 && (
                                <div className="col-span-2 text-xs text-gray-400 italic text-center py-4">No players found</div>
                            )}
                        </div>
                    </div>

                    <Input
                        label="Add Notes (Optional)"
                        placeholder="e.g. Header from corner, tactical foul..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />

                    <div className="flex gap-4 pt-4">
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setEventModal({ ...eventModal, open: false })}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            disabled={!selectedPlayer || addEventMutation.isPending}
                            className="bg-black text-white"
                            onClick={handleRecordEvent}
                        >
                            {addEventMutation.isPending ? 'Saving...' : 'Confirm Event'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </PageLayout>
    );
}
