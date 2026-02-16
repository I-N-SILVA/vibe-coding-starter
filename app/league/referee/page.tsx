'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Button,
    Badge,
} from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';

/**
 * Referee Live Match Control Panel
 * Allows referees to update live scores, record events, and manage match flow
 */

const DEFAULT_MATCH = {
    id: '1',
    homeTeam: { name: 'FC United', shortName: 'FCU' },
    awayTeam: { name: 'City Rangers', shortName: 'CRG' },
    homeScore: 0,
    awayScore: 0,
    half: '1st Half',
    matchTime: '0:00',
    status: 'not_started' as string,
    events: [] as Array<{ type: string; team: string; player: string; time: string }>,
};


export default function RefereeDashboard() {
    // matchId is currently unused as we use DEFAULT_MATCH for demo
    // const matchId = searchParams?.get('matchId') || '1';

    const [match, setMatch] = useState(DEFAULT_MATCH);
    const [clock, setClock] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [eventPlayer, setEventPlayer] = useState('');

    // Clock timer
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

    const addGoal = (team: 'home' | 'away') => {
        setMatch((prev) => ({
            ...prev,
            homeScore: team === 'home' ? prev.homeScore + 1 : prev.homeScore,
            awayScore: team === 'away' ? prev.awayScore + 1 : prev.awayScore,
            events: [
                { type: '⚽ Goal', team: team === 'home' ? prev.homeTeam.shortName : prev.awayTeam.shortName, player: eventPlayer || 'Unknown', time: formatTime(clock) },
                ...prev.events,
            ],
        }));
        setEventPlayer('');
    };

    const addEvent = (type: string, team: 'home' | 'away') => {
        setMatch((prev) => ({
            ...prev,
            events: [
                { type, team: team === 'home' ? prev.homeTeam.shortName : prev.awayTeam.shortName, player: eventPlayer || 'Unknown', time: formatTime(clock) },
                ...prev.events,
            ],
        }));
        setEventPlayer('');
    };

    const startMatch = () => {
        setIsRunning(true);
        setMatch((prev) => ({ ...prev, status: 'live', half: '1st Half' }));
    };

    const toggleHalf = () => {
        setMatch((prev) => ({
            ...prev,
            half: prev.half === '1st Half' ? '2nd Half' : 'Full Time',
        }));
        if (match.half === '2nd Half') {
            setIsRunning(false);
            setMatch((prev) => ({ ...prev, status: 'completed' }));
        }
    };

    return (
        <PageLayout navItems={adminNavItems} title="REFEREE">
            <PageHeader
                label="Match Control"
                title="Live Panel"
            />

            {/* Scoreboard */}
            <Card elevated className="mb-8 overflow-hidden">
                <CardContent className="p-0">
                    <div className="bg-gray-900 text-white p-8">
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            <div className="text-center flex-1">
                                <p className="text-3xl font-black mb-1">{match.homeTeam.shortName}</p>
                                <p className="text-xs text-gray-400">{match.homeTeam.name}</p>
                            </div>
                            <div className="text-center px-10">
                                <div className="flex items-center gap-4">
                                    <span className="text-6xl font-black">{match.homeScore}</span>
                                    <span className="text-2xl text-gray-600">:</span>
                                    <span className="text-6xl font-black">{match.awayScore}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-center gap-3">
                                    <Badge variant={match.status === 'live' ? 'success' : 'secondary'} size="sm">
                                        {match.status === 'live' ? '● LIVE' : match.status === 'completed' ? 'FT' : 'PRE-MATCH'}
                                    </Badge>
                                    <span className="text-sm font-mono text-gray-400">{formatTime(clock)}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{match.half}</p>
                            </div>
                            <div className="text-center flex-1">
                                <p className="text-3xl font-black mb-1">{match.awayTeam.shortName}</p>
                                <p className="text-xs text-gray-400">{match.awayTeam.name}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Match Controls */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Clock Controls */}
                <Card elevated>
                    <CardContent>
                        <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">Match Controls</h3>
                        <div className="flex flex-wrap gap-3">
                            {!isRunning && match.status !== 'completed' ? (
                                <Button onClick={startMatch} className="bg-green-600 hover:bg-green-700 text-white">
                                    ▶ Start Match
                                </Button>
                            ) : match.status !== 'completed' ? (
                                <>
                                    <Button variant="secondary" onClick={() => setIsRunning(false)}>
                                        ⏸ Pause
                                    </Button>
                                    <Button variant="secondary" onClick={() => setIsRunning(true)}>
                                        ▶ Resume
                                    </Button>
                                </>
                            ) : null}
                            {(isRunning || match.status === 'live') && (
                                <Button variant="danger" onClick={toggleHalf}>
                                    {match.half === '1st Half' ? 'End 1st Half' : match.half === '2nd Half' ? 'Full Time' : 'Match Over'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Player Input */}
                <Card elevated>
                    <CardContent>
                        <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">Player Name</h3>
                        <input
                            type="text"
                            value={eventPlayer}
                            onChange={(e) => setEventPlayer(e.target.value)}
                            placeholder="Enter player name..."
                            className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Event Buttons */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Home Team Events */}
                <Card elevated>
                    <CardContent>
                        <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">
                            {match.homeTeam.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={() => addGoal('home')} className="bg-green-600 hover:bg-green-700 text-white">⚽ Goal</Button>
                            <Button variant="secondary" onClick={() => addEvent('🟡 Yellow Card', 'home')}>🟡 Yellow</Button>
                            <Button variant="danger" onClick={() => addEvent('🔴 Red Card', 'home')}>🔴 Red</Button>
                            <Button variant="secondary" onClick={() => addEvent('🔄 Substitution', 'home')}>🔄 Sub</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Away Team Events */}
                <Card elevated>
                    <CardContent>
                        <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">
                            {match.awayTeam.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={() => addGoal('away')} className="bg-green-600 hover:bg-green-700 text-white">⚽ Goal</Button>
                            <Button variant="secondary" onClick={() => addEvent('🟡 Yellow Card', 'away')}>🟡 Yellow</Button>
                            <Button variant="danger" onClick={() => addEvent('🔴 Red Card', 'away')}>🔴 Red</Button>
                            <Button variant="secondary" onClick={() => addEvent('🔄 Substitution', 'away')}>🔄 Sub</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Event Log */}
            <Card elevated>
                <CardContent>
                    <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">Match Events</h3>
                    {match.events.length > 0 ? (
                        <div className="space-y-3">
                            {match.events.map((event, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50"
                                >
                                    <span className="text-xs font-mono text-gray-400 w-12">{event.time}</span>
                                    <Badge variant="secondary" size="sm">{event.team}</Badge>
                                    <span className="text-sm font-bold">{event.type}</span>
                                    <span className="text-sm text-gray-500 ml-auto">{event.player}</span>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-8 text-gray-400 text-sm">
                            No events recorded yet. Start the match to begin.
                        </p>
                    )}
                </CardContent>
            </Card>
        </PageLayout>
    );
}
