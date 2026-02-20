'use client';

import React, { use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    PageLayout,
    UltimatePlayerCard,
    StatCard,
    Badge,
} from '@/components/plyaz';
import { publicNavItems } from '@/lib/constants/navigation';
import { usePlayer, usePlayerCareerStats } from '@/lib/hooks/use-players';
import { useTeam } from '@/lib/hooks/use-teams';
import { Instagram, Twitter, Linkedin } from 'lucide-react';
import type { PlayerCompetitionStats } from '@/types';
import { cn } from '@/lib/utils';
// Removed unused animation imports

export default function PublicPlayerProfile() {
    const params = useParams();
    const router = useRouter();
    const playerId = (params?.id as string) || '';

    // Fetch dynamic data
    const { data: player, isLoading: isPlayerLoading } = usePlayer('', playerId);
    const { data: careerStatsData, isLoading: isStatsLoading } = usePlayerCareerStats(playerId);
    const careerStats = careerStatsData as PlayerCompetitionStats;
    const { data: team, isLoading: isTeamLoading } = useTeam(player?.team_id || '');

    const isLoading = isPlayerLoading || isStatsLoading || isTeamLoading;

    if (isLoading || !player) {
        return (
            <div className="min-h-screen bg-bg-surface-main flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-accent-main border-t-transparent rounded-full animate-spin" />
                    <div className="text-sm font-bold tracking-widest uppercase text-secondary-main/50">Scouting Player...</div>
                </div>
            </div>
        );
    }

    // Map stats for the Ultimate card
    const cardStats = [
        { label: 'PAC', value: 85 },
        { label: 'SHO', value: 88 },
        { label: 'PAS', value: 78 },
        { label: 'DRI', value: 82 },
        { label: 'DEF', value: 42 },
        { label: 'PHY', value: 75 }
    ];

    return (
        <PageLayout
            navItems={publicNavItems}
            title={player.name}
            showBackButton
            onBackClick={() => router.back()}
            className="bg-surface-elevated"
        >
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/static/branding/pattern.png')] bg-repeat opacity-5 mix-blend-overlay" />
                <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-accent-main/10 rounded-full blur-[100px] -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-surface-elevated to-transparent" />
            </div>

            <div className="max-w-6xl mx-auto pt-8">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">

                    {/* Left Column: The Card (Centerpiece) */}
                    <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                            className="w-full max-w-sm relative group"
                        >
                            <div className="absolute inset-0 bg-accent-main/20 blur-2xl rounded-full scale-90 group-hover:scale-100 transition-transform duration-700 -z-10" />
                            <UltimatePlayerCard
                                name={player.name}
                                position={player.position || 'ST'}
                                number={player.jersey_number || 0}
                                overallRating={88} // Mock rating if not in DB
                                stats={cardStats}
                                variant="special"
                                className="shadow-2xl shadow-black/50 border-4 border-gray-800/50"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 flex flex-wrap gap-2 justify-center lg:justify-start"
                        >
                            {['Top Scorer', 'Captain', 'Fan Favorite'].map((badge, i) => (
                                <Badge key={i} className="bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 text-secondary-main dark:text-white/80 hover:bg-accent-main hover:text-white transition-colors">
                                    {badge}
                                </Badge>
                            ))}
                        </motion.div>

                        {/* Social Links */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="mt-8 flex gap-4"
                        >
                            <a
                                href={player.social_links?.instagram || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-accent-main transition-colors",
                                    !player.social_links?.instagram && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <Instagram size={20} />
                            </a>
                            <a
                                href={player.social_links?.twitter || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-accent-main transition-colors",
                                    !player.social_links?.twitter && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <Twitter size={20} />
                            </a>
                            <a
                                href={player.social_links?.linkedin || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-accent-main transition-colors",
                                    !player.social_links?.linkedin && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <Linkedin size={20} />
                            </a>
                        </motion.div>
                    </div>

                    {/* Right Column: Stats & Bio */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-4 mb-2">
                                <span className="text-accent-main font-bold tracking-widest uppercase text-sm">
                                    {player.nationality || 'Unknown'}
                                </span>
                                <span className="w-1 h-1 bg-primary/30 dark:bg-white/30 rounded-full" />
                                <span className="text-secondary-main/60 dark:text-white/60 font-bold tracking-widest uppercase text-sm">
                                    #{player.jersey_number}
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none text-secondary-main dark:text-white">
                                {player.name}
                            </h1>

                            <div
                                className="inline-flex items-center gap-4 p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 backdrop-blur-sm mb-10 cursor-pointer hover:bg-primary/10 dark:hover:bg-white/10 transition-colors group"
                                onClick={() => team && router.push(`/league/public/teams/${team.id}`)}
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xl font-bold border border-white/20 text-white">
                                    {team?.short_name || 'T'}
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-secondary-main/50 dark:text-white/50 group-hover:text-accent-main transition-colors">Current Team</div>
                                    <div className="text-xl font-bold text-secondary-main dark:text-white">{team?.name || 'Loading...'}</div>
                                </div>
                            </div>

                            <p className="text-lg text-secondary-main/80 dark:text-white/70 leading-relaxed mb-12 max-w-2xl">
                                {player.bio || 'This player has not written a bio yet.'}
                            </p>

                            <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-secondary-main/40 dark:text-white/40 mb-6">
                                Season Performance
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                                <StatCard title="Goals" value={careerStats?.goals || 0} className="bg-primary/5 dark:bg-white/5 border-primary/10 dark:border-white/10 text-secondary-main dark:text-white" />
                                <StatCard title="Assists" value={careerStats?.assists || 0} className="bg-primary/5 dark:bg-white/5 border-primary/10 dark:border-white/10 text-secondary-main dark:text-white" />
                                <StatCard title="Games" value={careerStats?.games_played || 0} className="bg-primary/5 dark:bg-white/5 border-primary/10 dark:border-white/10 text-secondary-main dark:text-white" />
                                <div className="p-4 rounded-2xl bg-accent-main/10 border border-accent-main/20 flex flex-col justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent-main">MOTM</span>
                                    <span className="text-3xl font-black text-accent-main">3</span>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-secondary-main/40 dark:text-white/40 mb-6">
                                Recent Form
                            </h3>
                            <div className="flex gap-2">
                                {['W', 'W', 'W', 'D', 'L'].map((result, i) => (
                                    <div
                                        key={i}
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-black border ${result === 'W' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                                            result === 'D' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' :
                                                'bg-red-500/20 border-red-500/50 text-red-400'
                                            }`}
                                    >
                                        {result}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
