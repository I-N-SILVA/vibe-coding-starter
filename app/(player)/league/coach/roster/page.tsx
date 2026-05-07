'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageLayout, PageHeader, Badge } from '@/components/plyaz';
import { stagger, fadeUp } from '@/lib/animations';
import { useTeams, useAllPlayers } from '@/lib/hooks';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Player } from '@/lib/supabase/types';
import type { Team } from '@/lib/supabase/types';

// The DB uses detailed positions; we bucket them into display groups
type DisplayPosition = 'GK' | 'DF' | 'MF' | 'FW';

const positionOrder: DisplayPosition[] = ['GK', 'DF', 'MF', 'FW'];
const positionLabels: Record<DisplayPosition, string> = {
    GK: 'Goalkeepers',
    DF: 'Defenders',
    MF: 'Midfielders',
    FW: 'Forwards',
};
const positionColors: Record<DisplayPosition, string> = {
    GK: 'bg-yellow-100 text-yellow-700',
    DF: 'bg-blue-100 text-blue-700',
    MF: 'bg-green-100 text-green-700',
    FW: 'bg-red-100 text-red-700',
};

/** Map the detailed DB position to a 2-letter display group */
function toDisplayPosition(pos: Player['position']): DisplayPosition {
    if (!pos) return 'MF';
    if (pos === 'GK') return 'GK';
    if (['CB', 'LB', 'RB'].includes(pos)) return 'DF';
    if (['CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'].includes(pos)) return 'MF';
    if (['ST', 'CF'].includes(pos)) return 'FW';
    return 'MF';
}

/** Map DB player status to a display-friendly status key */
function toDisplayStatus(status: Player['status']): 'fit' | 'injured' | 'suspended' {
    if (status === 'injured') return 'injured';
    if (status === 'suspended') return 'suspended';
    return 'fit';
}

const statusConfig: Record<'fit' | 'injured' | 'suspended', { label: string; color: string }> = {
    fit: { label: 'Fit', color: 'bg-green-100 text-green-700 border-green-200' },
    injured: { label: 'Injured', color: 'bg-red-100 text-red-700 border-red-200' },
    suspended: { label: 'Suspended', color: 'bg-orange-100 text-orange-700 border-orange-200' },
};

/** Calculate age from date_of_birth string */
function calcAge(dob: string | null | undefined): number | null {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

export default function CoachRosterPage() {
    const [filter, setFilter] = useState<DisplayPosition | 'all'>('all');
    const [search, setSearch] = useState('');

    const { profile } = useAuth();
    const { data: teams = [] } = useTeams();

    // Find the team managed by this coach (matching manager_id to profile id, fallback to first team)
    const managedTeam =
        (teams as Team[]).find((t) => t.manager_id === profile?.id) ??
        (teams[0] as Team | undefined);

    // Fetch all org players then filter to the managed team if one is found
    const { data: allPlayers = [], isLoading } = useAllPlayers();
    const players: Player[] = managedTeam
        ? allPlayers.filter((p) => p.team_id === managedTeam.id)
        : allPlayers;

    const filteredPlayers = players.filter((p) => {
        const displayPos = toDisplayPosition(p.position);
        const matchesPosition = filter === 'all' || displayPos === filter;
        const matchesSearch = (p.name ?? '').toLowerCase().includes(search.toLowerCase());
        return matchesPosition && matchesSearch;
    });

    const grouped = positionOrder
        .map((pos) => ({
            position: pos,
            label: positionLabels[pos],
            players: filteredPlayers.filter((p) => toDisplayPosition(p.position) === pos),
        }))
        .filter((g) => g.players.length > 0);

    const fitCount = players.filter((p) => toDisplayStatus(p.status) === 'fit').length;
    const injuredCount = players.filter((p) => p.status === 'injured').length;
    const suspendedCount = players.filter((p) => p.status === 'suspended').length;

    return (
        <PageLayout title="SQUAD">
            <PageHeader label="Team Management" title="Full Roster" />

            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
                {/* Summary Stats */}
                <motion.section variants={fadeUp} className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Total', value: players.length, color: 'text-gray-900' },
                        { label: 'Available', value: fitCount, color: 'text-green-600' },
                        { label: 'Injured', value: injuredCount, color: 'text-red-600' },
                        { label: 'Suspended', value: suspendedCount, color: 'text-orange-600' },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border-2 border-gray-100 bg-white p-4 text-center"
                        >
                            <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                {stat.label}
                            </p>
                            <p className={`text-2xl font-black tracking-tight ${stat.color}`}>
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </motion.section>

                {/* Search & Filter */}
                <motion.section variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 rounded-xl border-2 border-gray-100 px-4 py-3 text-sm font-medium transition-colors focus:border-gray-900 focus:outline-none"
                    />
                    <div className="flex gap-2">
                        {(['all', ...positionOrder] as const).map((pos) => (
                            <button
                                key={pos}
                                onClick={() => setFilter(pos)}
                                className={`rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filter === pos
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                }`}
                            >
                                {pos === 'all' ? 'All' : pos}
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* Loading state */}
                {isLoading && (
                    <motion.section variants={fadeUp} className="py-16 text-center">
                        <p className="text-sm font-medium text-gray-400">Loading roster…</p>
                    </motion.section>
                )}

                {/* Empty state */}
                {!isLoading && players.length === 0 && (
                    <motion.section variants={fadeUp} className="py-16 text-center">
                        <p className="text-sm font-medium text-gray-400">
                            No players found for this team.
                        </p>
                    </motion.section>
                )}

                {/* Player Groups */}
                {!isLoading &&
                    grouped.map((group) => (
                        <motion.section key={group.position} variants={fadeUp}>
                            <h2 className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                                {group.label} ({group.players.length})
                                <div className="h-px flex-1 bg-gray-100" />
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.players.map((player) => {
                                    const displayPos = toDisplayPosition(player.position);
                                    const displayStatus = toDisplayStatus(player.status);
                                    const age = calcAge(player.date_of_birth);
                                    const goals = (player.stats as { goals?: number })?.goals ?? 0;
                                    const appearances =
                                        (player.stats as { appearances?: number })?.appearances ??
                                        0;
                                    return (
                                        <div
                                            key={player.id}
                                            className="flex items-center gap-4 rounded-2xl border-2 border-gray-100 bg-white p-4 transition-colors hover:border-gray-200"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-base font-black text-white">
                                                {player.jersey_number ?? '—'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold tracking-tight text-gray-900">
                                                    {player.name}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span
                                                        className={`rounded-md px-2 py-0.5 text-[9px] font-black ${positionColors[displayPos]}`}
                                                    >
                                                        {displayPos}
                                                    </span>
                                                    {age !== null && (
                                                        <span className="text-[10px] font-medium text-gray-400">
                                                            Age {age}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[8px] ${statusConfig[displayStatus].color} border`}
                                                >
                                                    {statusConfig[displayStatus].label}
                                                </Badge>
                                                <p className="mt-1 text-[9px] font-medium text-gray-400">
                                                    {appearances} apps · {goals} gls
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.section>
                    ))}
            </motion.div>
        </PageLayout>
    );
}
