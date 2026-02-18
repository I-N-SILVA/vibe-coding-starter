'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
import { matchService } from '@/services/match';
import { playerService } from '@/services/player';

/**
 * Referee Live Match Protocol (High Fidelity)
 * Mobile-first interface for match officials to record events with precision.
 */

export default function RefereeLiveConsole({ params }: { params: Promise<{ id: string }> }) {
    const { id: matchId } = use(params);
    const router = useRouter();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [match, setMatch] = useState<any>(null);
    const [clock, setClock] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [eventModal, setEventModal] = useState<{ open: boolean, type: string, team: 'home' | 'away' }>({
        open: false,
        type: '',
        team: 'home'
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<string>('');
    const [notes, setNotes] = useState('');

    // Initial Load
    useEffect(() => {
        const loadMatch = async () => {
            try {
                const data = await matchService.getMatch(matchId);
                if (data) {
                    setMatch(data);
                    setClock(data.match_time || 0);
                    setIsRunning(data.status === 'live');
                }
            } catch (err) {
                console.error('Failed to load match:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadMatch();
    }, [matchId]);

    // Clock Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setClock(prev => {
                    const next = prev + 1;
                    if (next % 10 === 0) { // Sync every 10 seconds for performance
                        matchService.updateScore(matchId, match.homeScore, match.awayScore);
                    }
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, matchId, match]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOpenEventModal = async (type: string, team: 'home' | 'away') => {
        const teamId = team === 'home' ? match.home_team_id : match.away_team_id;
        const players = await playerService.getPlayers(teamId);
        setTeamPlayers(players);
        setEventModal({ open: true, type, team });
        setSelectedPlayer('');
        setNotes('');
    };

    const handleRecordEvent = async () => {
        if (!selectedPlayer) return;

        const eventData = {
            matchId,
            playerId: selectedPlayer,
            type: eventModal.type,
            minute: Math.floor(clock / 60),
            notes
        };

        await matchService.addMatchEvent(eventData);

        if (eventModal.type === '⚽ Goal') {
            const newHomeScore = eventModal.team === 'home' ? match.homeScore + 1 : match.homeScore;
            const newAwayScore = eventModal.team === 'away' ? match.awayScore + 1 : match.awayScore;
            await matchService.updateScore(matchId, newHomeScore, newAwayScore);
            setMatch({ ...match, homeScore: newHomeScore, awayScore: newAwayScore });
        }

        // Refresh match to get updated event list (mocking local update)
        const updatedMatch = await matchService.getMatch(matchId);
        setMatch(updatedMatch);

        setEventModal({ open: false, type: '', team: 'home' });
    };

    const toggleMatchStatus = async () => {
        if (!isRunning) {
            await matchService.startMatch(matchId);
            setIsRunning(true);
            setMatch({ ...match, status: 'live' });
        } else {
            setIsRunning(false);
        }
    };

    const handleEndMatch = async () => {
        if (confirm('Are you sure you want to end the match?')) {
            await matchService.endMatch(matchId);
            router.push('/league/matches');
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading Console...</div>;
    if (!match) return <div className="min-h-screen flex items-center justify-center">Match Not Found</div>;

    return (
        <PageLayout navItems={adminNavItems} title="MATCH CONTROL">
            {/* High-Contrast Scoreboard */}
            <div className="sticky top-0 z-30 -mx-4 px-4 py-6 bg-black text-white shadow-2xl border-b border-orange-500/20">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <div className="text-center w-24">
                        <div className="text-2xl font-black mb-1 truncate">{match.homeTeam?.shortName || match.homeTeam?.name.substring(0, 3)}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Home</div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center gap-6 mb-2">
                            <span className="text-6xl font-black tabular-nums">{match.homeScore}</span>
                            <span className="text-2xl text-orange-500 font-bold">:</span>
                            <span className="text-6xl font-black tabular-nums">{match.awayScore}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant={isRunning ? 'success' : 'secondary'} size="sm" className="font-mono px-3">
                                {isRunning ? '● LIVE' : 'PAUSED'}
                            </Badge>
                            <span className="font-mono text-xl text-orange-500 font-black tracking-tighter">
                                {formatTime(clock)}
                            </span>
                        </div>
                    </div>

                    <div className="text-center w-24">
                        <div className="text-2xl font-black mb-1 truncate">{match.awayTeam?.shortName || match.awayTeam?.name.substring(0, 3)}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Away</div>
                    </div>
                </div>
            </div>

            <main className="py-8 max-w-lg mx-auto space-y-6">
                {/* Precision Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Home Actions */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase text-center">{match.homeTeam?.name}</h4>
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
                        <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase text-center">{match.awayTeam?.name}</h4>
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
                            >
                                {isRunning ? '⏸ PAUSE CLOCK' : '▶ START PERIOD'}
                            </Button>
                            <Button
                                variant="secondary"
                                className="h-14 px-6 rounded-2xl border-gray-200 text-gray-400"
                                onClick={handleEndMatch}
                            >
                                <NavIcons.Settings className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Live Feed */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">Precision Match Feed</h3>
                    <AnimatePresence>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {match.events?.slice(0, 5).map((event: any, i: number) => (
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
                                        <span className="text-sm font-black">{event.type}</span>
                                        <Badge variant="secondary" size="sm" className="text-[8px]">{event.team_id === match.home_team_id ? 'HOME' : 'AWAY'}</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold">{event.player?.full_name}</p>
                                </div>
                                {event.notes && <div className="text-[10px] text-gray-300">📄</div>}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {(!match.events || match.events.length === 0) && (
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
                        <div className="grid grid-cols-2 gap-2">
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
                                    <div className="text-xs font-bold truncate">{p.full_name}</div>
                                </button>
                            ))}
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
                            disabled={!selectedPlayer}
                            className="bg-black text-white"
                            onClick={handleRecordEvent}
                        >
                            Confirm Event
                        </Button>
                    </div>
                </div>
            </Modal>
        </PageLayout>
    );
}
