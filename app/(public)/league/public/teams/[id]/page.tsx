'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PageLayout, StatCard, EmptyState, NavIcons, SkeletonMatchCard } from '@/components/plyaz';
import { cn } from '@/lib/utils';
import { stagger, fadeUpLarge } from '@/lib/animations';
import type { Team, Player, Match } from '@/lib/supabase/types';

interface TeamProfileData {
    team: Team;
    players: Player[];
    matches: Match[];
}

export default function TeamProfile() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [profileData, setProfileData] = useState<TeamProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchTeam() {
            try {
                const res = await fetch(`/api/league/public/teams/${id}`);
                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }
                if (res.ok) setProfileData(await res.json());
            } catch {
                // silently fail
            } finally {
                setIsLoading(false);
            }
        }
        if (id) fetchTeam();
    }, [id]);

    if (notFound) {
        return (
            <PageLayout title="Team Not Found" showBackButton onBackClick={() => router.back()}>
                <EmptyState
                    icon={<NavIcons.Teams />}
                    title="Team Not Found"
                    description="This team profile does not exist or is not publicly available."
                />
            </PageLayout>
        );
    }

    if (isLoading) {
        return (
            <PageLayout title="Loading..." showBackButton onBackClick={() => router.back()}>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-50" />
                    ))}
                </div>
            </PageLayout>
        );
    }

    if (!profileData) {
        return (
            <PageLayout title="Error" showBackButton onBackClick={() => router.back()}>
                <EmptyState
                    icon={<NavIcons.Teams />}
                    title="Could not load team"
                    description="Please try again later."
                />
            </PageLayout>
        );
    }

    const { team, players, matches } = profileData;

    const upcomingMatches = matches.filter(
        (m) => m.status === 'upcoming' || m.status === 'scheduled',
    );
    const completedMatches = matches.filter((m) => m.status === 'completed');
    const wins = completedMatches.filter((m) => {
        const isHome = m.home_team_id === team.id;
        return isHome ? m.home_score > m.away_score : m.away_score > m.home_score;
    }).length;
    const goalsFor = completedMatches.reduce((sum, m) => {
        return sum + (m.home_team_id === team.id ? m.home_score : m.away_score);
    }, 0);
    const goalsAgainst = completedMatches.reduce((sum, m) => {
        return sum + (m.home_team_id === team.id ? m.away_score : m.home_score);
    }, 0);

    return (
        <PageLayout
            title={team.name}
            showBackButton
            onBackClick={() => router.back()}
            className="bg-surface-elevated"
        >
            {/* Hero Section */}
            <div className="relative -mx-4 -mt-8 mb-16 flex min-h-[40vh] items-end overflow-hidden md:-mx-8">
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: team.primary_color || 'var(--primary-main)' }}
                >
                    <div className="absolute inset-0 bg-[url('/static/branding/pattern.png')] bg-repeat opacity-20 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-transparent to-transparent" />
                </div>

                <div className="pointer-events-none absolute -bottom-20 -right-20 h-[60vh] w-[60vh] select-none opacity-[0.03]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white font-serif text-[20rem] font-black">
                        {(team.short_name ?? team.name)[0]}
                    </div>
                </div>

                <div className="relative z-10 w-full px-4 pb-8 md:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="mx-auto flex max-w-7xl flex-col items-end gap-8 md:flex-row"
                    >
                        <div
                            className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border-4 bg-surface-elevated text-5xl font-black shadow-2xl md:h-48 md:w-48 md:text-7xl"
                            style={{
                                borderColor: team.primary_color || 'var(--primary-main)',
                                color: team.primary_color || 'var(--primary-main)',
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300" />
                            {team.logo_url ? (
                                <Image
                                    src={team.logo_url}
                                    alt={team.name}
                                    fill
                                    className="relative z-10 object-cover"
                                    sizes="(max-width: 768px) 128px, 192px"
                                />
                            ) : (
                                <span className="relative z-10 text-4xl">
                                    {team.short_name ?? team.name.slice(0, 3).toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className="mb-2 flex-1">
                            <h1 className="mb-4 text-5xl font-black leading-none tracking-tighter text-white md:text-8xl">
                                {team.name}
                            </h1>
                            {team.short_name && (
                                <span className="rounded-full bg-accent-main px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                                    {team.short_name}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-md md:gap-8">
                            <div>
                                <div className="text-2xl font-black text-white">
                                    {completedMatches.length}
                                </div>
                                <div className="text-[10px] uppercase tracking-widest text-white/50">
                                    Played
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white">{wins}</div>
                                <div className="text-[10px] uppercase tracking-widest text-white/50">
                                    Won
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-accent-main">
                                    {players.length}
                                </div>
                                <div className="text-[10px] uppercase tracking-widest text-white/50">
                                    Players
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
                {/* Squad */}
                <div className="lg:col-span-8">
                    <h2 className="mb-8 text-2xl font-black tracking-tight text-primary-main">
                        Squad
                    </h2>
                    {players.length === 0 ? (
                        <EmptyState
                            icon={<NavIcons.Teams />}
                            title="No players listed"
                            description="This team has no registered players yet."
                        />
                    ) : (
                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                        >
                            {players.map((player) => (
                                <motion.div key={player.id} variants={fadeUpLarge}>
                                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                                        <div className="flex items-center gap-3">
                                            {player.jersey_number != null && (
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-main text-lg font-black text-white">
                                                    {player.jersey_number}
                                                </span>
                                            )}
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-gray-900">
                                                    {player.name}
                                                </p>
                                                {player.position && (
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                        {player.position}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-12 lg:col-span-4">
                    {/* Next Match */}
                    {upcomingMatches.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <h2 className="mb-6 text-lg font-black uppercase tracking-widest text-secondary-main/50">
                                Next Match
                            </h2>
                            {upcomingMatches.slice(0, 1).map((match) => {
                                const homeName =
                                    match.home_team?.short_name ?? match.home_team?.name ?? 'Home';
                                const awayName =
                                    match.away_team?.short_name ?? match.away_team?.name ?? 'Away';
                                const matchDate = match.scheduled_at
                                    ? new Date(match.scheduled_at).toLocaleDateString([], {
                                          dateStyle: 'medium',
                                      })
                                    : 'TBD';
                                const matchTime = match.scheduled_at
                                    ? new Date(match.scheduled_at).toLocaleTimeString([], {
                                          timeStyle: 'short',
                                      })
                                    : null;
                                return (
                                    <div
                                        key={match.id}
                                        className="group relative overflow-hidden rounded-3xl border border-secondary-main/5 bg-white p-6 shadow-xl shadow-secondary-main/5"
                                    >
                                        <div className="mb-6 flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-secondary-main/50">
                                                {matchDate}
                                                {matchTime ? ` • ${matchTime}` : ''}
                                            </span>
                                            {match.venue && (
                                                <span className="rounded bg-accent-main/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-main">
                                                    {match.venue}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mb-8 flex items-center justify-between">
                                            <div className="text-center">
                                                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-xl font-black text-gray-400">
                                                    {homeName}
                                                </div>
                                                <span className="text-lg font-bold">
                                                    {homeName}
                                                </span>
                                            </div>
                                            <div
                                                className={cn(
                                                    'text-3xl font-black text-secondary-main/20',
                                                )}
                                            >
                                                VS
                                            </div>
                                            <div className="text-center">
                                                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-xl font-black text-gray-400">
                                                    {awayName}
                                                </div>
                                                <span className="text-lg font-bold">
                                                    {awayName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Season Stats */}
                    <div>
                        <h2 className="mb-6 text-lg font-black uppercase tracking-widest text-secondary-main/50">
                            Season Stats
                        </h2>
                        <div className="space-y-4">
                            <StatCard
                                title="Goals Scored"
                                value={goalsFor}
                                className="border-secondary-main/5 bg-white"
                            />
                            <StatCard
                                title="Goals Against"
                                value={goalsAgainst}
                                className="border-secondary-main/5 bg-white"
                            />
                            <StatCard
                                title="Matches Played"
                                value={completedMatches.length}
                                className="border-secondary-main/5 bg-white"
                            />
                        </div>
                    </div>

                    {/* Recent Results */}
                    {completedMatches.length > 0 && (
                        <div>
                            <h2 className="mb-6 text-lg font-black uppercase tracking-widest text-secondary-main/50">
                                Recent Results
                            </h2>
                            <div className="space-y-3">
                                {completedMatches
                                    .slice(-3)
                                    .reverse()
                                    .map((match) => {
                                        const isHome = match.home_team_id === team.id;
                                        const teamScore = isHome
                                            ? match.home_score
                                            : match.away_score;
                                        const oppScore = isHome
                                            ? match.away_score
                                            : match.home_score;
                                        const opponent = isHome
                                            ? (match.away_team?.short_name ??
                                              match.away_team?.name ??
                                              'OPP')
                                            : (match.home_team?.short_name ??
                                              match.home_team?.name ??
                                              'OPP');
                                        const result =
                                            teamScore > oppScore
                                                ? 'W'
                                                : teamScore < oppScore
                                                  ? 'L'
                                                  : 'D';
                                        return (
                                            <div
                                                key={match.id}
                                                className="flex items-center justify-between rounded-xl border border-gray-50 bg-white p-4"
                                            >
                                                <span
                                                    className={cn(
                                                        'flex h-7 w-7 items-center justify-center rounded border text-[10px] font-black',
                                                        result === 'W'
                                                            ? 'border-green-500/50 bg-green-500/20 text-green-700'
                                                            : result === 'D'
                                                              ? 'border-yellow-500/50 bg-yellow-500/20 text-yellow-700'
                                                              : 'border-red-500/50 bg-red-500/20 text-red-700',
                                                    )}
                                                >
                                                    {result}
                                                </span>
                                                <span className="text-sm font-bold text-gray-600">
                                                    {opponent}
                                                </span>
                                                <span className="text-sm font-black">
                                                    {teamScore}–{oppScore}
                                                </span>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    {/* Loading upcoming */}
                    {isLoading && <SkeletonMatchCard />}
                </div>
            </div>
        </PageLayout>
    );
}
