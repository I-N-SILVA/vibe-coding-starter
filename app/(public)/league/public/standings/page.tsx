'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout, PageHeader, Card, KnockoutBracket } from '@/components/plyaz';
import { cn } from '@/lib/utils';
import { Trophy, LayoutGrid, List } from 'lucide-react';

type StandingsRow = {
    id: string;
    team_id: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
    points: number;
    form: string[];
    team: {
        id: string;
        name: string;
        short_name: string | null;
        logo_url: string | null;
        primary_color: string | null;
    } | null;
};

export default function PublicStandings() {
    const searchParams = useSearchParams();
    const competitionId = searchParams.get('competitionId');
    const [format, setFormat] = useState<'league' | 'knockout'>('league');
    const [standings, setStandings] = useState<StandingsRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Determine competition format
    useEffect(() => {
        if (!competitionId) {
            setFormat('league');
            return;
        }
        async function fetchCompetition() {
            try {
                const res = await fetch(`/api/league/public/competitions`);
                if (res.ok) {
                    const data: Array<{ id: string; type: string }> = await res.json();
                    const comp = data.find((c) => c.id === competitionId);
                    if (comp?.type === 'knockout' || comp?.type === 'group_knockout')
                        setFormat('knockout');
                    else setFormat('league');
                }
            } catch (err) {
                console.error('Failed to fetch format', err);
            }
        }
        fetchCompetition();
    }, [competitionId]);

    // Fetch real standings from the public standings API
    useEffect(() => {
        if (!competitionId) {
            setStandings([]);
            return;
        }
        setIsLoading(true);
        fetch(`/api/league/public/standings?competitionId=${competitionId}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((data: StandingsRow[]) => setStandings(Array.isArray(data) ? data : []))
            .catch(() => setStandings([]))
            .finally(() => setIsLoading(false));
    }, [competitionId]);

    return (
        <PageLayout title="PLYAZ PULSE">
            <PageHeader
                label={format === 'league' ? 'League Table' : 'Tournament Bracket'}
                title="Pulse Rankings"
            />

            <div className="mb-8 flex w-fit items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-100/50 p-1 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                <button
                    onClick={() => setFormat('league')}
                    data-testid="standings-table-btn"
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest transition-all',
                        format === 'league'
                            ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                            : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300',
                    )}
                >
                    <List className="h-4 w-4" />
                    Table
                </button>
                <button
                    onClick={() => setFormat('knockout')}
                    data-testid="standings-bracket-btn"
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest transition-all',
                        format === 'knockout'
                            ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                            : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300',
                    )}
                >
                    <LayoutGrid className="h-4 w-4" />
                    Bracket
                </button>
            </div>

            <AnimatePresence mode="wait">
                {format === 'league' ? (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isLoading ? (
                            <Card className="overflow-hidden border-neutral-100 !p-0 dark:border-neutral-700/50">
                                <div className="p-12 text-center text-sm text-neutral-400 dark:text-neutral-500">
                                    Loading standings…
                                </div>
                            </Card>
                        ) : standings.length === 0 ? (
                            <Card className="overflow-hidden border-neutral-100 !p-0 dark:border-neutral-700/50">
                                <div className="p-12 text-center text-sm text-neutral-400 dark:text-neutral-500">
                                    {competitionId
                                        ? 'No standings yet — matches are in progress.'
                                        : 'Select a competition to view standings.'}
                                </div>
                            </Card>
                        ) : (
                            <Card
                                className="overflow-hidden border-neutral-100 !p-0 dark:border-neutral-700/50"
                                data-testid="standings-table"
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-left">
                                        <thead>
                                            <tr className="border-b border-neutral-50 bg-neutral-50/30 dark:border-neutral-700/50 dark:bg-neutral-800/30">
                                                <th className="w-12 px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                                                    #
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                                                    Team
                                                </th>
                                                <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                                                    P
                                                </th>
                                                <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                                                    W
                                                </th>
                                                <th className="bg-orange-50/50 px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:bg-orange-500/5 dark:text-white">
                                                    Pts
                                                </th>
                                                <th className="hidden px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 lg:table-cell">
                                                    Form
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {standings.map((row, idx) => (
                                                <motion.tr
                                                    key={row.team_id}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{
                                                        delay: idx * 0.04,
                                                        duration: 0.3,
                                                    }}
                                                    data-testid={`standings-row-${idx}`}
                                                    className={cn(
                                                        'group border-b border-neutral-50 transition-colors last:border-0 hover:bg-orange-50/10 dark:border-neutral-800/50 dark:hover:bg-orange-500/5',
                                                        idx < 2 && 'border-l-2 border-l-orange-500',
                                                    )}
                                                >
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="text-sm font-black tabular-nums text-neutral-900 dark:text-white">
                                                            {idx + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent bg-neutral-50 text-[10px] font-black text-neutral-400 transition-all group-hover:border-neutral-100 group-hover:bg-white dark:bg-neutral-800 dark:text-neutral-500 dark:group-hover:border-neutral-600 dark:group-hover:bg-neutral-700">
                                                                {row.team?.short_name ?? '?'}
                                                            </div>
                                                            <span className="text-sm font-black uppercase tracking-tight text-neutral-900 dark:text-white">
                                                                {row.team?.name ?? 'Unknown'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-5 text-center text-sm font-bold tabular-nums text-neutral-500 dark:text-neutral-400">
                                                        {row.played}
                                                    </td>
                                                    <td className="px-4 py-5 text-center text-sm font-bold tabular-nums text-neutral-500 dark:text-neutral-400">
                                                        {row.won}
                                                    </td>
                                                    <td className="bg-orange-50/20 px-4 py-5 text-center text-sm font-black tabular-nums text-neutral-900 dark:bg-orange-500/5 dark:text-white">
                                                        {row.points}
                                                    </td>
                                                    <td className="hidden px-6 py-5 lg:table-cell">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {(row.form ?? []).map(
                                                                (res: string, i: number) => (
                                                                    <span
                                                                        key={i}
                                                                        className={cn(
                                                                            'flex h-6 w-6 items-center justify-center rounded-lg border-2 text-[9px] font-black transition-all',
                                                                            res === 'W'
                                                                                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                                                                                : res === 'D'
                                                                                  ? 'border-neutral-100 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                                                                                  : 'border-neutral-100 bg-white text-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-600',
                                                                        )}
                                                                    >
                                                                        {res}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="bracket"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="relative min-h-[600px] overflow-hidden rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-700/50 dark:bg-neutral-800/50">
                            <div className="absolute right-0 top-0 p-8 opacity-5">
                                <Trophy className="h-64 w-64 rotate-12" />
                            </div>
                            <KnockoutBracket rounds={[]} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="group mt-12">
                <div
                    className="relative flex items-center justify-between overflow-hidden rounded-2xl bg-neutral-900 p-6 text-white dark:bg-neutral-800"
                    data-testid="live-updates-banner"
                >
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                                Live Updates
                            </div>
                            <div className="text-sm font-black tracking-tight">
                                Real-time standings are active for{' '}
                                {competitionId ? 'this league' : 'all leagues'}.
                            </div>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 flex h-full items-center pr-8 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Pulse Logic Engine v1.0
                        </span>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
