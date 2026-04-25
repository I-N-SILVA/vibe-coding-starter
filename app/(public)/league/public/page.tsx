'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Skeleton,
    PageLayout,
    PageHeader,
    EmptyState,
    NavIcons,
} from '@/components/plyaz';
import { stagger, fadeUpLarge } from '@/lib/animations';

interface PublicCompetition {
    id: string;
    name: string;
    type: string;
    status: string;
    start_date: string | null;
    max_teams: number;
}

export default function PublicCompetitions() {
    const router = useRouter();
    const [competitions, setCompetitions] = useState<PublicCompetition[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/league/public/competitions')
            .then((res) => (res.ok ? res.json() : []))
            .then((data: PublicCompetition[]) => setCompetitions(data))
            .catch(() => setCompetitions([]))
            .finally(() => setIsLoading(false));
    }, []);

    const formatStartDate = (dateStr: string | null) => {
        if (!dateStr) return 'TBC';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatType = (type: string) => {
        if (type === 'league') return 'League';
        if (type === 'knockout') return 'Knockout Cup';
        if (type === 'group_knockout') return 'Group + Knockout';
        return type;
    };

    return (
        <PageLayout title="PLYAZ FAN">
            <PageHeader label="Competitions" title="PLYAZ Leagues" />
            <div className="max-w-4xl mx-auto">

                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200/60 dark:border-neutral-700/50 p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <Skeleton className="h-6 w-40 mb-2" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                </div>
                                <div className="pt-6 border-t border-neutral-50 dark:border-neutral-700/50 flex justify-between">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-8 w-24 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : competitions.length === 0 ? (
                    <EmptyState
                        icon={<NavIcons.Calendar />}
                        title="No Active Competitions"
                        description="Check back soon — competitions will appear here once they go live."
                    />
                ) : (
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        className="grid md:grid-cols-2 gap-6"
                    >
                        {competitions.map((comp) => (
                            <motion.div key={comp.id} variants={fadeUpLarge}>
                                <Card
                                    elevated
                                    hoverable
                                    className="cursor-pointer group"
                                    onClick={() => router.push(`/league/public/scoreboard?competitionId=${comp.id}`)}
                                    data-testid={`competition-card-${comp.id}`}
                                >
                                    <CardContent className="pt-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-orange-500 transition-colors">
                                                    {comp.name}
                                                </h2>
                                                <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mt-1">
                                                    {formatType(comp.type)}
                                                </p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400 dark:text-neutral-500">
                                                {comp.max_teams || 0}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-neutral-50 dark:border-neutral-700/50">
                                            <span className="text-[10px] font-medium tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                                                Starts {formatStartDate(comp.start_date)}
                                            </span>
                                            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                                                View Scores
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 text-center"
                >
                    <Button variant="secondary" onClick={() => router.push('/login')}>
                        Admin Login
                    </Button>
                </motion.div>
            </div>
        </PageLayout>
    );
}
