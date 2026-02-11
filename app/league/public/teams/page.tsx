'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Badge,
} from '@/components/plyaz';
import { publicNavItems } from '@/lib/constants/navigation';

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function PublicTeams() {
    const [teams, setTeams] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchTeams() {
            try {
                const res = await fetch('/api/league/teams');
                if (res.ok) setTeams(await res.json());
                else {
                    // Fallback demo data
                    setTeams([
                        { id: '1', name: 'FC United', shortName: 'FCU', played: 12, won: 9, goals: 28 },
                        { id: '2', name: 'Phoenix FC', shortName: 'PHX', played: 12, won: 8, goals: 24 },
                        { id: '3', name: 'City Rangers', shortName: 'CRG', played: 12, won: 7, goals: 20 },
                        { id: '4', name: 'Eagles', shortName: 'EGL', played: 12, won: 6, goals: 18 },
                        { id: '5', name: 'Rovers', shortName: 'ROV', played: 12, won: 5, goals: 15 },
                        { id: '6', name: 'Athletic', shortName: 'ATH', played: 12, won: 4, goals: 14 },
                    ]);
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
        <PageLayout navItems={publicNavItems} title="PLYAZ TEAMS">
            <PageHeader
                label="Champions & Challengers"
                title="League Teams"
                description="Browse through all professional teams competing in the current season."
            />

            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-xl p-8 animate-pulse shadow-sm">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full mb-4" />
                                <div className="h-4 w-28 bg-gray-100 rounded mb-2" />
                                <div className="h-3 w-16 bg-gray-50 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : teams.length > 0 ? (
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {teams.map((team) => (
                        <motion.div key={team.id} variants={fadeUp}>
                            <Card elevated hoverable className="group text-center">
                                <CardContent className="pt-8 pb-6">
                                    <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-5 group-hover:scale-110 group-hover:bg-orange-600 transition-all duration-300">
                                        {team.shortName || team.short_name || team.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                        {team.name}
                                    </h3>
                                    <Badge variant="secondary" size="sm">
                                        {team.division || 'Premier Division'}
                                    </Badge>

                                    <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-gray-50">
                                        <div>
                                            <p className="text-lg font-black text-gray-900">{team.played || 0}</p>
                                            <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">Played</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-gray-900">{team.won || 0}</p>
                                            <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">Won</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-gray-900">{team.goals || 0}</p>
                                            <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">Goals</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 text-sm">No teams registered yet.</p>
                </div>
            )}
        </PageLayout>
    );
}
