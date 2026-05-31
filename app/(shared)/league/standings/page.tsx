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
import { cn } from '@/lib/utils';
import { mapStandingsToUI } from '@/lib/mappers';

type StandingsRow = {
    rank: number;
    teamId: string;
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

    // Prefer the first active competition as default; fall back to competitions[0]
    React.useEffect(() => {
        if (competitions.length > 0 && !selectedComp) {
            const active = competitions.find((c) => c.status === 'active');
            setSelectedComp((active ?? competitions[0]).id);
        }
    }, [competitions, selectedComp]);

    const standings: StandingsRow[] = Array.isArray(fetchedStandings)
        ? fetchedStandings.map(mapStandingsToUI).map((entry, idx) => ({
              rank: idx + 1,
              teamId: entry.teamId,
              team: entry.team?.name ?? '',
              shortName: entry.team?.shortName ?? '',
              played: entry.played,
              won: entry.won,
              drawn: entry.drawn,
              lost: entry.lost,
              gf: entry.goalsFor,
              ga: entry.goalsAgainst,
              gd: entry.goalDifference,
              points: entry.points,
              form: entry.form ?? [],
          }))
        : [];

    const isLoading = competitionsLoading || standingsLoading;

    return (
        <PageLayout title="STANDINGS">
            <PageHeader
                label="Competition"
                title="League Table"
                description="Real-time standings and performance data"
            />

            <div className="mb-8">
                <CompetitionSelector
                    competitions={competitions}
                    selected={selectedComp}
                    onChange={setSelectedComp}
                />
            </div>

            {isLoading ? (
                <Card padding="sm" className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
                                    <th className="w-12 px-4 py-4" />
                                    <th className="px-4 py-4">Team</th>
                                    <th className="px-4 py-4 text-center">P</th>
                                    <th className="px-4 py-4 text-center">W</th>
                                    <th className="px-4 py-4 text-center">D</th>
                                    <th className="px-4 py-4 text-center">L</th>
                                    <th className="px-4 py-4 text-center">Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <SkeletonTableRow key={i} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : standings.length === 0 ? (
                <EmptyState
                    icon={<NavIcons.Standings />}
                    title="No Standings Data"
                    description={
                        selectedComp
                            ? 'No matches have been played in this competition yet.'
                            : 'Select a competition to view the league table.'
                    }
                />
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card padding="sm" className="overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50/50 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <th className="w-12 px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            #
                                        </th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            Team
                                        </th>
                                        <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            P
                                        </th>
                                        <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            W
                                        </th>
                                        <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            D
                                        </th>
                                        <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            L
                                        </th>
                                        <th className="hidden px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:table-cell">
                                            GF
                                        </th>
                                        <th className="hidden px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:table-cell">
                                            GA
                                        </th>
                                        <th className="hidden px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:table-cell">
                                            GD
                                        </th>
                                        <th className="bg-primary/5 px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-foreground">
                                            Pts
                                        </th>
                                        <th className="hidden px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground lg:table-cell">
                                            Form
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map((row, idx) => {
                                        const isPromotion = row.rank <= 2;
                                        const isRelegation =
                                            row.rank > standings.length - 2 && standings.length > 4;

                                        return (
                                            <motion.tr
                                                key={row.teamId}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.04, duration: 0.3 }}
                                                className={cn(
                                                    'hover:bg-primary/[0.02] relative border-b border-neutral-100 transition-all duration-500 last:border-0 dark:border-neutral-800',
                                                    isPromotion &&
                                                        'border-l-4 border-l-emerald-500 bg-emerald-500/[0.03] shadow-[inset_10px_0_20px_-10px_rgba(16,185,129,0.1)]',
                                                    isRelegation &&
                                                        'border-l-4 border-l-rose-500 bg-rose-500/[0.03] shadow-[inset_10px_0_20px_-10px_rgba(244,63,94,0.1)]',
                                                    !isPromotion &&
                                                        !isRelegation &&
                                                        row.rank <= 3 &&
                                                        'border-l-primary border-l-2',
                                                )}
                                            >
                                                <td className="px-4 py-5 text-center text-sm font-bold text-muted-foreground">
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span>{row.rank}</span>
                                                        {isPromotion && (
                                                            <div className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
                                                        )}
                                                        {isRelegation && (
                                                            <div className="h-1 w-1 animate-pulse rounded-full bg-rose-500" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={cn(
                                                                'flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white transition-transform group-hover:scale-110',
                                                                isPromotion
                                                                    ? 'bg-emerald-600 shadow-lg shadow-emerald-500/20'
                                                                    : isRelegation
                                                                      ? 'bg-rose-600 shadow-lg shadow-rose-500/20'
                                                                      : 'bg-slate-900 dark:bg-white dark:text-slate-900',
                                                            )}
                                                        >
                                                            {row.shortName}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold tracking-tight text-foreground">
                                                                {row.team}
                                                            </span>
                                                            {isPromotion && (
                                                                <span className="text-[7px] font-black uppercase tracking-widest text-emerald-600">
                                                                    Promotion Zone
                                                                </span>
                                                            )}
                                                            {isRelegation && (
                                                                <span className="text-[7px] font-black uppercase tracking-widest text-rose-600">
                                                                    Relegation Zone
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-center text-sm tabular-nums text-muted-foreground">
                                                    {row.played}
                                                </td>
                                                <td className="px-4 py-5 text-center text-sm tabular-nums text-muted-foreground">
                                                    {row.won}
                                                </td>
                                                <td className="px-4 py-5 text-center text-sm tabular-nums text-muted-foreground">
                                                    {row.drawn}
                                                </td>
                                                <td className="px-4 py-5 text-center text-sm tabular-nums text-muted-foreground">
                                                    {row.lost}
                                                </td>
                                                <td className="hidden px-4 py-5 text-center text-sm tabular-nums text-muted-foreground md:table-cell">
                                                    {row.gf}
                                                </td>
                                                <td className="hidden px-4 py-5 text-center text-sm tabular-nums text-muted-foreground md:table-cell">
                                                    {row.ga}
                                                </td>
                                                <td
                                                    className={cn(
                                                        'hidden px-4 py-5 text-center text-sm tabular-nums sm:table-cell',
                                                        row.gd > 0
                                                            ? 'text-emerald-500'
                                                            : row.gd < 0
                                                              ? 'text-rose-500'
                                                              : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                                                </td>
                                                <td className="bg-primary/[0.03] px-4 py-5 text-center text-sm font-black tabular-nums text-foreground">
                                                    {row.points}
                                                </td>
                                                <td className="hidden px-4 py-5 lg:table-cell">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {row.form?.map((res, i) => (
                                                            <span
                                                                key={i}
                                                                className={cn(
                                                                    'flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-white',
                                                                    res === 'W'
                                                                        ? 'bg-emerald-500'
                                                                        : res === 'D'
                                                                          ? 'bg-amber-500'
                                                                          : 'bg-rose-500',
                                                                )}
                                                            >
                                                                {res}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <div className="mt-8 rounded-lg border border-gray-100 bg-gray-50 p-4">
                        <p className="text-[10px] uppercase leading-relaxed tracking-widest text-gray-400">
                            P: Played &bull; W: Won &bull; D: Drawn &bull; L: Lost &bull; GF: Goals
                            For &bull; GA: Goals Against &bull; GD: Goal Difference &bull; Pts:
                            Points
                        </p>
                    </div>
                </motion.div>
            )}
        </PageLayout>
    );
}
