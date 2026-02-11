'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Button,
    Badge,
    StatCard,
} from '@/components/plyaz';
import { publicNavItems } from '@/lib/constants/navigation';

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PublicPlayerProfile() {
    const params = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    // Mock data for the demonstration
    const player = {
        id: params?.id || '1',
        name: 'James Smith',
        team: { id: '1', name: 'FC United', shortName: 'FCU' },
        position: 'Striker',
        number: 9,
        nationality: 'English',
        bio: 'Top scorer of the 2023 season. Known for clinical finishing and elite positioning.',
        stats: {
            goals: 12,
            assists: 4,
            appearances: 8,
            minutes: 680,
            rating: 8.7
        },
        recentForm: ['G', 'G', 'A', 'G', 'M'] // G: Goal, A: Assist, M: Match played (no direct contribution)
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <PageLayout
            navItems={publicNavItems}
            title="PLAYER PROFILE"
            showBackButton
            onBackClick={() => router.back()}
        >
            <PageHeader
                label="Athlete Biography"
                title={player.name}
                description={`Leading ${player.position} for ${player.team.name}`}
                rightAction={
                    <Badge variant="secondary" className="bg-gray-900 text-white border-0">Season 24 Participant</Badge>
                }
            />

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-8 pb-20 mt-8"
            >
                {/* Hero Profile Card */}
                <motion.section variants={fadeUp}>
                    <Card elevated className="bg-gray-900 text-white overflow-hidden border-0">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                                <div className="p-8 flex-1">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-24 h-24 rounded-2xl bg-orange-600 flex items-center justify-center text-4xl font-black shadow-2xl transform rotate-2">
                                            {player.number}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tight">{player.name}</h2>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-orange-500 font-bold text-xs tracking-widest uppercase">
                                                    {player.position}
                                                </span>
                                                <span className="text-white/20">|</span>
                                                <span className="text-white/50 text-xs font-bold uppercase tracking-widest">
                                                    {player.nationality}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4 pt-8 border-t border-white/10">
                                        {[
                                            { label: 'Goals', val: player.stats.goals },
                                            { label: 'Assists', val: player.stats.assists },
                                            { label: 'Games', val: player.stats.appearances },
                                            { label: 'Rating', val: player.stats.rating },
                                        ].map((s) => (
                                            <div key={s.label}>
                                                <p className="text-2xl font-black">{s.val}</p>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-orange-600/5 p-8 flex items-center justify-center border-l border-white/5 md:w-64">
                                    <div className="text-center group" onClick={() => router.push(`/league/public/teams/${player.team.id}`)}>
                                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-white mb-4 transition-all group-hover:bg-orange-600 group-hover:scale-105 cursor-pointer">
                                            {player.team.shortName}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors cursor-pointer">{player.team.name}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.section>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Bio & History */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.section variants={fadeUp}>
                            <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">About the Player</h3>
                            <Card elevated padding="lg">
                                <p className="text-gray-600 leading-relaxed italic">
                                    "{player.bio}"
                                </p>
                            </Card>
                        </motion.section>

                        <motion.section variants={fadeUp}>
                            <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Recent Match Performance</h3>
                            <div className="grid gap-3">
                                {player.recentForm.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${item === 'G' ? 'bg-green-100 text-green-700' :
                                                item === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                {item}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Game {player.stats.appearances - idx}</p>
                                                <p className="text-[10px] text-gray-400 uppercase">Feb {10 - idx}, 2024</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">8.0 Rating</Badge>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    </div>

                    {/* Right Column: Key Metrics */}
                    <div className="space-y-8">
                        <motion.section variants={fadeUp}>
                            <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Metric Breakdown</h3>
                            <div className="grid gap-4">
                                <Card padding="md">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Minutes Played</p>
                                        <p className="text-lg font-black">{player.stats.minutes}</p>
                                    </div>
                                </Card>
                                <Card padding="md">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Goals per Match</p>
                                        <p className="text-lg font-black">1.5</p>
                                    </div>
                                </Card>
                                <Card padding="md">
                                    <div className="flex justify-between items-center text-orange-600">
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Scouting Potential</p>
                                        <p className="text-xl font-black">94%</p>
                                    </div>
                                </Card>
                            </div>
                        </motion.section>

                        <motion.section variants={fadeUp}>
                            <Card elevated className="bg-orange-600 border-0 p-8 text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Want updates?</p>
                                    <h4 className="text-xl font-black mb-4">Follow {player.name.split(' ')[0]}</h4>
                                    <Button variant="secondary" className="bg-white text-orange-600 border-0 font-bold hover:bg-white/90">
                                        Get Notifications
                                    </Button>
                                </div>
                                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            </Card>
                        </motion.section>
                    </div>
                </div>
            </motion.div>
        </PageLayout>
    );
}
