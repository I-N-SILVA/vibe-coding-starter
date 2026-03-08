'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCompetitions, useStandings } from '@/lib/hooks';
import {
    PageLayout,
    PageHeader,
    Card,
    CompetitionSelector,
    EmptyState,
    SkeletonTableRow,
    NavIcons,
} from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { cn } from '@/lib/utils';

type StandingsRow = {
    rank: number;
    team: string;
    shortName: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    gd: number;
    points: number;
    form: string[];
};

export default function AdminStandings() {
    const [selectedComp, setSelectedComp] = useState('');

    const { data: competitions = [], isLoading: competitionsLoading } = useCompetitions();
    const { data: fetchedStandings, isLoading: standingsLoading } = useStandings(selectedComp);

    // Set the first competition as default when loaded
    React.useEffect(() => {
        if (competitions.length > 0 && !selectedComp) {
            setSelectedComp(competitions[0].id);
        }
    }, [competitions, selectedComp]);

    const standings: StandingsRow[] = Array.isArray(fetchedStandings)
        ? (fetchedStandings as Array<{
            id: string;
            played: number;
            won: number;
            drawn: number;
            lost: number;
            goals_for: number;
            goals_against: number;
            goal_difference: number;
            points: number;
            form: string[];
            team?: { id: string; name: string; short_name: string };
          }>).map((entry, idx) => ({
            rank: idx + 1,
            team: entry.team?.name ?? '',
            shortName: entry.team?.short_name ?? '',
            played: entry.played,
            won: entry.won,
            drawn: entry.drawn,
            lost: entry.lost,
            gf: entry.goals_for,
            ga: entry.goals_against,
            gd: entry.goal_difference,
            points: entry.points,
            form: entry.form ?? [],
          }))
        : [];

    const isLoading = competitionsLoading || standingsLoading;

    if (!competitionsLoading && competitions.length === 0) {
        return (
            <PageLayout navItems={adminNavItems} title="STANDINGS">
                <PageHeader label="Competitions" title="Current Rankings" />
                <EmptyState
                    icon={<NavIcons.Standings />}
                    title="No Competitions"
                    description="Create a competition to start tracking standings."
                />
            </PageLayout>
        );
    }

    return (
        <PageLayout navItems={adminNavItems} title="STANDINGS">
            <PageHeader
                label="Competitions"
                title="Current Rankings"
                rightAction={
                    competitions.length > 0 ? (
                        <CompetitionSelector
                            competitions={competitions}
                            selected={selectedComp}
                            onChange={setSelectedComp}
                        />
                    ) : undefined
                }
            />

            {isLoading ? (
                <Card padding="md" className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 w-12 text-center">#</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Team</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">P</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">W</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">D</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">L</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center hidden sm:table-cell">GD</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-900 text-center bg-gray-100/50">Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <SkeletonTableRow key={i} />
                            ))}
                        </tbody>
                    </table>
                    </div>
                </Card>
            ) : standings.length === 0 ? (
                <EmptyState
                    icon={<NavIcons.Standings />}
                    title="No Standings Available"
                    description="Standings will appear here once matches have been played in this competition."
                />
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card padding="md" className="overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 w-12 text-center">#</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Team</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">P</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">W</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">D</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">L</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center hidden md:table-cell">GF</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center hidden md:table-cell">GA</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center hidden sm:table-cell">GD</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-900 text-center bg-gray-100/50">Pts</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center hidden lg:table-cell">Form</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map((row, idx) => (
                                        <motion.tr
                                            key={`${row.team}-${row.rank}`}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.04, duration: 0.3 }}
                                            className={cn(
                                                'border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors',
                                                row.rank <= 3 && 'border-l-2 border-l-orange-500'
                                            )}
                                        >
                                            <td className="px-4 py-5 text-sm font-bold text-gray-400 text-center">{row.rank}</td>
                                            <td className="px-4 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white">
                                                        {row.shortName}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-900 tracking-tight">{row.team}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 text-sm text-center text-gray-600 tabular-nums">{row.played}</td>
                                            <td className="px-4 py-5 text-sm text-center text-gray-600 tabular-nums">{row.won}</td>
                                            <td className="px-4 py-5 text-sm text-center text-gray-600 tabular-nums">{row.drawn}</td>
                                            <td className="px-4 py-5 text-sm text-center text-gray-600 tabular-nums">{row.lost}</td>
                                            <td className="px-4 py-5 text-sm text-center text-gray-600 tabular-nums hidden md:table-cell">{row.gf}</td>
                                            <td className="px-4 py-5 text-sm text-center text-gray-600 tabular-nums hidden md:table-cell">{row.ga}</td>
                                            <td className={cn(
                                                'px-4 py-5 text-sm text-center tabular-nums hidden sm:table-cell',
                                                row.gd > 0 ? 'text-green-600' : row.gd < 0 ? 'text-red-600' : 'text-gray-400'
                                            )}>
                                                {row.gd > 0 ? `+${row.gd}` : row.gd}
                                            </td>
                                            <td className="px-4 py-5 text-sm font-bold text-center text-gray-900 tabular-nums bg-gray-50/30">
                                                {row.points}
                                            </td>
                                            <td className="px-4 py-5 hidden lg:table-cell">
                                                <div className="flex items-center justify-center gap-1">
                                                    {row.form?.map((res, i) => (
                                                        <span
                                                            key={i}
                                                            className={cn(
                                                                'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold',
                                                                res === 'W' ? 'bg-gray-900 text-white' :
                                                                res === 'D' ? 'bg-gray-200 text-gray-600' :
                                                                'border border-gray-200 text-gray-400'
                                                            )}
                                                        >
                                                            {res}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                            P: Played &bull; W: Won &bull; D: Drawn &bull; L: Lost &bull; GF: Goals For &bull; GA: Goals Against &bull; GD: Goal Difference &bull; Pts: Points
                        </p>
                    </div>
                </motion.div>
            )}
        </PageLayout>
    );
}
