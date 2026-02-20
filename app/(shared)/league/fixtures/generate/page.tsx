'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Input,
    Select,
    Badge,
} from '@/components/plyaz';

interface FixtureMatch {
    matchday: number;
    home: string;
    away: string;
    date: string;
    time: string;
}

// Round-robin fixture generator (circle method)
function generateRoundRobin(teams: string[], legs: number = 2): FixtureMatch[] {
    const fixtures: FixtureMatch[] = [];
    const teamList = [...teams];

    // If odd number of teams, add a BYE
    if (teamList.length % 2 !== 0) {
        teamList.push('BYE');
    }

    const n = teamList.length;
    const rounds = n - 1;

    for (let leg = 0; leg < legs; leg++) {
        for (let round = 0; round < rounds; round++) {
            const matchday = leg * rounds + round + 1;

            for (let i = 0; i < n / 2; i++) {
                const home = teamList[i];
                const away = teamList[n - 1 - i];

                if (home === 'BYE' || away === 'BYE') continue;

                // Alternate home/away for second leg
                if (leg === 0) {
                    fixtures.push({
                        matchday,
                        home,
                        away,
                        date: '',
                        time: '15:00',
                    });
                } else {
                    fixtures.push({
                        matchday,
                        home: away,
                        away: home,
                        date: '',
                        time: '15:00',
                    });
                }
            }

            // Rotate teams (keep first team fixed)
            const last = teamList.pop()!;
            teamList.splice(1, 0, last);
        }
        // Reset rotation for second leg
        if (leg < legs - 1) {
            teamList.length = 0;
            teamList.push(...teams);
            if (teamList.length % 2 !== 0) teamList.push('BYE');
        }
    }

    return fixtures;
}

export default function FixtureGeneratorPage() {
    const router = useRouter();
    const [teams, setTeams] = useState<string[]>([]);
    const [fixtures, setFixtures] = useState<FixtureMatch[]>([]);
    const [legs, setLegs] = useState(2);
    const [startDate, setStartDate] = useState('');
    const [interval, setInterval] = useState(7); // days between matchdays
    const [isGenerated, setIsGenerated] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load teams from API
    useEffect(() => {
        fetch('/api/league/teams')
            .then((res) => res.json())
            .then((data) => {
                const names = data.map((t: { name?: string; shortName?: string }) => t.name || t.shortName);
                setTeams(names);
            })
            .catch(() => {
                setTeams(['FC United', 'City Rangers', 'Phoenix FC', 'Eagles', 'Rovers', 'Athletic', 'West Ham Juniors', 'London Lions']);
            });
    }, []);

    const handleGenerate = () => {
        const generatedFixtures = generateRoundRobin(teams, legs);

        // Auto-assign dates if start date is provided
        if (startDate) {
            const currentDate = new Date(startDate);
            let currentMatchday = 0;

            generatedFixtures.forEach((f) => {
                if (f.matchday !== currentMatchday) {
                    if (currentMatchday > 0) {
                        currentDate.setDate(currentDate.getDate() + interval);
                    }
                    currentMatchday = f.matchday;
                }
                f.date = currentDate.toISOString().split('T')[0];
            });
        }

        setFixtures(generatedFixtures);
        setIsGenerated(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        // In production, this would POST each fixture to the matches API
        setTimeout(() => {
            setIsSaving(false);
            router.push('/league/fixtures');
        }, 1500);
    };

    const matchdays = [...new Set(fixtures.map((f) => f.matchday))];

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:py-16">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">Fixture Generator</h1>
                    <p className="text-xs tracking-widest uppercase text-gray-400 mt-2">
                        Auto-generate {teams.length} teams × {legs === 2 ? 'Home & Away' : 'Single'}
                    </p>
                </motion.div>

                {!isGenerated ? (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                        <Card elevated>
                            <CardContent className="p-6 md:p-8">
                                <div className="space-y-5">
                                    <div>
                                        <h2 className="text-lg font-bold mb-1">Settings</h2>
                                        <p className="text-xs text-gray-400">Configure fixture generation</p>
                                    </div>

                                    {/* Teams summary */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">Teams ({teams.length})</p>
                                        <div className="flex flex-wrap gap-2">
                                            {teams.map((team) => (
                                                <Badge key={team} variant="secondary" size="sm">{team}</Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <Select
                                        label="Format"
                                        options={[
                                            { value: '1', label: 'Single Round (Each team plays once)' },
                                            { value: '2', label: 'Home & Away (Each team plays twice)' },
                                        ]}
                                        value={String(legs)}
                                        onChange={(e) => setLegs(parseInt(e.target.value))}
                                    />

                                    <Input
                                        label="Start Date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />

                                    <Input
                                        label="Days Between Matchdays"
                                        type="number"
                                        value={String(interval)}
                                        onChange={(e) => setInterval(parseInt(e.target.value) || 7)}
                                    />

                                    {/* Stats preview */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-black">{teams.length}</p>
                                            <p className="text-[9px] tracking-widest uppercase text-gray-400">Teams</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-black">{(teams.length - 1) * legs}</p>
                                            <p className="text-[9px] tracking-widest uppercase text-gray-400">Matchdays</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-black">{(teams.length * (teams.length - 1) / 2) * legs}</p>
                                            <p className="text-[9px] tracking-widest uppercase text-gray-400">Matches</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleGenerate}
                                        disabled={teams.length < 2}
                                        className="w-full h-14"
                                    >
                                        ⚡ Generate Fixtures
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Generated fixtures */}
                        <div className="space-y-4 mb-6">
                            {matchdays.map((md) => (
                                <Card key={md} elevated>
                                    <CardContent className="p-4 md:p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge variant="primary">Matchday {md}</Badge>
                                            {fixtures.find(f => f.matchday === md)?.date && (
                                                <span className="text-xs text-gray-400">
                                                    {new Date(fixtures.find(f => f.matchday === md)!.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {fixtures.filter(f => f.matchday === md).map((fix, i) => (
                                                <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
                                                    <span className="text-sm font-bold flex-1 text-right pr-3 truncate">{fix.home}</span>
                                                    <span className="text-[10px] font-bold tracking-widest text-gray-400 px-2 flex-shrink-0">VS</span>
                                                    <span className="text-sm font-bold flex-1 pl-3 truncate">{fix.away}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 sticky bottom-4">
                            <Button
                                variant="secondary"
                                onClick={() => { setIsGenerated(false); setFixtures([]); }}
                                className="flex-1 h-12"
                            >
                                ← Regenerate
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                            >
                                {isSaving ? 'Saving...' : `✅ Save ${fixtures.length} Fixtures`}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
