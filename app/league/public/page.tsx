'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Skeleton,
} from '@/components/plyaz';

import { stagger, fadeUpLarge } from '@/lib/animations';

export default function PublicCompetitions() {
    const router = useRouter();
    const [competitions, setCompetitions] = useState<Array<{ id: string; name: string; type: string; teamCount?: number; startDate: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    const DEFAULT_COMPS = [
        { id: '1', name: 'Premier Division', type: 'League', teamCount: 12, startDate: 'Feb 1, 2026' },
        { id: '2', name: 'Sunday Cup', type: 'Knockout', teamCount: 16, startDate: 'Mar 15, 2026' },
    ];

    useEffect(() => {
        async function fetchComps() {
            try {
                const res = await fetch('/api/league/competitions');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) setCompetitions(data);
                    else setCompetitions(DEFAULT_COMPS);
                } else {
                    setCompetitions(DEFAULT_COMPS);
                }
            } catch {
                setCompetitions(DEFAULT_COMPS);
            } finally {
                setIsLoading(false);
            }
        }
        fetchComps();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
                        PLYAZ LEAGUES
                    </h1>
                    <p className="text-xs font-medium tracking-widest uppercase text-gray-400">
                        Select a competition to follow pulse
                    </p>
                </motion.div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-lg border border-gray-200 p-8 shadow-lg">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <Skeleton className="h-6 w-40 mb-2" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                </div>
                                <div className="pt-6 border-t border-gray-50 flex justify-between">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-8 w-24 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
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
                                >
                                    <CardContent className="pt-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                    {comp.name}
                                                </h2>
                                                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mt-1">
                                                    {comp.type}
                                                </p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                                                {comp.teamCount || 0}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                                            <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
                                                Starts {comp.startDate}
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
        </div>
    );
}
