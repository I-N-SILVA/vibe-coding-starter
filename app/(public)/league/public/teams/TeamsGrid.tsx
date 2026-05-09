'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageLayout, PageHeader, Card, CardContent, Badge } from '@/components/plyaz';
import { stagger, fadeUp } from '@/lib/animations';

interface PublicTeam {
    id: string;
    name: string;
    short_name: string | null;
    competition_id: string | null;
    logo_url: string | null;
    primary_color: string | null;
}

interface TeamsGridProps {
    teams: PublicTeam[];
}

export default function TeamsGrid({ teams }: TeamsGridProps) {
    const router = useRouter();

    return (
        <PageLayout title="PLYAZ TEAMS">
            <PageHeader
                label="Champions & Challengers"
                title="League Teams"
                description="Browse through all professional teams competing in the current season."
            />

            {teams.length > 0 ? (
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {teams.map((team) => (
                        <motion.div
                            key={team.id}
                            variants={fadeUp}
                            className="cursor-pointer"
                            onClick={() => router.push('/league/public/teams/' + team.id)}
                        >
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
