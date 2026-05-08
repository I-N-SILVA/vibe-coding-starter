'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Button,
    Badge,
    EmptyState,
    SkeletonCard,
    NavIcons,
} from '@/components/plyaz';
import { useCompetitions } from '@/lib/hooks';
import { stagger, fadeUp } from '@/lib/animations';
import type { Competition } from '@/types';

const STATUS_BADGE: Record<Competition['status'], string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    draft: 'bg-neutral-100 text-neutral-500 dark:bg-white/5 dark:text-neutral-400',
    completed: 'bg-black text-white dark:bg-white/10 dark:text-white/80',
    archived: 'bg-neutral-100 text-neutral-400 dark:bg-white/5 dark:text-neutral-500',
};

const TYPE_LABELS: Record<Competition['type'], string> = {
    league: 'League',
    knockout: 'Knockout Cup',
    group_knockout: 'Group + Knockout',
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function CompetitionsPage() {
    const router = useRouter();
    const { data: competitions = [], isLoading } = useCompetitions();

    return (
        <PageLayout title="COMPETITIONS">
            <PageHeader
                label="Competition"
                title="All Competitions"
                rightAction={
                    <Button
                        onClick={() => router.push('/league/create')}
                        className="h-10 text-xs md:h-9"
                    >
                        + Create Competition
                    </Button>
                }
            />

            {isLoading ? (
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <motion.div key={i} variants={fadeUp}>
                            <SkeletonCard />
                        </motion.div>
                    ))}
                </motion.div>
            ) : competitions.length > 0 ? (
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {competitions.map((comp) => (
                        <motion.div key={comp.id} variants={fadeUp}>
                            <Card
                                padding="lg"
                                elevated
                                hoverable
                                className="group cursor-pointer"
                                onClick={() => router.push(`/league/competitions/${comp.id}`)}
                            >
                                <CardContent className="pt-4">
                                    <div className="flex flex-col gap-4">
                                        {/* Icon + Status */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 transition-transform group-hover:scale-110 dark:bg-white/5">
                                                <NavIcons.Trophy className="text-primary h-5 w-5" />
                                            </div>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${STATUS_BADGE[comp.status]}`}
                                            >
                                                {comp.status}
                                            </span>
                                        </div>

                                        {/* Name */}
                                        <div>
                                            <h3 className="mb-1 text-base font-black uppercase italic leading-tight tracking-tight text-neutral-900 dark:text-white">
                                                {comp.name}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge
                                                    variant="secondary"
                                                    size="sm"
                                                    className="text-[9px] font-black uppercase tracking-widest"
                                                >
                                                    {TYPE_LABELS[comp.type] ?? comp.type}
                                                </Badge>
                                                {comp.season && (
                                                    <Badge
                                                        variant="secondary"
                                                        size="sm"
                                                        className="text-[9px] font-black uppercase tracking-widest opacity-60"
                                                    >
                                                        {comp.season}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 dark:border-white/5">
                                            <div>
                                                <p className="mb-0.5 text-[8px] font-black uppercase tracking-widest text-neutral-400">
                                                    Start
                                                </p>
                                                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                                    {formatDate(comp.start_date)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-0.5 text-[8px] font-black uppercase tracking-widest text-neutral-400">
                                                    End
                                                </p>
                                                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                                    {formatDate(comp.end_date)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <EmptyState
                    icon={<NavIcons.Trophy className="h-8 w-8" />}
                    title="No Competitions Yet"
                    description="Create your first competition to get started."
                    action={{
                        label: '+ Create Competition',
                        onClick: () => router.push('/league/create'),
                    }}
                />
            )}
        </PageLayout>
    );
}
