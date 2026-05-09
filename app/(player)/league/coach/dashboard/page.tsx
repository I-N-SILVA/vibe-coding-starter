'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PageLayout, PageHeader, Button } from '@/components/plyaz';
import { stagger, fadeUp } from '@/lib/animations';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useTeams, usePlayers, useMatches } from '@/lib/hooks';
import { RecruitmentSettings } from '@/components/plyaz/RecruitmentSettings';
import { ApplicationsInbox } from '@/components/plyaz/ApplicationsInbox';
import { Team, Player, Match } from '@/lib/supabase/types';

export default function CoachDashboard() {
    const { profile } = useAuth();
    const { data: teams = [] } = useTeams();

    const team =
        (teams as Team[]).find((t) => t.manager_id === profile?.id) ?? (teams[0] as Team) ?? null;

    const { data: players = [] } = usePlayers(team?.id ?? '');
    const { data: allMatches = [] } = useMatches();

    const squadPlayers = players as Player[];
    const typedMatches = allMatches as Match[];

    const goalkeepers = squadPlayers.filter((p) => p.position === 'GK').length;
    const outfield = squadPlayers.filter((p) => p.position !== 'GK').length;

    const teamMatches = typedMatches.filter(
        (m) => m.home_team_id === team?.id || m.away_team_id === team?.id,
    );
    const completedMatches = teamMatches.filter((m) => m.status === 'completed').slice(-3);

    const topPerformers = [...squadPlayers]
        .filter((p) => p.stats)
        .sort((a, b) => b.stats.goals + b.stats.assists - (a.stats.goals + a.stats.assists))
        .slice(0, 3);

    const nextMatch =
        teamMatches.find((m) => m.status === 'upcoming' || m.status === 'scheduled') ?? null;

    return (
        <PageLayout title="COACH HUB">
            <PageHeader label="Coaching Dashboard" title={team?.name ?? 'Your Team'} />

            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
                {/* Team Overview Cards */}
                <motion.section variants={fadeUp} className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {[
                        { label: 'Squad Size', value: squadPlayers.length },
                        { label: 'Goalkeepers', value: goalkeepers },
                        { label: 'Outfield', value: outfield },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border-2 border-gray-100 bg-white p-5 text-center"
                        >
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                {stat.label}
                            </p>
                            <p className="text-3xl font-black tracking-tight text-gray-900">
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </motion.section>

                {/* Next Match */}
                <motion.section variants={fadeUp}>
                    <h2 className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                        Next Match
                        <div className="h-px flex-1 bg-gray-100" />
                    </h2>
                    {nextMatch ? (
                        <div className="rounded-3xl bg-gray-900 p-8 text-white">
                            <div className="mb-6 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                    {nextMatch.status.toUpperCase()}
                                </span>
                                {nextMatch.match_time && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                        {new Date(nextMatch.match_time).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-center gap-8">
                                <div className="text-center">
                                    <p className="text-2xl font-black tracking-tight">
                                        {team?.short_name ?? team?.name}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                                        Home
                                    </p>
                                </div>
                                <span className="text-4xl font-black text-white/10">VS</span>
                                <div className="text-center">
                                    <p className="text-2xl font-black tracking-tight">Opponent</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                                        Away
                                    </p>
                                </div>
                            </div>
                            {nextMatch.venue && (
                                <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-white/30">
                                    {nextMatch.venue}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-3xl bg-gray-900 p-8 text-center text-white">
                            <p className="text-sm font-bold uppercase tracking-widest text-white/40">
                                No upcoming match scheduled
                            </p>
                        </div>
                    )}
                </motion.section>

                {/* Two Column: Top Players + Recent Results */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Top Performers */}
                    <motion.section variants={fadeUp}>
                        <h2 className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                            Top Performers
                            <div className="h-px flex-1 bg-gray-100" />
                        </h2>
                        {topPerformers.length > 0 ? (
                            <div className="space-y-3">
                                {topPerformers.map((player) => (
                                    <div
                                        key={player.id}
                                        className="flex items-center gap-4 rounded-2xl border-2 border-gray-100 bg-white p-4 transition-colors hover:border-orange-200"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-sm font-black text-white">
                                            {player.jersey_number ?? '—'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold tracking-tight text-gray-900">
                                                {player.name}
                                            </p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                {player.position ?? '—'}
                                            </p>
                                        </div>
                                        <div className="flex gap-3 text-center">
                                            <div>
                                                <p className="text-lg font-black text-gray-900">
                                                    {player.stats.goals}
                                                </p>
                                                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                                                    Goals
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-gray-900">
                                                    {player.stats.assists}
                                                </p>
                                                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                                                    Assists
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border-2 border-gray-100 bg-white p-6 text-center">
                                <p className="text-sm font-bold text-gray-400">
                                    No player stats yet
                                </p>
                            </div>
                        )}
                    </motion.section>

                    {/* Recent Results */}
                    <motion.section variants={fadeUp}>
                        <h2 className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                            Recent Results
                            <div className="h-px flex-1 bg-gray-100" />
                        </h2>
                        {completedMatches.length > 0 ? (
                            <div className="space-y-3">
                                {completedMatches.map((match) => {
                                    const isHome = match.home_team_id === team?.id;
                                    const ourScore = isHome ? match.home_score : match.away_score;
                                    const theirScore = isHome ? match.away_score : match.home_score;
                                    const result =
                                        ourScore > theirScore
                                            ? 'W'
                                            : ourScore === theirScore
                                              ? 'D'
                                              : 'L';
                                    return (
                                        <div
                                            key={match.id}
                                            className="flex items-center gap-4 rounded-2xl border-2 border-gray-100 bg-white p-4"
                                        >
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ${
                                                    result === 'W'
                                                        ? 'bg-green-100 text-green-700'
                                                        : result === 'D'
                                                          ? 'bg-gray-100 text-gray-500'
                                                          : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {result}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold tracking-tight text-gray-900">
                                                    {isHome ? 'vs Away' : 'vs Home'}
                                                </p>
                                            </div>
                                            <p className="text-xl font-black tracking-tight text-gray-900">
                                                {ourScore}–{theirScore}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-2xl border-2 border-gray-100 bg-white p-6 text-center">
                                <p className="text-sm font-bold text-gray-400">No results yet</p>
                            </div>
                        )}
                    </motion.section>
                </div>

                {/* Recruitment Marketplace Controls */}
                <div className="grid gap-8 md:grid-cols-2">
                    <motion.section variants={fadeUp}>
                        <h2 className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                            Recruitment
                            <div className="h-px flex-1 bg-gray-100" />
                        </h2>
                        {team && (
                            <RecruitmentSettings
                                type="team"
                                id={team.id}
                                initialData={{
                                    is_recruiting: team.is_recruiting_players || false,
                                    recruitment_message: team.recruitment_message || '',
                                    needed_positions: team.needed_positions || [],
                                }}
                            />
                        )}
                    </motion.section>

                    <motion.section variants={fadeUp}>
                        <h2 className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                            Incoming Applications
                            <div className="h-px flex-1 bg-gray-100" />
                        </h2>
                        <ApplicationsInbox targetType="team" />
                    </motion.section>
                </div>

                {/* Quick Actions */}
                <motion.section variants={fadeUp} className="grid grid-cols-2 gap-4">
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => (window.location.href = '/league/coach/roster')}
                        className="h-16"
                    >
                        View Full Roster
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        fullWidth
                        onClick={() => (window.location.href = '/league/matches')}
                        className="h-16"
                    >
                        View Schedule
                    </Button>
                </motion.section>
            </motion.div>
        </PageLayout>
    );
}
