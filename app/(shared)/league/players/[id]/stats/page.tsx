'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    PageHeader,
    EmptyState,
    NavIcons,
} from '@/components/plyaz';
import { PageLayout } from '@/components/plyaz/navigation/PageLayout';
import { adminNavItems } from '@/lib/constants/navigation';
import { stagger, fadeUp } from '@/lib/animations';
import { usePlayerCareerStats } from '@/lib/hooks';

type ApiPlayerStat = {
    id: string;
    competition_id: string;
    team_id: string;
    games_played: number;
    goals: number;
    assists: number;
    yellow_cards: number;
    red_cards: number;
    minutes_played: number;
    clean_sheets: number;
    saves: number;
    goals_conceded: number;
    penalties_saved: number;
    competition?: { name: string };
};

export default function PlayerStatsPage() {
    const { id: playerId } = useParams<{ id: string }>();
    const { data: stats = [], isLoading } = usePlayerCareerStats(playerId);

    const statList: ApiPlayerStat[] = Array.isArray(stats) ? (stats as unknown as ApiPlayerStat[]) : [];

    const totals = statList.reduce(
        (acc, s) => ({
            gamesPlayed: acc.gamesPlayed + s.games_played,
            goals: acc.goals + s.goals,
            assists: acc.assists + s.assists,
            yellowCards: acc.yellowCards + s.yellow_cards,
            redCards: acc.redCards + s.red_cards,
            minutesPlayed: acc.minutesPlayed + s.minutes_played,
            cleanSheets: acc.cleanSheets + s.clean_sheets,
            saves: acc.saves + s.saves,
        }),
        { gamesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, cleanSheets: 0, saves: 0 }
    );

    const isGoalkeeper = statList.some((s) => s.clean_sheets > 0 || s.saves > 0);

    if (isLoading) {
        return (
            <PageLayout navItems={adminNavItems} title="Player Stats">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-100 rounded w-1/3" />
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-gray-100 rounded" />
                        ))}
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout navItems={adminNavItems} title="Player Stats">
            <div className="space-y-6">
                <PageHeader
                    label="Statistics"
                    title="Career Stats"
                    description={`${statList.length} competition${statList.length !== 1 ? 's' : ''}`}
                />

                {/* Career Totals */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                    {[
                        { label: 'Games', value: totals.gamesPlayed },
                        { label: 'Goals', value: totals.goals },
                        { label: 'Assists', value: totals.assists },
                        { label: 'Minutes', value: totals.minutesPlayed },
                        { label: 'Yellow Cards', value: totals.yellowCards },
                        { label: 'Red Cards', value: totals.redCards },
                        ...(isGoalkeeper
                            ? [
                                  { label: 'Clean Sheets', value: totals.cleanSheets },
                                  { label: 'Saves', value: totals.saves },
                              ]
                            : []),
                    ].map((stat) => (
                        <motion.div key={stat.label} variants={fadeUp}>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-black">{stat.value}</p>
                                    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mt-1">
                                        {stat.label}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Per-Competition Breakdown */}
                <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gray-400">
                    Per Competition
                </h2>

                {statList.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-2 px-3 text-[10px] font-bold tracking-widest uppercase text-gray-400">
                                        Competition
                                    </th>
                                    <th className="text-center py-2 px-2 text-[10px] font-bold tracking-widest uppercase text-gray-400">GP</th>
                                    <th className="text-center py-2 px-2 text-[10px] font-bold tracking-widest uppercase text-gray-400">G</th>
                                    <th className="text-center py-2 px-2 text-[10px] font-bold tracking-widest uppercase text-gray-400">A</th>
                                    <th className="text-center py-2 px-2 text-[10px] font-bold tracking-widest uppercase text-gray-400">YC</th>
                                    <th className="text-center py-2 px-2 text-[10px] font-bold tracking-widest uppercase text-gray-400">RC</th>
                                    <th className="text-center py-2 px-2 text-[10px] font-bold tracking-widest uppercase text-gray-400">MIN</th>
                                    {isGoalkeeper && (
                                        <>
                                            <th className="text-center py-2 px-2 text-[10px] font-bold tracking-widest uppercase text-gray-400">CS</th>
                                            <th className="text-center py-2 px-2 text-[10px] font-bold tracking-widest uppercase text-gray-400">SV</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {statList.map((s) => (
                                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-2 px-3 font-medium">{s.competition?.name || s.competition_id.slice(0, 8)}</td>
                                        <td className="text-center py-2 px-2">{s.games_played}</td>
                                        <td className="text-center py-2 px-2 font-bold">{s.goals}</td>
                                        <td className="text-center py-2 px-2">{s.assists}</td>
                                        <td className="text-center py-2 px-2 text-yellow-600">{s.yellow_cards}</td>
                                        <td className="text-center py-2 px-2 text-red-600">{s.red_cards}</td>
                                        <td className="text-center py-2 px-2 text-gray-500">{s.minutes_played}</td>
                                        {isGoalkeeper && (
                                            <>
                                                <td className="text-center py-2 px-2">{s.clean_sheets}</td>
                                                <td className="text-center py-2 px-2">{s.saves}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        icon={<NavIcons.Statistics />}
                        title="No Statistics"
                        description="This player has no competition statistics yet."
                    />
                )}
            </div>
        </PageLayout>
    );
}
