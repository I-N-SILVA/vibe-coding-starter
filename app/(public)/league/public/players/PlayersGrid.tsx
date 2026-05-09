'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageLayout, PageHeader, Card, CardContent, Badge } from '@/components/plyaz';
import { stagger, fadeUp } from '@/lib/animations';

interface PublicPlayer {
    id: string;
    name: string;
    position: string | null;
    jersey_number: number | null;
    team_name: string | null;
    nationality: string | null;
}

interface PlayersGridProps {
    players: PublicPlayer[];
}

const POSITIONS = ['All', 'GK', 'DF', 'MF', 'FW'] as const;
type PositionFilter = (typeof POSITIONS)[number];

const POSITION_COLORS: Record<string, string> = {
    GK: 'bg-yellow-100 text-yellow-700',
    DF: 'bg-blue-100 text-blue-700',
    MF: 'bg-green-100 text-green-700',
    FW: 'bg-orange-100 text-orange-700',
};

function mapPosition(pos: string | null): PositionFilter {
    if (!pos) return 'All';
    const upper = pos.toUpperCase();
    if (upper === 'GK' || upper === 'GOALKEEPER') return 'GK';
    if (
        upper === 'DF' ||
        upper === 'DEFENDER' ||
        upper === 'CB' ||
        upper === 'LB' ||
        upper === 'RB'
    )
        return 'DF';
    if (
        upper === 'MF' ||
        upper === 'MIDFIELDER' ||
        upper === 'CM' ||
        upper === 'LM' ||
        upper === 'RM' ||
        upper === 'CAM' ||
        upper === 'CDM'
    )
        return 'MF';
    if (
        upper === 'FW' ||
        upper === 'FORWARD' ||
        upper === 'ST' ||
        upper === 'CF' ||
        upper === 'LW' ||
        upper === 'RW'
    )
        return 'FW';
    return 'All';
}

export default function PlayersGrid({ players }: PlayersGridProps) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [positionFilter, setPositionFilter] = useState<PositionFilter>('All');

    const filtered = useMemo(() => {
        return players.filter((p) => {
            const matchesSearch =
                !search ||
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                (p.nationality ?? '').toLowerCase().includes(search.toLowerCase());
            const mappedPos = mapPosition(p.position);
            const matchesPosition = positionFilter === 'All' || mappedPos === positionFilter;
            return matchesSearch && matchesPosition;
        });
    }, [players, search, positionFilter]);

    return (
        <PageLayout title="PLYAZ PLAYERS">
            <PageHeader
                label="Player Directory"
                title="All Players"
                description="Browse all registered players competing in the league."
            />

            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    placeholder="Search by name or nationality…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="focus:ring-primary/30 flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <div className="scrollbar-none -mb-1 flex gap-2 overflow-x-auto pb-1">
                    {POSITIONS.map((pos) => (
                        <button
                            key={pos}
                            onClick={() => setPositionFilter(pos)}
                            className={`flex-shrink-0 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                positionFilter === pos
                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10'
                            }`}
                        >
                            {pos}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length > 0 ? (
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {filtered.map((player) => (
                        <motion.div key={player.id} variants={fadeUp}>
                            <Card
                                elevated
                                hoverable
                                className="group cursor-pointer"
                                onClick={() => router.push(`/league/public/players/${player.id}`)}
                            >
                                <CardContent className="pb-5 pt-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-2xl font-black text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-600">
                                            {player.jersey_number ?? '–'}
                                        </div>

                                        <h3 className="mb-2 text-base font-black uppercase italic tracking-tight text-gray-900 transition-colors group-hover:text-orange-600 dark:text-white">
                                            {player.name}
                                        </h3>

                                        <div className="mb-4 flex flex-wrap justify-center gap-1.5">
                                            {player.position && (
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
                                                        POSITION_COLORS[
                                                            mapPosition(player.position)
                                                        ] ?? 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {player.position}
                                                </span>
                                            )}
                                            {player.nationality && (
                                                <Badge
                                                    variant="secondary"
                                                    size="sm"
                                                    className="text-[9px] font-black uppercase tracking-widest opacity-70"
                                                >
                                                    {player.nationality}
                                                </Badge>
                                            )}
                                        </div>

                                        {player.team_name && (
                                            <p className="w-full border-t border-gray-50 pt-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-white/5">
                                                {player.team_name}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 py-20 text-center dark:border-white/10 dark:bg-white/5">
                    <p className="text-sm font-medium text-gray-400 dark:text-white/40">
                        {search || positionFilter !== 'All'
                            ? 'No players match your search.'
                            : 'No players registered yet.'}
                    </p>
                </div>
            )}
        </PageLayout>
    );
}
