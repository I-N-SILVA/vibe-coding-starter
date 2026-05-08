'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageLayout, PageHeader, Card, CardContent, Badge } from '@/components/plyaz';
import { stagger, fadeUp } from '@/lib/animations';

export default function PublicTeams() {
    const [teams, setTeams] = useState<
        Array<{
            id: string;
            name: string;
            short_name?: string | null;
            competition_id?: string | null;
            logo_url?: string | null;
            primary_color?: string | null;
        }>
    >([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchTeams() {
            try {
                const res = await fetch('/api/league/public/teams');
                if (res.ok) {
                    const data = await res.json();
                    setTeams(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTeams();
    }, []);

    return (
        <PageLayout title="PLYAZ TEAMS">
            <PageHeader
                label="Champions & Challengers"
                title="League Teams"
                description="Browse through all professional teams competing in the current season."
            />

            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse rounded-xl bg-white p-8 shadow-sm">
                            <div className="flex flex-col items-center">
                                <div className="mb-4 h-16 w-16 rounded-full bg-gray-100" />
                                <div className="mb-2 h-4 w-28 rounded bg-gray-100" />
                                <div className="h-3 w-16 rounded bg-gray-50" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : teams.length > 0 ? (
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {teams.map((team) => (
                        <motion.div key={team.id} variants={fadeUp}>
                            <Card elevated hoverable className="group text-center">
                                <CardContent className="pb-6 pt-8">
                                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-900 text-2xl font-bold text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-600">
                                        {team.short_name || team.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-orange-600">
                                        {team.name}
                                    </h3>
                                    <Badge variant="secondary" size="sm">
                                        Premier Division
                                    </Badge>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 py-20 text-center">
                    <p className="text-sm text-gray-400">No teams registered yet.</p>
                </div>
            )}
        </PageLayout>
    );
}
