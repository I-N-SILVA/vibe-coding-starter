'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageLayout, UltimatePlayerCard, StatCard, Badge } from '@/components/plyaz';
import { useQuery } from '@tanstack/react-query';
import { Instagram, Twitter, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublicPlayerData {
    player: {
        id: string;
        name: string;
        position: string | null;
        jersey_number: number | null;
        nationality: string | null;
        bio: string | null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stats: Record<string, any> | null;
        photo_url: string | null;
    };
    team: {
        id: string;
        name: string;
        short_name: string | null;
        primary_color: string | null;
        logo_url: string | null;
    } | null;
    careerStats: {
        goals: number;
        assists: number;
        games_played: number;
        yellow_cards: number;
        red_cards: number;
        minutes_played: number;
    };
}

export default function PublicPlayerProfile() {
    const params = useParams();
    const router = useRouter();
    const playerId = (params?.id as string) || '';

    const { data, isLoading } = useQuery<PublicPlayerData>({
        queryKey: ['public-player', playerId],
        queryFn: async () => {
            const res = await fetch(`/api/league/public/players/${playerId}`);
            if (!res.ok) throw new Error('Player not found');
            return res.json();
        },
        enabled: !!playerId,
        staleTime: 60_000,
    });

    const player = data?.player;
    const team = data?.team;
    const careerStats = data?.careerStats;

    if (isLoading || !player) {
        return (
            <div className="bg-bg-surface-main flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-main border-t-transparent" />
                    <div className="text-sm font-bold uppercase tracking-widest text-secondary-main/50">
                        Scouting Player...
                    </div>
                </div>
            </div>
        );
    }

    const calculateRating = () => {
        if (!careerStats) return 75;
        const total =
            (careerStats.goals || 0) * 5 +
            (careerStats.assists || 0) * 3 +
            (careerStats.games_played || 0) * 2;
        return Math.min(99, 70 + Math.floor(total / 5));
    };

    const cardStats = [
        { label: 'GOL', value: careerStats?.goals || 0 },
        { label: 'AST', value: careerStats?.assists || 0 },
        { label: 'APP', value: careerStats?.games_played || 0 },
        { label: 'YEL', value: careerStats?.yellow_cards || 0 },
        { label: 'RED', value: careerStats?.red_cards || 0 },
        { label: 'MIN', value: Math.floor((careerStats?.minutes_played || 0) / 90) },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socialLinks = (player.stats as any)?.social_links ?? {};

    return (
        <PageLayout
            title={player.name}
            showBackButton
            onBackClick={() => router.back()}
            className="bg-surface-elevated"
        >
            {/* Dynamic Background */}
            <div
                className="absolute left-0 right-0 top-0 -z-10 h-[60vh] overflow-hidden"
                style={{ backgroundColor: team?.primary_color || '#111827' }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-black/80" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                <div className="absolute bottom-0 left-0 h-48 w-full bg-gradient-to-t from-surface-elevated via-surface-elevated/80 to-transparent" />
            </div>

            <div className="mx-auto max-w-6xl pt-8">
                <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
                    {/* Left Column: The Card */}
                    <div className="flex flex-col items-center lg:col-span-5 lg:items-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                            className="group relative w-full max-w-sm"
                        >
                            <div
                                className="absolute inset-0 -z-10 scale-90 rounded-full opacity-30 blur-[120px] transition-transform duration-1000 group-hover:scale-110"
                                style={{ backgroundColor: team?.primary_color || '#F97316' }}
                            />
                            <UltimatePlayerCard
                                name={player.name}
                                position={player.position || 'ST'}
                                number={player.jersey_number || 0}
                                overallRating={calculateRating()}
                                stats={cardStats}
                                teamColor={team?.primary_color ?? undefined}
                                variant="special"
                                showActions={false}
                                className="shadow-2xl shadow-black/80"
                            />
                        </motion.div>

                        {/* Social Links */}
                        {(socialLinks.instagram || socialLinks.twitter || socialLinks.linkedin) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="mt-8 flex gap-4"
                            >
                                {socialLinks.instagram && (
                                    <a
                                        href={socialLinks.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full border border-white/20 bg-white/10 p-3 text-white transition-colors hover:bg-accent-main"
                                    >
                                        <Instagram size={20} />
                                    </a>
                                )}
                                {socialLinks.twitter && (
                                    <a
                                        href={socialLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full border border-white/20 bg-white/10 p-3 text-white transition-colors hover:bg-accent-main"
                                    >
                                        <Twitter size={20} />
                                    </a>
                                )}
                                {socialLinks.linkedin && (
                                    <a
                                        href={socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full border border-white/20 bg-white/10 p-3 text-white transition-colors hover:bg-accent-main"
                                    >
                                        <Linkedin size={20} />
                                    </a>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column: Stats & Bio */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="mb-2 flex items-center gap-4">
                                {player.nationality && (
                                    <span className="text-sm font-bold uppercase tracking-widest text-accent-main">
                                        {player.nationality}
                                    </span>
                                )}
                                {player.nationality && (
                                    <span className="bg-primary/30 h-1 w-1 rounded-full dark:bg-white/30" />
                                )}
                                <span className="text-sm font-bold uppercase tracking-widest text-secondary-main/60 dark:text-white/60">
                                    #{player.jersey_number}
                                </span>
                            </div>

                            <h1 className="mb-6 text-5xl font-black leading-none tracking-tighter text-secondary-main dark:text-white md:text-7xl">
                                {player.name}
                            </h1>

                            {team && (
                                <div
                                    className="bg-primary/5 border-primary/10 hover:bg-primary/10 group mb-10 inline-flex cursor-pointer items-center gap-4 rounded-2xl border p-4 backdrop-blur-sm transition-colors dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                                    onClick={() => router.push(`/league/public/teams/${team.id}`)}
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-gray-700 to-gray-900 text-xl font-bold text-white">
                                        {team.short_name || 'T'}
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-secondary-main/50 transition-colors group-hover:text-accent-main dark:text-white/50">
                                            Current Team
                                        </div>
                                        <div className="text-xl font-bold text-secondary-main dark:text-white">
                                            {team.name}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {player.bio && (
                                <p className="mb-12 max-w-2xl text-lg leading-relaxed text-secondary-main/80 dark:text-white/70">
                                    {player.bio}
                                </p>
                            )}

                            <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-secondary-main/40 dark:text-white/40">
                                Career Stats
                            </h3>

                            <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
                                <StatCard
                                    title="Goals"
                                    value={careerStats?.goals || 0}
                                    className={cn(
                                        'bg-primary/5 border-primary/10 text-secondary-main dark:border-white/10 dark:bg-white/5 dark:text-white',
                                    )}
                                />
                                <StatCard
                                    title="Assists"
                                    value={careerStats?.assists || 0}
                                    className={cn(
                                        'bg-primary/5 border-primary/10 text-secondary-main dark:border-white/10 dark:bg-white/5 dark:text-white',
                                    )}
                                />
                                <StatCard
                                    title="Games"
                                    value={careerStats?.games_played || 0}
                                    className={cn(
                                        'bg-primary/5 border-primary/10 text-secondary-main dark:border-white/10 dark:bg-white/5 dark:text-white',
                                    )}
                                />
                                <div className="flex flex-col justify-between rounded-2xl border border-accent-main/20 bg-accent-main/10 p-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent-main">
                                        Rating
                                    </span>
                                    <span className="text-3xl font-black text-accent-main">
                                        {calculateRating()}
                                    </span>
                                </div>
                            </div>

                            {/* Position Badge */}
                            {player.position && (
                                <Badge className="bg-orange-600 px-4 py-2 text-sm font-black uppercase tracking-widest text-white">
                                    {player.position}
                                </Badge>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
