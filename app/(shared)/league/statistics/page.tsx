'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { PageLayout, PageHeader, Card, TabPills } from '@/components/plyaz';
import { PlayerCard } from '@/components/plyaz/cards/PlayerCard';
import { cn } from '@/lib/utils';
import { useCompetitions } from '@/lib/hooks';

const TABS = [
    { label: 'Top Scorers', value: 'goals' },
    { label: 'Most Assists', value: 'assists' },
    { label: 'Discipline', value: 'cards' },
];

const RANK_COLORS = [
    'bg-yellow-400 text-yellow-900',
    'bg-gray-300 text-gray-700',
    'bg-orange-400 text-orange-900',
];

type PlayerStat = {
    player_id: string;
    full_name: string;
    position: string | null;
    avatar_url: string | null;
    jersey_number: number | null;
    nationality: string | null;
    team_id: string | null;
    goals: number;
    assists: number;
    yellow_cards: number;
    red_cards: number;
    games_played: number;
};

function getStatValue(player: PlayerStat, type: string): number {
    if (type === 'assists') return player.assists;
    if (type === 'cards') return player.yellow_cards;
    return player.goals;
}

function getStatLabel(type: string): string {
    if (type === 'assists') return 'A';
    if (type === 'cards') return 'YC';
    return 'G';
}

export default function StatisticsPage() {
    const [statType, setStatType] = useState('goals');
    const [selectedComp, setSelectedComp] = useState('all');

    const { data: competitions } = useCompetitions();

    const statsUrl = `/api/league/player-stats?type=${statType}${selectedComp !== 'all' ? `&competitionId=${selectedComp}` : ''}`;

    const { data: players, isLoading } = useQuery<PlayerStat[]>({
        queryKey: ['player-stats', statType, selectedComp],
        queryFn: async () => {
            const res = await fetch(statsUrl);
            if (!res.ok) throw new Error('Failed to fetch stats');
            return res.json() as Promise<PlayerStat[]>;
        },
    });

    const featured = players?.slice(0, 3) ?? [];
    const all = players ?? [];

    return (
        <PageLayout title="Statistics">
            <PageHeader label="Player Performance" title="Leaderboards" />

            {/* Competition Filter */}
            {competitions && competitions.length > 1 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedComp('all')}
                        className={cn(
                            'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                            selectedComp === 'all'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                        )}
                    >
                        All Competitions
                    </button>
                    {competitions.map((comp) => (
                        <button
                            key={comp.id}
                            onClick={() => setSelectedComp(comp.id)}
                            className={cn(
                                'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                                selectedComp === comp.id
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                            )}
                        >
                            {comp.name}
                        </button>
                    ))}
                </div>
            )}

            <TabPills tabs={TABS} activeTab={statType} onChange={setStatType} className="mb-8" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${statType}-${selectedComp}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 gap-8 md:grid-cols-2"
                >
                    {/* Top 3 Featured */}
                    <div className="space-y-4">
                        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-900">
                            Featured Players
                        </h2>

                        {isLoading && (
                            <div className="space-y-4">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="h-20 animate-pulse rounded-xl bg-gray-100"
                                    />
                                ))}
                            </div>
                        )}

                        {!isLoading && featured.length === 0 && (
                            <p className="text-sm text-gray-400">No stats recorded yet.</p>
                        )}

                        {!isLoading && (
                            <div className="grid gap-4">
                                {featured.map((player, index) => (
                                    <div key={player.player_id} className="relative">
                                        <div
                                            className={cn(
                                                'absolute -left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-bold shadow-sm',
                                                RANK_COLORS[index],
                                            )}
                                        >
                                            {index + 1}
                                        </div>
                                        <div
                                            className="ml-4 cursor-pointer"
                                            onClick={() =>
                                                (window.location.href = `/league/public/players/${player.player_id}`)
                                            }
                                        >
                                            <PlayerCard
                                                name={player.full_name}
                                                position={player.position ?? 'Player'}
                                                number={player.jersey_number ?? index + 1}
                                                stats={{
                                                    goals: player.goals,
                                                    assists: player.assists,
                                                    appearances: player.games_played,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Full Table */}
                    <div className="space-y-4">
                        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-900">
                            All Players
                        </h2>
                        <Card padding="sm" className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="w-8 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                #
                                            </th>
                                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                Player
                                            </th>
                                            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                {getStatLabel(statType)}
                                            </th>
                                            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                GP
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {isLoading && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-8 text-center text-sm text-gray-400"
                                                >
                                                    Loading...
                                                </td>
                                            </tr>
                                        )}
                                        {!isLoading && all.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-8 text-center text-sm text-gray-400"
                                                >
                                                    No data available.
                                                </td>
                                            </tr>
                                        )}
                                        {!isLoading &&
                                            all.map((player, index) => (
                                                <tr
                                                    key={player.player_id}
                                                    className="cursor-pointer transition-colors hover:bg-gray-50/50"
                                                    onClick={() =>
                                                        (window.location.href = `/league/public/players/${player.player_id}`)
                                                    }
                                                >
                                                    <td className="px-4 py-4 text-xs font-bold text-gray-400">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="mb-1 text-sm font-bold leading-none text-gray-900">
                                                            {player.full_name}
                                                        </p>
                                                        <p className="text-[10px] font-medium uppercase text-gray-400">
                                                            {player.position ?? '—'}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4 text-center text-sm font-bold text-gray-900">
                                                        {getStatValue(player, statType)}
                                                    </td>
                                                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                                                        {player.games_played}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </motion.div>
            </AnimatePresence>
        </PageLayout>
    );
}
