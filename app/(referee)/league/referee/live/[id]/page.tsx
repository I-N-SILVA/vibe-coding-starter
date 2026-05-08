'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageLayout, Card, CardContent, Button, Badge, NavIcons } from '@/components/plyaz';
import { createClient } from '@/lib/supabase/client';
import { triggerHaptic } from '@/lib/utils';
import type { Player } from '@/lib/supabase/types';

const supabase = createClient();

const EVENT_ICONS: Record<string, string> = {
    goal: '⚽',
    own_goal: '⚽',
    yellow_card: '🟡',
    red_card: '🔴',
    substitution: '🔄',
    penalty: '⚽',
};

const TYPE_MAP: Record<string, string> = {
    '⚽ Goal': 'goal',
    '🟡 Yellow Card': 'yellow_card',
    '🔴 Red Card': 'red_card',
    '🔄 Substitution': 'substitution',
};

interface QueuedEvent {
    tempId: string;
    data: Record<string, unknown>;
    status: 'pending' | 'syncing' | 'synced' | 'failed';
}

// ─────────────────────────────────────────
// Player Picker Sheet
// ─────────────────────────────────────────
interface PlayerPickerSheetProps {
    isOpen: boolean;
    eventType: string;
    homeTeam: { id: string; name: string; short_name?: string } | null;
    awayTeam: { id: string; name: string; short_name?: string } | null;
    homePlayers: Player[];
    awayPlayers: Player[];
    onConfirm: (params: {
        teamId: string;
        teamSide: 'home' | 'away';
        playerId: string | null;
        playerName: string;
        notes: string;
    }) => void;
    onClose: () => void;
    isFetchingPlayers: boolean;
}

