'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Button,
    Input,
    Select,
} from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { useToast } from '@/components/providers';
import { leagueApi, teamsApi } from '@/lib/api';
import { scheduleMatchAtSchema, type ScheduleMatchAtFormData } from '@/lib/validations';

export default function FixtureScheduler() {
    const router = useRouter();
    const { success, error: showError } = useToast();
    const [competitions, setCompetitions] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ScheduleMatchAtFormData>({
        resolver: zodResolver(scheduleMatchAtSchema),
        defaultValues: {
            competition_id: '',
            home_team_id: '',
            away_team_id: '',
            venue: '',
            scheduled_at: '',
        },
    });

    const selectedCompetitionId = watch('competition_id');

    useEffect(() => {
        async function fetchData() {
            try {
                const [comps, allTeams] = await Promise.all([
                    leagueApi.getCompetitions(),
                    teamsApi.getTeams()
                ]);
                setCompetitions(comps);
                setTeams(allTeams);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                showError('Could not load competitions or teams.');
            } finally {
                setIsLoadingData(false);
            }
        }
        fetchData();
    }, [showError]);

    const onSubmit = async (data: ScheduleMatchAtFormData) => {
        try {
            await leagueApi.createMatch({
                competitionId: data.competition_id,
                homeTeamId: data.home_team_id,
                awayTeamId: data.away_team_id,
                venue: data.venue,
                scheduledDate: new Date(data.scheduled_at),
            });

            success('Match scheduled successfully!');
            router.push('/league');
        } catch (err) {
            console.error('Failed to schedule match:', err);
            showError(err instanceof Error ? err.message : 'Failed to schedule match.');
        }
    };

    const filteredTeams = selectedCompetitionId
        ? teams.filter(t => t.competition_id === selectedCompetitionId)
        : teams;

    return (
        <PageLayout navItems={adminNavItems} title="FIXTURES">
            <div className="max-w-2xl mx-auto">
                <PageHeader label="Scheduler" title="New Match Fixture" />

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Card padding="lg" elevated>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <Select
                                    label="Competition"
                                    placeholder="Select league"
                                    options={competitions.map(c => ({ value: c.id, label: c.name }))}
                                    error={errors.competition_id?.message}
                                    {...register('competition_id')}
                                    onChange={(e) => {
                                        setValue('competition_id', e.target.value);
                                        setValue('home_team_id', '');
                                        setValue('away_team_id', '');
                                    }}
                                    disabled={isLoadingData}
                                    required
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Home Team"
                                        placeholder="Select team"
                                        options={filteredTeams.map(t => ({ value: t.id, label: t.name }))}
                                        error={errors.home_team_id?.message}
                                        {...register('home_team_id')}
                                        disabled={isLoadingData || !selectedCompetitionId}
                                        required
                                    />
                                    <Select
                                        label="Away Team"
                                        placeholder="Select team"
                                        options={filteredTeams.map(t => ({ value: t.id, label: t.name }))}
                                        error={errors.away_team_id?.message}
                                        {...register('away_team_id')}
                                        disabled={isLoadingData || !selectedCompetitionId}
                                        required
                                    />
                                </div>

                                <Input
                                    label="Venue / Pitch"
                                    placeholder="e.g., Stadium Pitch 1"
                                    error={errors.venue?.message}
                                    {...register('venue')}
                                />

                                <Input
                                    label="Date & Time"
                                    type="datetime-local"
                                    error={errors.scheduled_at?.message}
                                    {...register('scheduled_at')}
                                    required
                                />

                                <div className="flex justify-end gap-3 pt-6 border-t border-secondary-main/5">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => router.back()}
                                        disabled={isSubmitting}
                                        className="border-secondary-main/10 text-secondary-main/40"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isLoading={isSubmitting}
                                        className="bg-accent-main hover:bg-accent-dark border-none shadow-lg shadow-accent-main/10"
                                    >
                                        Schedule Match
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </PageLayout>
    );
}
