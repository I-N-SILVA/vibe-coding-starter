'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    PageLayout,
    StatCard,
    EmptyState,
    NavIcons,
    SkeletonMatchCard,
} from '@/components/plyaz';
import { publicNavItems } from '@/lib/constants/navigation';
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
                if (res.status === 404) { setNotFound(true); return; }
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
            <PageLayout navItems={publicNavItems} title="Team Not Found" showBackButton onBackClick={() => router.back()}>
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
            <PageLayout navItems={publicNavItems} title="Loading..." showBackButton onBackClick={() => router.back()}>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </PageLayout>
        );
    }

    if (!profileData) {
        return (
            <PageLayout navItems={publicNavItems} title="Error" showBackButton onBackClick={() => router.back()}>
                <EmptyState
                    icon={<NavIcons.Teams />}
                    title="Could not load team"
                    description="Please try again later."
                />
            </PageLayout>
        );
    }

    const { team, players, matches } = profileData;

    const upcomingMatches = matches.filter(m => m.status === 'upcoming' || m.status === 'scheduled');
    const completedMatches = matches.filter(m => m.status === 'completed');
    const wins = completedMatches.filter(m => {
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
            navItems={publicNavItems}
            title={team.name}
            showBackButton
            onBackClick={() => router.back()}
            className="bg-surface-elevated"
        >
            {/* Hero Section */}
            <div className="relative -mx-4 md:-mx-8 -mt-8 mb-16 overflow-hidden min-h-[40vh] flex items-end">
                <div 
                    className="absolute inset-0"
                    style={{ backgroundColor: team.primary_color || 'var(--primary-main)' }}
                >
                    <div className="absolute inset-0 opacity-20 bg-[url('/static/branding/pattern.png')] bg-repeat mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-transparent to-transparent" />
                </div>

                <div className="absolute -right-20 -bottom-20 w-[60vh] h-[60vh] opacity-[0.03] select-none pointer-events-none">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[20rem] font-black font-serif">
                        {(team.short_name ?? team.name)[0]}
                    </div>
                </div>

                <div className="relative z-10 w-full px-4 md:px-8 pb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-8"
                    >
                        <div 
                            className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-surface-elevated shadow-2xl border-4 flex items-center justify-center text-5xl md:text-7xl font-black relative overflow-hidden group"
                            style={{ borderColor: team.primary_color || 'var(--primary-main)', color: team.primary_color || 'var(--primary-main)' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300" />
                            {team.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={team.logo_url} alt={team.name} className="relative z-10 w-full h-full object-cover" />
                            ) : (
                                <span className="relative z-10 text-4xl">{team.short_name ?? team.name.slice(0, 3).toUpperCase()}</span>
                            )}
                        </div>

                        <div className="flex-1 mb-2">
                            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none mb-4">
                                {team.name}
                            </h1>
                            {team.short_name && (
                                <span className="px-3 py-1 rounded-full bg-accent-main text-white text-xs font-bold tracking-widest uppercase">
                                    {team.short_name}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 md:gap-8 text-center bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                            <div>
                                <div className="text-2xl font-black text-white">{completedMatches.length}</div>
                                <div className="text-[10px] uppercase tracking-widest text-white/50">Played</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white">{wins}</div>
                                <div className="text-[10px] uppercase tracking-widest text-white/50">Won</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-accent-main">{players.length}</div>
                                <div className="text-[10px] uppercase tracking-widest text-white/50">Players</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
                {/* Squad */}
                <div className="lg:col-span-8">
                    <h2 className="text-2xl font-black tracking-tight text-primary-main mb-8">Squad</h2>
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
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                            {players.map((player) => (
                                <motion.div key={player.id} variants={fadeUpLarge}>
                                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            {player.jersey_number != null && (
                                                <span className="w-10 h-10 rounded-xl bg-primary-main text-white font-black text-lg flex items-center justify-center shrink-0">
                                                    {player.jersey_number}
                                                </span>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-gray-900 truncate">{player.name}</p>
                                                {player.position && (
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{player.position}</p>
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
                <div className="lg:col-span-4 space-y-12">
                    {/* Next Match */}
                    {upcomingMatches.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <h2 className="text-lg font-black tracking-widest uppercase text-secondary-main/50 mb-6">
                                Next Match
                            </h2>
                            {upcomingMatches.slice(0, 1).map((match) => {
                                const homeName = match.home_team?.short_name ?? match.home_team?.name ?? 'Home';
                                const awayName = match.away_team?.short_name ?? match.away_team?.name ?? 'Away';
                                const matchDate = match.scheduled_at
                                    ? new Date(match.scheduled_at).toLocaleDateString([], { dateStyle: 'medium' })
                                    : 'TBD';
                                const matchTime = match.scheduled_at
                                    ? new Date(match.scheduled_at).toLocaleTimeString([], { timeStyle: 'short' })
                                    : null;
                                return (
                                    <div key={match.id} className="bg-white rounded-3xl p-6 shadow-xl shadow-secondary-main/5 border border-secondary-main/5 relative overflow-hidden group">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-xs font-bold text-secondary-main/50 uppercase tracking-wider">
                                                {matchDate}{matchTime ? ` • ${matchTime}` : ''}
                                            </span>
                                            {match.venue && (
                                                <span className="px-2 py-1 rounded bg-accent-main/10 text-accent-main text-[10px] font-bold uppercase tracking-widest">
                                                    {match.venue}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="text-center">
                                                <div className="w-16 h-16 rounded-2xl bg-gray-100 mb-2 mx-auto flex items-center justify-center text-xl font-black text-gray-400">
                                                    {homeName}
                                                </div>
                                                <span className="font-bold text-lg">{homeName}</span>
                                            </div>
                                            <div className={cn('text-3xl font-black text-secondary-main/20')}>VS</div>
                                            <div className="text-center">
                                                <div className="w-16 h-16 rounded-2xl bg-gray-100 mb-2 mx-auto flex items-center justify-center text-xl font-black text-gray-400">
                                                    {awayName}
                                                </div>
                                                <span className="font-bold text-lg">{awayName}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Season Stats */}
                    <div>
                        <h2 className="text-lg font-black tracking-widest uppercase text-secondary-main/50 mb-6">
                            Season Stats
                        </h2>
                        <div className="space-y-4">
                            <StatCard title="Goals Scored" value={goalsFor} className="bg-white border-secondary-main/5" />
                            <StatCard title="Goals Against" value={goalsAgainst} className="bg-white border-secondary-main/5" />
                            <StatCard title="Matches Played" value={completedMatches.length} className="bg-white border-secondary-main/5" />
                        </div>
                    </div>

                    {/* Recent Results */}
                    {completedMatches.length > 0 && (
                        <div>
                            <h2 className="text-lg font-black tracking-widest uppercase text-secondary-main/50 mb-6">
                                Recent Results
                            </h2>
                            <div className="space-y-3">
                                {completedMatches.slice(-3).reverse().map((match) => {
                                    const isHome = match.home_team_id === team.id;
                                    const teamScore = isHome ? match.home_score : match.away_score;
                                    const oppScore = isHome ? match.away_score : match.home_score;
                                    const opponent = isHome
                                        ? (match.away_team?.short_name ?? match.away_team?.name ?? 'OPP')
                                        : (match.home_team?.short_name ?? match.home_team?.name ?? 'OPP');
                                    const result = teamScore > oppScore ? 'W' : teamScore < oppScore ? 'L' : 'D';
                                    return (
                                        <div key={match.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-50">
                                            <span className={cn(
                                                'w-7 h-7 rounded flex items-center justify-center text-[10px] font-black border',
                                                result === 'W' ? 'bg-green-500/20 text-green-700 border-green-500/50' :
                                                    result === 'D' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50' :
                                                        'bg-red-500/20 text-red-700 border-red-500/50'
                                            )}>{result}</span>
                                            <span className="text-sm font-bold text-gray-600">{opponent}</span>
                                            <span className="text-sm font-black">{teamScore}–{oppScore}</span>
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
