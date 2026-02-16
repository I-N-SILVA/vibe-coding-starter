'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Button,
    Card,
    MatchCard,
    Select,
    Input,
    EmptyState,
    NavIcons,
} from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { generateRoundRobin, type GeneratedFixture } from '@/lib/utils/fixture-generator';
import { useToast } from '@/components/providers';

const MOCK_TEAMS = [
    { id: '1', name: 'FC United', short_name: 'FCU' },
    { id: '2', name: 'City Rangers', short_name: 'CRG' },
    { id: '3', name: 'Phoenix FC', short_name: 'PHX' },
    { id: '4', name: 'Eagles', short_name: 'EGL' },
    { id: '5', name: 'Rovers', short_name: 'ROV' },
    { id: '6', name: 'Athletic', short_name: 'ATH' },
];

export default function FixturesPage() {
    const router = useRouter();
    const { success } = useToast();
    const [fixtures, setFixtures] = useState<GeneratedFixture[]>([]);
    const [format, setFormat] = useState('league');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const handleGenerate = () => {
        const generated = generateRoundRobin(
            MOCK_TEAMS,
            new Date(startDate),
            'demo-comp'
        );
        setFixtures(generated);
        success(`Successfully generated ${generated.length} fixtures!`);
    };

    const handleSave = () => {
        success('Fixtures saved to competition schedule.');
        router.push('/league');
    };

    // Group fixtures by round
    const fixturesByRound = fixtures.reduce<Record<number, GeneratedFixture[]>>((acc, match) => {
        const round = 1;
        if (!acc[round]) acc[round] = [];
        acc[round].push(match);
        return acc;
    }, {});

    return (
        <PageLayout navItems={adminNavItems} title="Fixtures Manager">
            <PageHeader label="Competition Management" title="Generate Schedule" />

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="mb-8 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 mb-2">
                                Format
                            </label>
                            <Select
                                options={[
                                    { label: 'League (Round Robin)', value: 'league' },
                                    { label: 'Cup (Knockout)', value: 'cup' },
                                    { label: 'Group Stage', value: 'group' },
                                ]}
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 mb-2">
                                Start Date
                            </label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={handleGenerate}
                            >
                                Generate Fixtures
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {fixtures.length === 0 ? (
                <EmptyState
                    icon={<NavIcons.Calendar />}
                    title="No Fixtures Generated"
                    description="Configure your format and start date above, then click Generate Fixtures."
                />
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold tracking-wider uppercase text-gray-900">
                            Generated Schedule ({fixtures.length} Matches)
                        </h2>
                        <Button variant="secondary" size="sm" onClick={handleSave}>
                            Save Schedule
                        </Button>
                    </div>

                    {Object.entries(fixturesByRound).map(([round, matches], roundIdx) => (
                        <motion.div
                            key={round}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: roundIdx * 0.08, duration: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white">
                                    {round}
                                </div>
                                <h3 className="text-xs font-bold tracking-wider uppercase text-gray-500">
                                    Round {round}
                                </h3>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>
                            <div className="grid gap-4">
                                {matches.map((match) => (
                                    <MatchCard
                                        key={match.id}
                                        homeTeam={match.homeTeam}
                                        awayTeam={match.awayTeam}
                                        status={match.status}
                                        date={match.scheduledDate.toLocaleDateString()}
                                        venue={match.venue}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </PageLayout>
    );
}