function PlayerPickerSheet({
    isOpen,
    eventType,
    homeTeam,
    awayTeam,
    homePlayers,
    awayPlayers,
    onConfirm,
    onClose,
    isFetchingPlayers,
}: PlayerPickerSheetProps) {
    const [step, setStep] = useState<'team' | 'player'>('team');
    const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [manualName, setManualName] = useState('');
    const [notes, setNotes] = useState('');

    // Reset when sheet opens
    useEffect(() => {
        if (isOpen) {
            setStep('team');
            setSelectedTeam(null);
            setSelectedPlayerId(null);
            setManualName('');
            setNotes('');
        }
    }, [isOpen]);

    const players = selectedTeam === 'home' ? homePlayers : awayPlayers;
    const selectedTeamObj = selectedTeam === 'home' ? homeTeam : awayTeam;

    const handleTeamSelect = (side: 'home' | 'away') => {
        triggerHaptic('light');
        setSelectedTeam(side);
        setSelectedPlayerId(null);
        setManualName('');
        setStep('player');
    };

    const handlePlayerSelect = (id: string) => {
        triggerHaptic('light');
        setSelectedPlayerId(id);
        setManualName('');
    };

    const handleUnknownPlayer = () => {
        triggerHaptic('light');
        setSelectedPlayerId(null);
        setManualName('');
    };

    const canConfirm = selectedTeam !== null;

    const handleConfirm = () => {
        if (!selectedTeam || !selectedTeamObj) return;
        const teamId = selectedTeam === 'home' ? homeTeam?.id : awayTeam?.id;
        if (!teamId) return;

        let playerName = 'Unknown';
        if (selectedPlayerId) {
            const p = players.find((pl) => pl.id === selectedPlayerId);
            playerName = p?.name ?? (manualName || 'Unknown');
        } else if (manualName.trim()) {
            playerName = manualName.trim();
        }

        triggerHaptic('success');
        onConfirm({
            teamId,
            teamSide: selectedTeam,
            playerId: selectedPlayerId,
            playerName,
            notes,
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/70"
                        onClick={onClose}
                    />

                    {/* Bottom sheet */}
                    <motion.div
                        key="sheet"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-t-3xl bg-gray-950"
                    >
                        {/* Drag handle */}
                        <div className="flex flex-shrink-0 justify-center pb-1 pt-3">
                            <div className="h-1 w-10 rounded-full bg-gray-700" />
                        </div>

                        {/* Header */}
                        <div className="flex-shrink-0 border-b border-gray-800 px-6 pb-4 pt-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">
                                        {eventType}
                                    </p>
                                    <h2 className="text-xl font-black text-white">
                                        {step === 'team'
                                            ? 'Which team?'
                                            : `${selectedTeamObj?.name ?? 'Select'} — Who?`}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Step dots */}
                            <div className="mt-3 flex gap-2">
                                <div className="h-1 w-6 rounded-full bg-orange-500" />
                                <div
                                    className={`h-1 w-6 rounded-full transition-colors ${step === 'player' ? 'bg-orange-500' : 'bg-gray-700'}`}
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                            {step === 'team' ? (
                                /* Step 1: Team selection */
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleTeamSelect('home')}
                                        className="flex min-h-[100px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-gray-700 bg-gray-900 p-6 text-white transition-all hover:border-orange-500 active:scale-95"
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                                            Home
                                        </span>
                                        <span className="text-center text-lg font-black leading-tight">
                                            {homeTeam?.name ?? 'Home'}
                                        </span>
                                        <span className="text-2xl">🏠</span>
                                    </button>
                                    <button
                                        onClick={() => handleTeamSelect('away')}
                                        className="flex min-h-[100px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-gray-700 bg-gray-900 p-6 text-white transition-all hover:border-orange-500 active:scale-95"
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                                            Away
                                        </span>
                                        <span className="text-center text-lg font-black leading-tight">
                                            {awayTeam?.name ?? 'Away'}
                                        </span>
                                        <span className="text-2xl">✈️</span>
                                    </button>
                                </div>
                            ) : (
                                /* Step 2: Player selection */
                                <>
                                    {/* Back link */}
                                    <button
                                        onClick={() => setStep('team')}
                                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-orange-400"
                                    >
                                        ← Change team
                                    </button>

                                    {isFetchingPlayers ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {/* No player / Unknown option */}
                                            <button
                                                onClick={handleUnknownPlayer}
                                                className={`flex min-h-[56px] w-full items-center gap-4 rounded-2xl border p-4 transition-all ${
                                                    selectedPlayerId === null && manualName === ''
                                                        ? 'border-orange-500 bg-orange-500/10 text-white'
                                                        : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'
                                                }`}
                                            >
                                                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-800 text-sm font-black text-gray-500">
                                                    ?
                                                </span>
                                                <span className="text-sm font-bold">
                                                    Unknown / No attribution
                                                </span>
                                            </button>

                                            {/* Player list */}
                                            {players.map((player) => (
                                                <button
                                                    key={player.id}
                                                    onClick={() => handlePlayerSelect(player.id)}
                                                    className={`flex min-h-[56px] w-full items-center gap-4 rounded-2xl border p-4 transition-all ${
                                                        selectedPlayerId === player.id
                                                            ? 'border-orange-500 bg-orange-500/10 text-white'
                                                            : 'border-gray-700 bg-gray-900 text-white hover:border-gray-500'
                                                    }`}
                                                >
                                                    <span
                                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg font-black ${
                                                            selectedPlayerId === player.id
                                                                ? 'bg-orange-500 text-white'
                                                                : 'bg-gray-800 text-orange-400'
                                                        }`}
                                                    >
                                                        {player.jersey_number ?? '?'}
                                                    </span>
                                                    <div className="flex-1 text-left">
                                                        <p className="text-sm font-black leading-tight">
                                                            {player.name}
                                                        </p>
                                                        {player.position && (
                                                            <p className="mt-0.5 text-[10px] uppercase tracking-widest text-gray-500">
                                                                {player.position}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {selectedPlayerId === player.id && (
                                                        <span className="text-sm text-orange-400">
                                                            ✓
                                                        </span>
                                                    )}
                                                </button>
                                            ))}

                                            {players.length === 0 && (
                                                <p className="py-4 text-center text-xs text-gray-600">
                                                    No players registered for this team
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Manual name input */}
                                    <div className="space-y-2 pt-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            Or type name manually
                                        </label>
                                        <input
                                            type="text"
                                            value={manualName}
                                            onChange={(e) => {
                                                setManualName(e.target.value);
                                                if (e.target.value) setSelectedPlayerId(null);
                                            }}
                                            placeholder="Player name..."
                                            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            Notes (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="e.g. Header from corner, tactical foul..."
                                            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        {step === 'player' && (
                            <div className="flex-shrink-0 space-y-3 border-t border-gray-800 px-6 py-4">
                                <button
                                    onClick={handleConfirm}
                                    disabled={!canConfirm}
                                    className={`h-14 w-full rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                                        canConfirm
                                            ? 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
                                            : 'cursor-not-allowed bg-gray-800 text-gray-600'
                                    }`}
                                >
                                    Confirm {eventType}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="h-10 w-full text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/**
 * Referee Live Match Protocol (High Fidelity)
 * Mobile-first interface for match officials to record events with precision.
 * v3: Player picker bottom sheet with team → player two-step flow.
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
        } catch {
            return [];
        }
    });

    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true,
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

    // --- Player picker sheet state ---
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerEventType, setPickerEventType] = useState('');
    const [homePlayers, setHomePlayers] = useState<Player[]>([]);
    const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
    const [isFetchingPlayers, setIsFetchingPlayers] = useState(false);

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

    // --- Fetch both teams' players when match loads ---
    useEffect(() => {
        if (!match) return;

        const fetchTeamPlayers = async () => {
            setIsFetchingPlayers(true);
            try {
                const [homeRes, awayRes] = await Promise.all([
                    fetch(`/api/league/teams/${match.home_team_id}/players`),
                    fetch(`/api/league/teams/${match.away_team_id}/players`),
                ]);
                if (homeRes.ok) setHomePlayers(await homeRes.json());
                if (awayRes.ok) setAwayPlayers(await awayRes.json());
            } catch (e) {
                console.error('[RefereeLive] Failed to load players', e);
            } finally {
                setIsFetchingPlayers(false);
            }
        };

        fetchTeamPlayers();
    }, [match?.home_team_id, match?.away_team_id]); // eslint-disable-line react-hooks/exhaustive-deps

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
                },
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
                },
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
        const pending = eventQueue.filter((e) => e.status === 'pending');
        for (const item of pending) {
            try {
                const res = await fetch(`/api/league/matches/${matchId}/events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item.data),
                });
                if (res.ok) {
                    setEventQueue((prev) => prev.filter((e) => e.tempId !== item.tempId));
                    queryClient.invalidateQueries({ queryKey: ['matchEvents', matchId] });
                    queryClient.invalidateQueries({ queryKey: ['match', matchId] });
                } else {
                    setEventQueue((prev) =>
                        prev.map((e) =>
                            e.tempId === item.tempId ? { ...e, status: 'failed' as const } : e,
                        ),
                    );
                }
            } catch {
                setEventQueue((prev) =>
                    prev.map((e) =>
                        e.tempId === item.tempId ? { ...e, status: 'failed' as const } : e,
                    ),
                );
            }
        }
    }, [eventQueue, matchId, queryClient]);

    // Trigger sync when coming back online or when queue gains new pending items
    useEffect(() => {
        if (isOnline && eventQueue.some((e) => e.status === 'pending')) {
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
                const elapsed = Math.floor(
                    (Date.now() - new Date(match.started_at).getTime()) / 1000,
                );
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
                setClock((prev) => prev + 1);
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

    // --- Open player picker sheet ---
    const handleOpenPicker = (type: string) => {
        if (!match) return;
        triggerHaptic('light');
        setPickerEventType(type);
        setPickerOpen(true);
    };

    // --- Record event after picker confirms ---
    const handlePickerConfirm = useCallback(
        async ({
            teamId,
            teamSide,
            playerId,
            playerName,
            notes,
        }: {
            teamId: string;
            teamSide: 'home' | 'away';
            playerId: string | null;
            playerName: string;
            notes: string;
        }) => {
            if (!match) return;
            setPickerOpen(false);

            const mappedType = TYPE_MAP[pickerEventType] || 'goal';

            const eventData: Record<string, unknown> = {
                type: mappedType,
                team_id: teamId,
                player_id: playerId ?? undefined,
                player_name: playerName,
                minute: getMatchMinute(),
                details: notes ? { notes } : {},
            };

            // Optimistic score update for goals
            if (mappedType === 'goal') {
                const newHomeScore =
                    teamSide === 'home' ? (match.home_score || 0) + 1 : match.home_score || 0;
                const newAwayScore =
                    teamSide === 'away' ? (match.away_score || 0) + 1 : match.away_score || 0;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                queryClient.setQueryData(['match', matchId], (old: any) => ({
                    ...old,
                    home_score: newHomeScore,
                    away_score: newAwayScore,
                }));
            }

            const tempId = Date.now().toString();
            setEventQueue((prev) => [...prev, { tempId, data: eventData, status: 'pending' }]);

            setLastLoggedEvent({
                tempId,
                description: `${EVENT_ICONS[mappedType] ?? '📋'} ${mappedType.replace(/_/g, ' ')} — ${playerName}`,
                timestamp: Date.now(),
            });
        },
        [match, matchId, pickerEventType, getMatchMinute, queryClient],
    );

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
        },
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
        },
    });

    const toggleMatchStatus = () => {
        triggerHaptic('medium');
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
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                    Loading Console...
                </p>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-8 text-white">
                <p className="text-6xl">🏟️</p>
                <h1 className="text-xl font-black uppercase tracking-widest">Match Not Found</h1>
                <p className="text-center text-xs text-gray-500">
                    This match does not exist or has been removed.
                </p>
                <Button
                    onClick={() => router.push('/league/matches')}
                    className="bg-orange-500 text-white"
                >
                    Back to Matches
                </Button>
            </div>
        );
    }

    const homeScore = match.home_score ?? 0;
    const awayScore = match.away_score ?? 0;
    const pendingCount = eventQueue.filter((e) => e.status === 'pending').length;

    return (
        <PageLayout title="MATCH CONTROL">
            {/* High-Contrast Scoreboard */}
            <div className="relative sticky top-0 z-30 -mx-4 border-b border-orange-500/20 bg-black px-4 py-6 text-white shadow-2xl">
                <div className="mx-auto flex max-w-lg items-center justify-between">
                    <div className="w-24 text-center">
                        <div className="mb-1 truncate text-2xl font-black">
                            {match.home_team?.short_name || match.home_team?.name?.substring(0, 3)}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Home
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="mb-2 flex items-center gap-6">
                            <span className="text-6xl font-black tabular-nums">{homeScore}</span>
                            <span className="text-2xl font-bold text-orange-500">:</span>
                            <span className="text-6xl font-black tabular-nums">{awayScore}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <Badge
                                variant={isRunning ? 'success' : 'secondary'}
                                size="sm"
                                className="px-3 font-mono"
                            >
                                {isRunning
                                    ? '● LIVE'
                                    : match.status === 'scheduled'
                                      ? 'SCHEDULED'
                                      : match.status === 'finished'
                                        ? 'FINISHED'
                                        : 'PAUSED'}
                            </Badge>
                            <span className="font-mono text-xl font-black tracking-tighter text-orange-500">
                                {formatTime(clock)}
                            </span>
                        </div>
                    </div>

                    <div className="w-24 text-center">
                        <div className="mb-1 truncate text-2xl font-black">
                            {match.away_team?.short_name || match.away_team?.name?.substring(0, 3)}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Away
                        </div>
                    </div>
                </div>

                {/* Offline / sync status indicator */}
                <div className="absolute bottom-2 left-4 flex items-center gap-1">
                    {!isOnline ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-orange-400">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-400" />
                            Offline — {pendingCount} queued
                        </span>
                    ) : eventQueue.length > 0 ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-green-400">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                            Synced
                        </span>
                    ) : null}
                </div>
            </div>

            <main className="mx-auto max-w-lg space-y-6 py-8">
                {/* Precision Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Home Actions */}
                    <div className="space-y-3">
                        <h4 className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            {match.home_team?.name}
                        </h4>
                        <Button
                            fullWidth
                            className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border-0 bg-green-600 text-white hover:bg-green-700"
                            onClick={() => handleOpenPicker('⚽ Goal')}
                        >
                            <span className="text-2xl">⚽</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                Goal
                            </span>
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="secondary"
                                className="flex h-14 flex-col items-center justify-center gap-1 rounded-xl border-0 bg-gray-100"
                                onClick={() => handleOpenPicker('🟡 Yellow Card')}
                            >
                                <span className="text-xs">🟡</span>
                                <span className="text-[8px] font-black uppercase">Yellow</span>
                            </Button>
                            <Button
                                variant="danger"
                                className="flex h-14 flex-col items-center justify-center gap-1 rounded-xl border-0 bg-red-50 text-red-600"
                                onClick={() => handleOpenPicker('🔴 Red Card')}
                            >
                                <span className="text-xs">🔴</span>
                                <span className="text-[8px] font-black uppercase">Red</span>
                            </Button>
                        </div>
                        <Button
                            variant="secondary"
                            fullWidth
                            className="h-12 rounded-xl border-gray-100 bg-gray-50 text-[9px] font-bold uppercase tracking-widest text-gray-500"
                            onClick={() => handleOpenPicker('🔄 Substitution')}
                        >
                            🔄 Substitution
                        </Button>
                    </div>

                    {/* Away Actions */}
                    <div className="space-y-3">
                        <h4 className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            {match.away_team?.name}
                        </h4>
                        <Button
                            fullWidth
                            className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border-0 bg-green-600 text-white hover:bg-green-700"
                            onClick={() => handleOpenPicker('⚽ Goal')}
                        >
                            <span className="text-2xl">⚽</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                Goal
                            </span>
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="secondary"
                                className="flex h-14 flex-col items-center justify-center gap-1 rounded-xl border-0 bg-gray-100"
                                onClick={() => handleOpenPicker('🟡 Yellow Card')}
                            >
                                <span className="text-xs">🟡</span>
                                <span className="text-[8px] font-black uppercase">Yellow</span>
                            </Button>
                            <Button
                                variant="danger"
                                className="flex h-14 flex-col items-center justify-center gap-1 rounded-xl border-0 bg-red-50 text-red-600"
                                onClick={() => handleOpenPicker('🔴 Red Card')}
                            >
                                <span className="text-xs">🔴</span>
                                <span className="text-[8px] font-black uppercase">Red</span>
                            </Button>
                        </div>
                        <Button
                            variant="secondary"
                            fullWidth
                            className="h-12 rounded-xl border-gray-100 bg-gray-50 text-[9px] font-bold uppercase tracking-widest text-gray-500"
                            onClick={() => handleOpenPicker('🔄 Substitution')}
                        >
                            🔄 Substitution
                        </Button>
                    </div>
                </div>

                {/* Control Panel */}
                <Card elevated className="overflow-hidden rounded-3xl border-0 bg-gray-50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4">
                            <Button
                                className={`h-14 flex-1 rounded-2xl font-black tracking-widest ${isRunning ? 'bg-orange-600 hover:bg-orange-700' : 'bg-black'} text-white`}
                                onClick={toggleMatchStatus}
                                disabled={startMatchMutation.isPending}
                            >
                                {isRunning ? '⏸ PAUSE CLOCK' : '▶ START PERIOD'}
                            </Button>
                            <Button
                                variant="secondary"
                                className="h-14 rounded-2xl border-gray-200 px-6 text-gray-400"
                                onClick={handleEndMatch}
                                disabled={endMatchMutation.isPending}
                            >
                                <NavIcons.Settings className="h-5 w-5" /> END
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Live Feed */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                        Precision Match Feed
                    </h3>
                    <AnimatePresence>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {events.slice(0, 10).map((event: any, i: number) => (
                            <motion.div
                                key={event.id || i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 font-mono text-xs font-bold text-gray-400">
                                    {event.minute}&apos;
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black capitalize">
                                            {EVENT_ICONS[event.type] ?? '📋'}{' '}
                                            {event.type.replace(/_/g, ' ')}
                                        </span>
                                        <Badge variant="secondary" size="sm" className="text-[8px]">
                                            {event.team_id === match.home_team_id ? 'HOME' : 'AWAY'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs font-bold text-gray-500">
                                        {event.player_name || event.player?.full_name}
                                    </p>
                                </div>
                                {event.details?.notes && (
                                    <div className="text-[10px] text-gray-300">📄</div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {events.length === 0 && (
                        <div className="rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50 py-12 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                                No events yet. The match feed will appear here as you log goals and
                                cards.
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
                        className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-gray-900 px-5 py-3 text-white shadow-2xl"
                    >
                        <span className="text-xs font-bold">{lastLoggedEvent.description}</span>
                        <button
                            onClick={async () => {
                                setEventQueue((prev) =>
                                    prev.filter((e) => e.tempId !== lastLoggedEvent.tempId),
                                );
                                if (lastLoggedEvent.id) {
                                    try {
                                        await fetch(
                                            `/api/league/matches/${matchId}/events/${lastLoggedEvent.id}`,
                                            { method: 'DELETE' },
                                        );
                                    } catch {
                                        /* best effort */
                                    }
                                }
                                setLastLoggedEvent(null);
                                queryClient.invalidateQueries({
                                    queryKey: ['matchEvents', matchId],
                                });
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-orange-400 hover:text-orange-300"
                        >
                            Undo
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Player Picker Bottom Sheet */}
            <PlayerPickerSheet
                isOpen={pickerOpen}
                eventType={pickerEventType}
                homeTeam={match.home_team ?? null}
                awayTeam={match.away_team ?? null}
                homePlayers={homePlayers}
                awayPlayers={awayPlayers}
                onConfirm={handlePickerConfirm}
                onClose={() => setPickerOpen(false)}
                isFetchingPlayers={isFetchingPlayers}
            />

            {/* End Match Confirmation Modal */}
            <AnimatePresence>
                {showEndModal && (
                    <>
                        <motion.div
                            key="end-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60"
                            onClick={() => setShowEndModal(false)}
                        />
                        <motion.div
                            key="end-modal"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl"
                        >
                            <h2 className="mb-4 text-center text-xl font-black">Full Time?</h2>
                            <div className="mb-4 rounded-2xl bg-gray-50 p-6 text-center">
                                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                                    Final Score
                                </p>
                                <div className="flex items-center justify-center gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-black">{homeScore}</p>
                                        <p className="mt-1 text-[10px] text-gray-400">
                                            {match?.home_team?.short_name ?? 'HOME'}
                                        </p>
                                    </div>
                                    <span className="text-xl font-bold text-gray-300">—</span>
                                    <div className="text-center">
                                        <p className="text-2xl font-black">{awayScore}</p>
                                        <p className="mt-1 text-[10px] text-gray-400">
                                            {match?.away_team?.short_name ?? 'AWAY'}
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-4 text-[10px] text-gray-400">
                                    {events.length} events logged · {formatTime(clock)}
                                </p>
                            </div>
                            <p className="mb-4 text-center text-sm text-gray-500">
                                Confirming will end the match and submit the final result.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    fullWidth
                                    onClick={() => setShowEndModal(false)}
                                >
                                    Keep Playing
                                </Button>
                                <Button
                                    fullWidth
                                    className="bg-black text-white"
                                    disabled={endMatchMutation.isPending}
                                    isLoading={endMatchMutation.isPending}
                                    onClick={() => {
                                        endMatchMutation.mutate();
                                        setShowEndModal(false);
                                    }}
                                >
                                    Confirm Full Time
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </PageLayout>
    );
}
