'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
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

const EVENT_ICONS: Record<string, string> = {
    goal: '⚽',
    own_goal: '⚽',
    yellow_card: '🟡',
    red_card: '🔴',
    substitution: '🔄',
    penalty: '⚽',
};

interface QueuedEvent {
    tempId: string;
    data: Record<string, unknown>;
    status: 'pending' | 'syncing' | 'synced' | 'failed';
}

/**
 * Referee Live Match Protocol (High Fidelity)
 * Mobile-first interface for match officials to record events with precision.
 * v2: Offline queue, undo toast, auto-timestamp, end-match modal, mobile-ready event logging.
 */

export default function RefereeLiveConsole({ params }: { params: Promise<{ id: string }> }) {
    const { id: matchId } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();

    const QUEUE_KEY = `plyaz_event_queue_${matchId}`;

    const [clock, setClock] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    // --- Offline event queue ---
    const [eventQueue, setEventQueue] = useState<QueuedEvent[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            return JSON.parse(localStorage.getItem(`plyaz_event_queue_${matchId}`) || '[]');
        } catch { return []; }
    });

    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    // --- Undo state ---
    const [lastLoggedEvent, setLastLoggedEvent] = useState<{
        id?: string;
        tempId?: string;
        description: string;
        timestamp: number;
    } | null>(null);

    // --- End match modal ---
    const [showEndModal, setShowEndModal] = useState(false);

    const [eventModal, setEventModal] = useState<{ open: boolean; type: string; team: 'home' | 'away' }>({
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

    // --- Persist queue to localStorage ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(eventQueue));
        }
    }, [eventQueue, QUEUE_KEY]);

    // --- Online/offline detection ---
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // --- Sync queue ---
    const syncQueue = useCallback(async () => {
        const pending = eventQueue.filter(e => e.status === 'pending');
        for (const item of pending) {
            try {
                const res = await fetch(`/api/league/matches/${matchId}/events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item.data)
                });
                if (res.ok) {
                    setEventQueue(prev => prev.filter(e => e.tempId !== item.tempId));
                    queryClient.invalidateQueries({ queryKey: ['matchEvents', matchId] });
                    queryClient.invalidateQueries({ queryKey: ['match', matchId] });
                } else {
                    setEventQueue(prev =>
                        prev.map(e => e.tempId === item.tempId ? { ...e, status: 'failed' as const } : e)
                    );
                }
            } catch {
                setEventQueue(prev =>
                    prev.map(e => e.tempId === item.tempId ? { ...e, status: 'failed' as const } : e)
                );
            }
        }
    }, [eventQueue, matchId, queryClient]);

    // Trigger sync when coming back online or when queue gains new pending items
    useEffect(() => {
        if (isOnline && eventQueue.some(e => e.status === 'pending')) {
            syncQueue();
        }
    }, [isOnline, syncQueue, eventQueue]);

    // --- Auto-clear undo toast after 15s ---
    useEffect(() => {
        if (!lastLoggedEvent) return;
        const t = setTimeout(() => setLastLoggedEvent(null), 15000);
        return () => clearTimeout(t);
    }, [lastLoggedEvent]);

    // --- Handle Clock Sync ---
    useEffect(() => {
        if (match && !isLoading) {
            if (match.started_at && match.status === 'live') {
                const elapsed = Math.floor((Date.now() - new Date(match.started_at).getTime()) / 1000);
                setClock(elapsed);
            } else {
                const serverTime = parseInt(match.match_time || '0', 10) || 0;
                if (!isRunning || Math.abs(serverTime - clock) > 10) {
                    setClock(serverTime);
                }
            }
            setIsRunning(match.status === 'live');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [match?.status, match?.match_time, match?.started_at, isLoading]);

    // --- Local Timer Logic ---
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

    // --- Auto-timestamp: prefer started_at over local clock ---
    const getMatchMinute = useCallback(() => {
        if (match?.started_at) {
            const elapsed = Math.floor((Date.now() - new Date(match.started_at).getTime()) / 1000);
            return Math.floor(elapsed / 60) + 1;
        }
        return Math.floor(clock / 60) + 1;
    }, [match?.started_at, clock]);

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

    const handleOpenEventModal = async (type: string, team: 'home' | 'away') => {
        if (!match) return;
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

    const handleRecordEvent = useCallback(async () => {
        if (!selectedPlayer || !match) return;

        const typeMap: Record<string, string> = {
            '⚽ Goal': 'goal',
            '🟡 Yellow Card': 'yellow_card',
            '🔴 Red Card': 'red_card',
            '🔄 Substitution': 'substitution'
        };

        const mappedType = typeMap[eventModal.type] || 'goal';
        const teamId = eventModal.team === 'home' ? match.home_team_id : match.away_team_id;
        const player = teamPlayers.find(p => p.id === selectedPlayer);
        const playerName = player?.full_name || player?.name || 'Unknown';

        const eventData: Record<string, unknown> = {
            type: mappedType,
            team_id: teamId,
            player_id: selectedPlayer,
            player_name: playerName,
            minute: getMatchMinute(),
            details: notes ? { notes } : {}
        };

        // Close modal immediately
        setEventModal({ open: false, type: '', team: 'home' });
        setSelectedPlayer('');
        setNotes('');

        // Optimistic score update for goals
        if (mappedType === 'goal') {
            const newHomeScore = eventModal.team === 'home' ? (match.home_score || 0) + 1 : (match.home_score || 0);
            const newAwayScore = eventModal.team === 'away' ? (match.away_score || 0) + 1 : (match.away_score || 0);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            queryClient.setQueryData(['match', matchId], (old: any) => ({
                ...old,
                home_score: newHomeScore,
                away_score: newAwayScore
            }));
        }

        const tempId = Date.now().toString();

        // Queue event locally
        setEventQueue(prev => [...prev, { tempId, data: eventData, status: 'pending' }]);

        // Set undo state
        setLastLoggedEvent({
            tempId,
            description: `${EVENT_ICONS[mappedType] ?? '📋'} ${mappedType.replace(/_/g, ' ')} — ${playerName}`,
            timestamp: Date.now()
        });
    }, [selectedPlayer, match, eventModal, teamPlayers, notes, getMatchMinute, queryClient, matchId]);

    const toggleMatchStatus = () => {
        if (!isRunning) {
            startMatchMutation.mutate();
        } else {
            setIsRunning(false);
        }
    };

    const handleEndMatch = () => {
        setShowEndModal(true);
    };

    // --- Loading / not found screens ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
                <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
                <p className="text-[11px] font-black tracking-[0.3em] uppercase text-gray-400">Loading Console...</p>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-6 px-8">
                <p className="text-6xl">🏟️</p>
                <h1 className="text-xl font-black tracking-widest uppercase">Match Not Found</h1>
                <p className="text-xs text-gray-500 text-center">This match does not exist or has been removed.</p>
                <Button onClick={() => router.push('/league/matches')} className="bg-orange-500 text-white">
                    Back to Matches
                </Button>
            </div>
        );
    }

    const homeScore = match.home_score ?? 0;
    const awayScore = match.away_score ?? 0;
    const pendingCount = eventQueue.filter(e => e.status === 'pending').length;

    return (
        <PageLayout navItems={adminNavItems} title="MATCH CONTROL">
            {/* High-Contrast Scoreboard */}
            <div className="sticky top-0 z-30 -mx-4 px-4 py-6 bg-black text-white shadow-2xl border-b border-orange-500/20 relative">
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

                {/* Offline / sync status indicator */}
                <div className="absolute bottom-2 left-4 flex items-center gap-1">
                    {!isOnline ? (
                        <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
                            Offline — {pendingCount} queued
                        </span>
                    ) : eventQueue.length > 0 ? (
                        <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                            Synced
                        </span>
                    ) : null}
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
                                    {event.minute}&apos;
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black capitalize">
                                            {EVENT_ICONS[event.type] ?? '📋'} {event.type.replace(/_/g, ' ')}
                                        </span>
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
                            <p className="text-[10px] font-black tracking-widest text-gray-300 uppercase">
                                No events yet. The match feed will appear here as you log goals and cards.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Undo Toast */}
            <AnimatePresence>
                {lastLoggedEvent && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl"
                    >
                        <span className="text-xs font-bold">{lastLoggedEvent.description}</span>
                        <button
                            onClick={async () => {
                                setEventQueue(prev => prev.filter(e => e.tempId !== lastLoggedEvent.tempId));
                                if (lastLoggedEvent.id) {
                                    try {
                                        await fetch(`/api/league/matches/${matchId}/events/${lastLoggedEvent.id}`, { method: 'DELETE' });
                                    } catch { /* best effort */ }
                                }
                                setLastLoggedEvent(null);
                                queryClient.invalidateQueries({ queryKey: ['matchEvents', matchId] });
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-orange-400 hover:text-orange-300"
                        >
                            Undo
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Event Recording Modal */}
            <Modal
                isOpen={eventModal.open}
                onClose={() => setEventModal({ open: false, type: '', team: 'home' })}
                title={`Record ${eventModal.type}`}
            >
                <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 gap-4">
                        <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Select Player</label>
                        <div className="grid grid-cols-3 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                            {teamPlayers.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedPlayer(p.id)}
                                    className={`p-4 rounded-2xl border text-left transition-all min-h-[64px] ${selectedPlayer === p.id
                                        ? 'bg-black text-white border-black ring-2 ring-orange-500'
                                        : 'bg-gray-50 border-gray-100 hover:border-gray-200 text-gray-900'
                                        }`}
                                >
                                    <div className="text-sm font-black text-orange-500 mb-1">#{p.jersey_number || '?'}</div>
                                    <div className="text-xs font-bold truncate leading-tight">{p.full_name || p.name}</div>
                                    <div className="text-[9px] text-gray-400 uppercase">{p.position || ''}</div>
                                </button>
                            ))}
                            {teamPlayers.length === 0 && (
                                <div className="col-span-3 text-xs text-gray-400 italic text-center py-4">No players found</div>
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
                            onClick={() => setEventModal({ open: false, type: '', team: 'home' })}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            disabled={!selectedPlayer}
                            className="bg-black text-white"
                            onClick={handleRecordEvent}
                        >
                            Confirm Event
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* End Match Confirmation Modal */}
            <Modal
                isOpen={showEndModal}
                onClose={() => setShowEndModal(false)}
                title="Full Time?"
            >
                <div className="space-y-6 pt-2">
                    <div className="bg-gray-50 rounded-2xl p-6 text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-4">Final Score</p>
                        <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-black">{homeScore}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{match?.home_team?.short_name ?? 'HOME'}</p>
                            </div>
                            <span className="text-gray-300 font-bold text-xl">—</span>
                            <div className="text-center">
                                <p className="text-2xl font-black">{awayScore}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{match?.away_team?.short_name ?? 'AWAY'}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-4">{events.length} events logged · {formatTime(clock)}</p>
                    </div>
                    <p className="text-sm text-gray-500 text-center">Confirming will end the match and submit the final result.</p>
                    <div className="flex gap-3">
                        <Button variant="secondary" fullWidth onClick={() => setShowEndModal(false)}>Keep Playing</Button>
                        <Button
                            fullWidth
                            className="bg-black text-white"
                            disabled={endMatchMutation.isPending}
                            isLoading={endMatchMutation.isPending}
                            onClick={() => { endMatchMutation.mutate(); setShowEndModal(false); }}
                        >
                            Confirm Full Time
                        </Button>
                    </div>
                </div>
            </Modal>
        </PageLayout>
    );
}
