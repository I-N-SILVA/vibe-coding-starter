'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Button,
    Badge,
    Modal,
    ConfirmModal,
    PageLayout,
} from '@/components/plyaz';
import { useLiveMatch } from '@/lib/hooks';
import { leagueApi, teamsApi } from '@/lib/api';
import type { Player, MatchEvent, MatchEventType } from '@/types';
import { adminNavItems } from '@/lib/constants/navigation';

export default function RefereeController() {
    const params = useParams();
    const router = useRouter();
    const matchId = params.id as string;

    const [initialFetchMatch, setInitialFetchMatch] = useState<any>(null);
    const { match, isLive } = useLiveMatch(initialFetchMatch || {
        id: matchId,
        homeTeam: { id: '', name: 'Home', shortName: 'HOM' },
        awayTeam: { id: '', name: 'Away', shortName: 'AWY' },
        homeScore: 0,
        awayScore: 0,
        status: 'scheduled',
    } as any);

    const [isMatchStarted, setIsMatchStarted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentHalf, setCurrentHalf] = useState<1 | 2>(1);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const [events, setEvents] = useState<MatchEvent[]>([]);
    const [homePlayers, setHomePlayers] = useState<Player[]>([]);
    const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal states
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [isEndMatchOpen, setIsEndMatchOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
    const [cardType, setCardType] = useState<MatchEventType>('yellow_card');

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const matchData = await leagueApi.getMatch(matchId);
                if (matchData) {
                    setInitialFetchMatch(matchData);
                    setHomeScore(matchData.homeScore || 0);
                    setAwayScore(matchData.awayScore || 0);
                    setIsMatchStarted(matchData.status === 'live');

                    const [hPlayers, aPlayers, mEvents] = await Promise.all([
                        teamsApi.getPlayers(matchData.homeTeam.id),
                        teamsApi.getPlayers(matchData.awayTeam.id),
                        leagueApi.getMatchEvents(matchId)
                    ]);

                    setHomePlayers(hPlayers);
                    setAwayPlayers(aPlayers);
                    setEvents(mEvents);
                }
            } catch (err) {
                console.error('Failed to fetch initial data:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchInitialData();
    }, [matchId]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isMatchStarted && !isPaused) {
            interval = setInterval(() => {
                setElapsedSeconds((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isMatchStarted, isPaused]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getCurrentMinute = () => Math.floor(elapsedSeconds / 60) + (currentHalf === 2 ? 45 : 0);

    const handleStartMatch = async () => {
        try {
            await leagueApi.startMatch(matchId);
            setIsMatchStarted(true);
            setIsPaused(false);
        } catch (err) {
            console.error('Failed to start match:', err);
        }
    };

    const handlePauseResume = () => {
        setIsPaused(!isPaused);
    };

    const handleHalfTime = async () => {
        setIsPaused(true);
        setCurrentHalf(2);
        setElapsedSeconds(0);
        // Record half time event if needed via API
    };

    const handleEndMatch = async () => {
        try {
            await leagueApi.endMatch(matchId);
            setIsPaused(true);
            setIsMatchStarted(false);
            setIsEndMatchOpen(false);
            router.push('/league');
        } catch (err) {
            console.error('Failed to end match:', err);
        }
    };

    const recordEvent = async (type: MatchEventType, teamId: string, playerId: string) => {
        try {
            const newEvent = await leagueApi.addMatchEvent({
                matchId,
                type,
                minute: getCurrentMinute(),
                playerId,
                teamId,
            });

            // Goals update score automatically on backend? 
            // If not, update score here
            if (type === 'goal') {
                const isHome = teamId === match.homeTeam.id;
                const newHome = isHome ? homeScore + 1 : homeScore;
                const newAway = !isHome ? awayScore + 1 : awayScore;

                await leagueApi.updateScore({
                    matchId,
                    homeScore: newHome,
                    awayScore: newAway
                });

                if (isHome) setHomeScore(newHome);
                else setAwayScore(newAway);
            }

            setEvents(prev => [newEvent, ...prev]);
            setIsGoalModalOpen(false);
            setIsCardModalOpen(false);
            setIsSubModalOpen(false);
        } catch (err) {
            console.error('Failed to record event:', err);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-primary-main flex items-center justify-center text-white">LOADING...</div>;

    const currentMatch = match || initialFetchMatch;

    return (
        <PageLayout navItems={adminNavItems} title="REFEREE">
            <div className="min-h-screen bg-primary-main text-white -mx-4 -mt-2 px-4 py-6 pb-32">
                {/* Header Info */}
                <div className="text-center mb-8">
                    <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-secondary-main/40 mb-2">
                        {currentMatch.competitionId}
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        {isMatchStarted && (
                            <Badge variant="primary" className="bg-accent-main text-white border-none">
                                {isPaused ? 'PAUSED' : 'LIVE'}
                            </Badge>
                        )}
                        <span className="text-6xl font-black tracking-tighter tabular-nums">
                            {formatTime(elapsedSeconds)}
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-secondary-main/40 mt-2 tracking-widest uppercase">
                        {currentHalf === 1 ? 'First Half' : 'Second Half'}
                    </p>
                </div>

                {/* Scoreboard */}
                <section className="flex items-center justify-center gap-8 mb-12">
                    <div className="flex-1 text-right">
                        <p className="text-xl font-black tracking-tight uppercase">{currentMatch.homeTeam.shortName}</p>
                        <p className="text-[10px] text-secondary-main/30 uppercase tracking-widest font-bold">Home</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-8xl font-black tracking-tighter">{homeScore}</span>
                        <span className="text-4xl text-secondary-main/10">—</span>
                        <span className="text-8xl font-black tracking-tighter">{awayScore}</span>
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-xl font-black tracking-tight uppercase">{currentMatch.awayTeam.shortName}</p>
                        <p className="text-[10px] text-secondary-main/30 uppercase tracking-widest font-bold">Away</p>
                    </div>
                </section>

                {/* Match Controls */}
                <section className="max-w-md mx-auto space-y-4">
                    {!isMatchStarted ? (
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleStartMatch}
                            className="h-24 text-xl bg-accent-main hover:bg-accent-dark border-none shadow-xl shadow-accent-main/20"
                        >
                            KICK OFF
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            {/* Goals */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => { setSelectedTeam('home'); setIsGoalModalOpen(true); }}
                                    className="h-24 rounded-2xl bg-surface-main text-primary-main font-black text-xs tracking-[0.2em] uppercase active:scale-95 transition-all shadow-lg"
                                >
                                    <span className="block text-2xl mb-1">⚽</span>
                                    {currentMatch.homeTeam.shortName} GOAL
                                </button>
                                <button
                                    onClick={() => { setSelectedTeam('away'); setIsGoalModalOpen(true); }}
                                    className="h-24 rounded-2xl bg-surface-main text-primary-main font-black text-xs tracking-[0.2em] uppercase active:scale-95 transition-all shadow-lg"
                                >
                                    <span className="block text-2xl mb-1">⚽</span>
                                    {currentMatch.awayTeam.shortName} GOAL
                                </button>
                            </div>

                            {/* Cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => { setCardType('yellow_card'); setIsCardModalOpen(true); }}
                                    className="h-20 rounded-2xl bg-yellow-400 text-black font-black text-[10px] tracking-widest uppercase active:scale-95 transition-all"
                                >
                                    YELLOW
                                </button>
                                <button
                                    onClick={() => { setCardType('red_card'); setIsCardModalOpen(true); }}
                                    className="h-20 rounded-2xl bg-red-600 text-white font-black text-[10px] tracking-widest uppercase active:scale-95 transition-all"
                                >
                                    RED
                                </button>
                                <button
                                    onClick={() => setIsSubModalOpen(true)}
                                    className="h-20 rounded-2xl bg-secondary-main text-white font-black text-[10px] tracking-widest uppercase active:scale-95 transition-all"
                                >
                                    SUB
                                </button>
                            </div>

                            {/* Utility */}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    fullWidth
                                    onClick={handlePauseResume}
                                    className="h-16 border-secondary-main/10 text-white hover:border-accent-main font-bold"
                                >
                                    {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
                                </Button>
                                {currentHalf === 1 ? (
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        fullWidth
                                        onClick={handleHalfTime}
                                        className="h-16 border-secondary-main/10 text-white hover:border-accent-main font-bold"
                                    >
                                        HALF TIME
                                    </Button>
                                ) : (
                                    <Button
                                        variant="danger"
                                        size="lg"
                                        fullWidth
                                        onClick={() => setIsEndMatchOpen(true)}
                                        className="h-16 bg-red-600/20 border-red-600/50 text-red-500 font-bold"
                                    >
                                        FINISH
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* Event Feed */}
                <section className="max-w-md mx-auto mt-12">
                    <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-secondary-main/30 mb-6 flex items-center gap-3">
                        Match Timeline
                        <div className="h-px flex-1 bg-secondary-main/5" />
                    </h2>
                    <div className="space-y-3">
                        {events.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-secondary-main/5 rounded-3xl">
                                <p className="text-secondary-main/20 text-xs font-bold uppercase tracking-widest">Awaiting Kickoff</p>
                            </div>
                        ) : (
                            events.map((event) => (
                                <div key={event.id} className="flex items-center gap-4 p-4 bg-secondary-main/5 rounded-2xl border border-secondary-main/5">
                                    <span className="text-xs font-black text-accent-main w-8">{event.minute}'</span>
                                    <span className="text-xl">
                                        {event.type === 'goal' && '⚽'}
                                        {event.type === 'yellow_card' && '🟨'}
                                        {event.type === 'red_card' && '🟥'}
                                        {event.type === 'substitution' && '🔄'}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold uppercase tracking-wider">{event.type.replace('_', ' ')}</p>
                                        <p className="text-[10px] text-secondary-main/40 font-medium">{event.playerName}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-[8px] border-secondary-main/10 text-secondary-main/40">
                                        {event.teamId === currentMatch.homeTeam.id ? currentMatch.homeTeam.shortName : currentMatch.awayTeam.shortName}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Modals */}
            <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Record Goal">
                <div className="space-y-2">
                    {(selectedTeam === 'home' ? homePlayers : awayPlayers).map((player) => (
                        <button
                            key={player.id}
                            onClick={() => recordEvent('goal', selectedTeam === 'home' ? currentMatch.homeTeam.id : currentMatch.awayTeam.id, player.id)}
                            className="w-full py-5 px-5 text-left bg-secondary-main/5 rounded-2xl hover:bg-accent-main/10 hover:border-accent-main border-2 border-transparent transition-all group"
                        >
                            <span className="inline-block w-8 text-xs font-black text-secondary-main/30 group-hover:text-accent-main">#{player.number}</span>
                            <span className="font-bold text-sm tracking-tight">{player.firstName} {player.lastName}</span>
                        </button>
                    ))}
                    <Button variant="secondary" fullWidth onClick={() => recordEvent('goal', selectedTeam === 'home' ? currentMatch.homeTeam.id : currentMatch.awayTeam.id, '')} className="mt-4">
                        Unknown Player
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} title={`${cardType === 'yellow_card' ? 'Yellow' : 'Red'} Card`}>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => setSelectedTeam('home')} className={cn('py-4 rounded-xl border-2 font-bold text-xs tracking-widest flex items-center justify-center gap-2', selectedTeam === 'home' ? 'bg-primary-main text-white border-primary-main' : 'border-secondary-main/5 text-secondary-main/40')}>
                        {currentMatch.homeTeam.shortName}
                    </button>
                    <button onClick={() => setSelectedTeam('away')} className={cn('py-4 rounded-xl border-2 font-bold text-xs tracking-widest flex items-center justify-center gap-2', selectedTeam === 'away' ? 'bg-primary-main text-white border-primary-main' : 'border-secondary-main/5 text-secondary-main/40')}>
                        {currentMatch.awayTeam.shortName}
                    </button>
                </div>
                <div className="space-y-2">
                    {(selectedTeam === 'home' ? homePlayers : awayPlayers).map((player) => (
                        <button key={player.id} onClick={() => recordEvent(cardType, selectedTeam === 'home' ? currentMatch.homeTeam.id : currentMatch.awayTeam.id, player.id)} className="w-full py-5 px-5 text-left bg-secondary-main/5 rounded-2xl hover:bg-accent-main/10 hover:border-accent-main border-2 border-transparent transition-all">
                            <span className="inline-block w-8 text-xs font-black text-secondary-main/30 group-hover:text-accent-main">#{player.number}</span>
                            <span className="font-bold text-sm tracking-tight">{player.firstName} {player.lastName}</span>
                        </button>
                    ))}
                </div>
            </Modal>

            <ConfirmModal
                isOpen={isEndMatchOpen}
                onClose={() => setIsEndMatchOpen(false)}
                onConfirm={handleEndMatch}
                title="End Match?"
                message={`Final Score: ${homeScore} - ${awayScore}. This will finalize the match and update standings.`}
                variant="danger"
            />
        </PageLayout>
    );
}
