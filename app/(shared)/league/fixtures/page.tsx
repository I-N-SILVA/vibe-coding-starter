'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Button,
    MatchCard,
    Select,
    Input,
    EmptyState,
    NavIcons,
    SkeletonMatchCard,
} from '@/components/plyaz';
import { generateRoundRobin, generateKnockout, type GeneratedFixture } from '@/lib/utils/fixture-generator';
import { useToast } from '@/components/providers';
import { useTeams, useCompetitions } from '@/lib/hooks';

export default function FixturesPage() {
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [fixtures, setFixtures] = useState<GeneratedFixture[]>([]);
    const [format, setFormat] = useState('league');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCompId, setSelectedCompId] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { data: competitions = [], isLoading: compsLoading } = useCompetitions();
    const { data: teams = [], isLoading: teamsLoading } = useTeams();

    const compId = selectedCompId || competitions[0]?.id || '';

    const handleGenerate = () => {
        if (teams.length < 2) {
            toastError('You need at least 2 teams to generate fixtures.');
            return;
        }
        const teamInput = teams.map(t => ({ id: t.id, name: t.name, short_name: t.short_name }));
        const generated = format === 'cup'
            ? generateKnockout(teamInput, new Date(startDate), compId)
            : generateRoundRobin(teamInput, new Date(startDate), compId);
        setFixtures(generated);
        success(`Generated ${generated.length} fixtures!`);
    };

    const handleSave = async () => {
        if (!compId) { toastError('Select a competition first.'); return; }
        setIsSaving(true);
        try {
            const results = await Promise.allSettled(
                fixtures.map(f =>
                    fetch('/api/league/matches', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            home_team_id: f.homeTeam.id,
                            away_team_id: f.awayTeam.id,
                            competition_id: compId,
                            scheduled_at: f.scheduledDate.toISOString(),
                            status: 'scheduled',
                        }),
                    })
                )
            );
            const failed = results.filter(r => r.status === 'rejected').length;
            if (failed > 0) {
                toastError(`${failed} fixture(s) failed to save. Try again.`);
            } else {
                success(`All ${fixtures.length} fixtures saved to the schedule!`);
                router.push('/league/matches');
            }
        } catch {
            toastError('Failed to save fixtures.');
        } finally {
            setIsSaving(false);
        }
    };

    // Group by round using actual round-robin math
    const matchesPerRound = teams.length > 1 ? Math.floor(teams.length / 2) : 1;
    const fixturesByRound = fixtures.reduce<Record<number, GeneratedFixture[]>>((acc, f, i) => {
        const round = Math.floor(i / matchesPerRound) + 1;
        if (!acc[round]) acc[round] = [];
        acc[round].push(f);
        return acc;
    }, {});

    const isLoading = compsLoading || teamsLoading;

    return (
        <PageLayout title="Fixtures Manager">
            <PageHeader label="Competition Management" title="Generate Schedule" />

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 mb-2">Competition</label>
                            {compsLoading ? (
                                <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                            ) : (
                                <Select
                                    options={competitions.map(c => ({ label: c.name, value: c.id }))}
                                    value={compId}
                                    onChange={(e) => setSelectedCompId(e.target.value)}
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 mb-2">Format</label>
                            <Select
                                options={[
                                    { label: 'League (Round Robin)', value: 'league' },
                                    { label: 'Cup (Knockout)', value: 'cup' },
                                ]}
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 mb-2">Start Date</label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="flex items-end">
                            <Button variant="primary" fullWidth onClick={handleGenerate} disabled={isLoading || teams.length < 2}>
                                {isLoading ? 'Loading...' : 'Generate Schedule'}
                            </Button>
                        </div>
                    </div>
                    {!teamsLoading && (
                        <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest">
                            {teams.length} teams · {competitions.length} competitions
                            {teams.length < 2 && ' — add at least 2 teams to generate fixtures'}
                        </p>
                    )}
                </div>
            </motion.div>

            {isLoading ? (
                <div className="space-y-4">{[1, 2, 3].map(i => <SkeletonMatchCard key={i} />)}</div>
            ) : fixtures.length === 0 ? (
                <EmptyState
                    icon={<NavIcons.Calendar />}
                    title="Ready to Generate"
                    description="Select your competition and format above, then click Generate Schedule."
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
                            {fixtures.length} Matches Generated
                        </h2>
                        <Button variant="secondary" size="sm" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save All Fixtures'}
                        </Button>
                    </div>

                    {Object.entries(fixturesByRound).map(([round, matches], roundIdx) => (
                        <motion.div
                            key={round}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: roundIdx * 0.06, duration: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white">{round}</div>
                                <h3 className="text-xs font-bold tracking-wider uppercase text-gray-500">Round {round}</h3>
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
