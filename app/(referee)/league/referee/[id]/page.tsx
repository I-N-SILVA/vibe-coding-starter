'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Button,
    Badge,
    Modal,
    PageLayout,
} from '@/components/plyaz';
import { SignaturePad } from '@/components/plyaz/SignaturePad';
import { useLiveMatch } from '@/lib/hooks';
import { leagueApi, teamsApi } from '@/lib/api';
import type { MatchUI } from '@/lib/mappers';
import type { Player, MatchEvent, MatchEventType } from '@/types';
import { refereeNavItems } from '@/lib/constants/navigation';
import { generateMatchReport } from '@/lib/utils/pdf-generator';

const INITIAL_MATCH: MatchUI = {
    id: '',
    homeTeam: { id: '', name: 'Home', shortName: 'HOM' },
    awayTeam: { id: '', name: 'Away', shortName: 'AWY' },
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled',
    competitionId: '',
    organizationId: '',
    homeTeamId: '',
    awayTeamId: '',
    matchday: null,
    round: null,
    matchTime: null,
    venue: null,
    venueId: null,
    groupId: null,
    refereeId: null,
    scheduledAt: null,
    startedAt: null,
    endedAt: null,
    notes: null,
    createdAt: '',
    updatedAt: '',
};

export default function RefereeController() {
    const params = useParams();
    const router = useRouter();
    const matchId = params.id as string;

    const [initialFetchMatch, setInitialFetchMatch] = useState<MatchUI | null>(null);
    const { match } = useLiveMatch(initialFetchMatch ?? { ...INITIAL_MATCH, id: matchId });

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
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
    const [cardType, setCardType] = useState<MatchEventType>('yellow_card');

    // Signature steps
    const [sigStep, setSigStep] = useState<'referee' | 'home' | 'away' | 'done'>('referee');
    const [signatures, setSignatures] = useState({
        referee: '',
        homeCoach: '',
        awayCoach: ''
    });

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const matchData = await leagueApi.getMatch(matchId);
                if (matchData) {
                    setInitialFetchMatch(matchData);
                    setHomeScore(matchData.homeScore ?? 0);
                    setAwayScore(matchData.awayScore ?? 0);
                    setIsMatchStarted(matchData.status === 'live');

                    const homeTeamId = matchData.homeTeam?.id ?? matchData.homeTeamId;
                    const awayTeamId = matchData.awayTeam?.id ?? matchData.awayTeamId;

                    const [hPlayers, aPlayers, mEvents] = await Promise.all([
                        teamsApi.getPlayers(homeTeamId),
                        teamsApi.getPlayers(awayTeamId),
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
    };

    const handleEndMatchFinal = async () => {
        try {
            // 1. Generate the signed PDF
            generateMatchReport({
                homeTeam: match?.homeTeam?.name || 'Home',
                awayTeam: match?.awayTeam?.name || 'Away',
                homeScore,
                awayScore,
                date: new Date().toLocaleDateString(),
                venue: match?.venue || 'TBD',
                competition: 'League Match',
                events: events.map(e => ({
                    minute: e.minute?.toString() || '0',
                    type: e.type,
                    player: e.player_name || 'Unknown',
                    team: e.team_id === match?.homeTeamId ? 'Home' : 'Away'
                })),
                refereeName: 'Official Referee',
                refereeSignature: signatures.referee,
                homeCoachSignature: signatures.homeCoach,
                awayCoachSignature: signatures.awayCoach
            });

            // 2. Update status in DB
            await leagueApi.endMatch(matchId);
            
            setIsSignatureModalOpen(false);
            router.push('/league');
        } catch (err) {
            console.error('Failed to end match:', err);
        }
    };

    const recordEvent = async (type: MatchEventType, teamId: string, playerId: string) => {
        try {
            const { triggerHaptic } = await import('@/lib/utils');
            if (type === 'goal') triggerHaptic('heavy');
            else triggerHaptic('medium');

            const newEvent = await leagueApi.addMatchEvent({
                matchId,
                type,
                minute: getCurrentMinute(),
                playerId,
                teamId,
            });

            if (type === 'goal') {
                const isHome = teamId === (match?.homeTeam?.id ?? match?.homeTeamId);
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
        } catch (err) {
            console.error('Failed to record event:', err);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black tracking-widest">LOADING...</div>;

    const currentMatch = match;

    return (
        <PageLayout navItems={refereeNavItems} title="REFEREE">
            <div className="min-h-screen bg-black text-white -mx-4 -mt-2 px-4 py-6 pb-32">
                {/* Header Info */}
                <div className="text-center mb-8">
                    <p className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500 mb-2">
                        Official Match Protocol
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        {isMatchStarted && (
                            <Badge variant="accent" className="animate-pulse">
                                {isPaused ? 'PAUSED' : 'LIVE'}
                            </Badge>
                        )}
                        <span className="text-6xl font-black tracking-tighter tabular-nums">
                            {formatTime(elapsedSeconds)}
                        </span>
                    </div>
                    <p className="text-[10px] font-black text-orange-500 mt-2 tracking-[0.3em] uppercase">
                        {currentHalf === 1 ? 'First Half' : 'Second Half'}
                    </p>
                </div>

                {/* Scoreboard */}
                <section className="flex items-center justify-center gap-8 mb-12">
                    <div className="flex-1 text-right">
                        <p className="text-xl font-black tracking-tight uppercase">{currentMatch?.homeTeam?.shortName ?? 'HOME'}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Home</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-8xl font-black tracking-tighter tabular-nums">{homeScore}</span>
                        <span className="text-4xl text-slate-800">—</span>
                        <span className="text-8xl font-black tracking-tighter tabular-nums">{awayScore}</span>
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-xl font-black tracking-tight uppercase">{currentMatch?.awayTeam?.shortName ?? 'AWAY'}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Away</p>
                    </div>
                </section>

                {/* Match Controls */}
                <section className="max-w-md mx-auto space-y-4">
                    {!isMatchStarted ? (
                        <Button
                            variant="accent"
                            size="lg"
                            fullWidth
                            onClick={handleStartMatch}
                            className="h-24 text-xl"
                        >
                            KICK OFF
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            {/* Goals */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => { setSelectedTeam('home'); setIsGoalModalOpen(true); }}
                                    className="h-24 rounded-full bg-white text-black font-black text-xs tracking-widest uppercase active:scale-95 transition-all shadow-xl"
                                >
                                    <span className="block text-2xl mb-1">⚽</span>
                                    {currentMatch?.homeTeam?.shortName ?? 'HOME'} GOAL
                                </button>
                                <button
                                    onClick={() => { setSelectedTeam('away'); setIsGoalModalOpen(true); }}
                                    className="h-24 rounded-full bg-white text-black font-black text-xs tracking-widest uppercase active:scale-95 transition-all shadow-xl"
                                >
                                    <span className="block text-2xl mb-1">⚽</span>
                                    {currentMatch?.awayTeam?.shortName ?? 'AWAY'} GOAL
                                </button>
                            </div>

                            {/* Cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => { setCardType('yellow_card'); setIsCardModalOpen(true); }}
                                    className="h-20 rounded-full bg-yellow-400 text-black font-black text-[10px] tracking-widest uppercase active:scale-95 transition-all"
                                >
                                    YELLOW
                                </button>
                                <button
                                    onClick={() => { setCardType('red_card'); setIsCardModalOpen(true); }}
                                    className="h-20 rounded-full bg-red-600 text-white font-black text-[10px] tracking-widest uppercase active:scale-95 transition-all"
                                >
                                    RED
                                </button>
                                <button
                                    disabled
                                    className="h-20 rounded-full bg-slate-900 text-slate-700 font-black text-[10px] tracking-widest uppercase cursor-not-allowed border border-slate-800"
                                >
                                    SUB
                                </button>
                            </div>

                            {/* Utility */}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    fullWidth
                                    onClick={handlePauseResume}
                                    className="h-16 text-white"
                                >
                                    {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
                                </Button>
                                {currentHalf === 1 ? (
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        fullWidth
                                        onClick={handleHalfTime}
                                        className="h-16 text-white"
                                    >
                                        HALF TIME
                                    </Button>
                                ) : (
                                    <Button
                                        variant="danger"
                                        size="lg"
                                        fullWidth
                                        onClick={() => setIsSignatureModalOpen(true)}
                                        className="h-16 bg-red-600 text-white font-black"
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
                    <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-700 mb-6 flex items-center gap-3">
                        Timeline
                        <div className="h-px flex-1 bg-slate-900" />
                    </h2>
                    <div className="space-y-3">
                        {events.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-slate-900 rounded-[40px]">
                                <p className="text-slate-800 text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Events</p>
                            </div>
                        ) : (
                            events.map((event) => (
                                <div key={event.id} className="flex items-center gap-4 p-5 bg-slate-900/50 rounded-3xl border border-slate-800">
                                    <span className="text-xs font-black text-orange-500 w-8">{event.minute}'</span>
                                    <span className="text-xl">
                                        {event.type === 'goal' && '⚽'}
                                        {event.type === 'yellow_card' && '🟨'}
                                        {event.type === 'red_card' && '🟥'}
                                        {event.type === 'substitution' && '🔄'}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest">{event.type.replace('_', ' ')}</p>
                                        <p className="text-xs font-bold text-slate-400">{event.player_name}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-[8px] border-slate-800 text-slate-500">
                                        {event.team_id === (currentMatch?.homeTeam?.id ?? currentMatch?.homeTeamId)
                                            ? (currentMatch?.homeTeam?.shortName ?? 'HOME')
                                            : (currentMatch?.awayTeam?.shortName ?? 'AWAY')}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Goal Modal */}
            <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Record Goal">
                <div className="space-y-2">
                    {(selectedTeam === 'home' ? homePlayers : awayPlayers).map((player) => (
                        <button
                            key={player.id}
                            onClick={() => recordEvent('goal', selectedTeam === 'home' ? (currentMatch?.homeTeam?.id ?? currentMatch?.homeTeamId ?? '') : (currentMatch?.awayTeam?.id ?? currentMatch?.awayTeamId ?? ''), player.id)}
                            className="w-full py-5 px-5 text-left bg-slate-50 rounded-2xl hover:border-orange-500 border-2 border-transparent transition-all group"
                        >
                            <span className="inline-block w-8 text-xs font-black text-slate-300 group-hover:text-orange-500">#{player.jersey_number}</span>
                            <span className="font-bold text-sm tracking-tight text-black">{player.name}</span>
                        </button>
                    ))}
                    <Button variant="outline" fullWidth onClick={() => recordEvent('goal', selectedTeam === 'home' ? (currentMatch?.homeTeam?.id ?? currentMatch?.homeTeamId ?? '') : (currentMatch?.awayTeam?.id ?? currentMatch?.awayTeamId ?? ''), '')} className="mt-4">
                        Unknown Player
                    </Button>
                </div>
            </Modal>

            {/* Card Modal */}
            <Modal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} title={`${cardType === 'yellow_card' ? 'Yellow' : 'Red'} Card`}>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => setSelectedTeam('home')} className={cn('py-4 rounded-xl border-2 font-bold text-xs tracking-widest flex items-center justify-center gap-2', selectedTeam === 'home' ? 'bg-black text-white border-black' : 'border-slate-100 text-slate-400')}>
                        {currentMatch?.homeTeam?.shortName ?? 'HOME'}
                    </button>
                    <button onClick={() => setSelectedTeam('away')} className={cn('py-4 rounded-xl border-2 font-bold text-xs tracking-widest flex items-center justify-center gap-2', selectedTeam === 'away' ? 'bg-black text-white border-black' : 'border-slate-100 text-slate-400')}>
                        {currentMatch?.awayTeam?.shortName ?? 'AWAY'}
                    </button>
                </div>
                <div className="space-y-2">
                    {(selectedTeam === 'home' ? homePlayers : awayPlayers).map((player) => (
                        <button key={player.id} onClick={() => recordEvent(cardType, selectedTeam === 'home' ? (currentMatch?.homeTeam?.id ?? currentMatch?.homeTeamId ?? '') : (currentMatch?.awayTeam?.id ?? currentMatch?.awayTeamId ?? ''), player.id)} className="w-full py-5 px-5 text-left bg-slate-50 rounded-2xl hover:border-orange-500 border-2 border-transparent transition-all">
                            <span className="inline-block w-8 text-xs font-black text-slate-300">#{player.jersey_number}</span>
                            <span className="font-bold text-sm tracking-tight text-black">{player.name}</span>
                        </button>
                    ))}
                </div>
            </Modal>

            {/* Official Protocol Signature Modal */}
            <Modal 
                isOpen={isSignatureModalOpen} 
                onClose={() => setIsSignatureModalOpen(false)} 
                title="Official Match Protocol"
            >
                <div className="space-y-8 py-4">
                    <div className="text-center mb-8">
                        <div className="text-4xl font-black mb-1">{homeScore} — {awayScore}</div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Final Verification</p>
                    </div>

                    {sigStep === 'referee' && (
                        <SignaturePad 
                            label="Referee Signature"
                            onSave={(sig) => {
                                setSignatures(s => ({ ...s, referee: sig }));
                                setSigStep('home');
                            }}
                        />
                    )}

                    {sigStep === 'home' && (
                        <SignaturePad 
                            label={`${match?.homeTeam?.shortName || 'Home'} Coach Signature`}
                            onSave={(sig) => {
                                setSignatures(s => ({ ...s, homeCoach: sig }));
                                setSigStep('away');
                            }}
                        />
                    )}

                    {sigStep === 'away' && (
                        <SignaturePad 
                            label={`${match?.awayTeam?.shortName || 'Away'} Coach Signature`}
                            onSave={(sig) => {
                                setSignatures(s => ({ ...s, awayCoach: sig }));
                                setSigStep('done');
                            }}
                        />
                    )}

                    {sigStep === 'done' && (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-4xl">✅</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase">Protocol Ready</h3>
                                <p className="text-xs text-slate-500 mt-1">All signatures captured. Click below to finalize the match and generate the legal PDF.</p>
                            </div>
                            <Button variant="accent" size="lg" fullWidth onClick={handleEndMatchFinal}>
                                Finalize & Sign Protocol
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </PageLayout>
    );
}
