'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PageLayout } from '@/components/plyaz';
import { ChevronLeft, Calendar, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { LineupSelectionStatus } from '@/lib/supabase/types';

type Team = { id: string; name: string; short_name: string | null; logo_url: string | null };

type NextMatchStatus =
    | { status: 'starting' | 'bench' | 'not_called'; match: MatchInfo; player: PlayerInfo }
    | { status: 'pending'; match: MatchInfo; player: PlayerInfo }
    | { status: 'no_match'; player: PlayerInfo }
    | { status: 'no_player' };

type MatchInfo = {
    id: string;
    scheduled_at: string | null;
    venue: string | null;
    status: string;
    matchday: number | null;
    home_team: Team;
    away_team: Team;
};

type PlayerInfo = { id: string; team_id: string | null; name: string };

const CONVOCATION_CONFIG: Record<
    LineupSelectionStatus | 'pending',
    {
        label: string;
        sublabel: string;
        bg: string;
        border: string;
        textColor: string;
        icon: string;
    }
> = {
    starting: {
        label: 'STARTING XI',
        sublabel: "You're in the starting lineup. Game on.",
        bg: 'bg-green-500',
        border: 'border-green-400',
        textColor: 'text-white',
        icon: '🟢',
    },
    bench: {
        label: 'ON THE BENCH',
        sublabel: "You're on the bench. Stay sharp.",
        bg: 'bg-yellow-400',
        border: 'border-yellow-300',
        textColor: 'text-gray-900',
        icon: '🟡',
    },
    not_called: {
        label: 'NOT CALLED UP',
        sublabel: "You're not in the squad for this match.",
        bg: 'bg-red-600',
        border: 'border-red-500',
        textColor: 'text-white',
        icon: '🔴',
    },
    pending: {
        label: 'SQUAD NOT ANNOUNCED',
        sublabel: 'Your coach has not published the squad yet. Check back closer to match day.',
        bg: 'bg-gray-800',
        border: 'border-gray-700',
        textColor: 'text-white',
        icon: '📋',
    },
};

function MatchDetails({ match, playerTeamId }: { match: MatchInfo; playerTeamId: string | null }) {
    const isHome = match.home_team?.id === playerTeamId;
    const opponent = isHome ? match.away_team : match.home_team;
    const matchDate = match.scheduled_at
        ? new Date(match.scheduled_at).toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : 'Date TBC';
    const matchTime = match.scheduled_at
        ? new Date(match.scheduled_at).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
          })
        : '';

    return (
        <div className="mt-6 rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
                {match.matchday && <span>Matchday {match.matchday}</span>}
                {match.matchday && <span>·</span>}
                <span>{isHome ? 'Home' : 'Away'}</span>
            </div>
            <div className="mb-4 flex items-center justify-center gap-4">
                <p className="max-w-[100px] truncate text-lg font-black tracking-tight">
                    {isHome ? 'You' : (opponent?.short_name ?? opponent?.name ?? 'Opponent')}
                </p>
                <span className="text-2xl font-black opacity-30">VS</span>
                <p className="max-w-[100px] truncate text-lg font-black tracking-tight">
                    {isHome ? (opponent?.short_name ?? opponent?.name ?? 'Opponent') : 'You'}
                </p>
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium opacity-70">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                        {matchDate}
                        {matchTime ? ` · ${matchTime}` : ''}
                    </span>
                </div>
                {match.venue && (
                    <div className="flex items-center gap-2 text-sm font-medium opacity-70">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{match.venue}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ConvocationPage() {
    const router = useRouter();

    const { data, isLoading } = useQuery({
        queryKey: ['player-next-match-status'],
        queryFn: () => apiClient.get<NextMatchStatus>('/api/league/player/next-match-status'),
        staleTime: 60_000,
    });

    return (
        <PageLayout title="MATCH DAY">
            <div className="mx-auto max-w-md pb-24">
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-orange-500"
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </button>

                <div className="mb-6">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                        Match Day
                    </p>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900">
                        Your Convocation
                    </h1>
                </div>

                {isLoading && (
                    <div className="animate-pulse rounded-3xl bg-gray-100 p-12 text-center">
                        <div className="mx-auto mb-3 h-8 w-40 rounded bg-gray-200" />
                        <div className="mx-auto h-4 w-64 rounded bg-gray-200" />
                    </div>
                )}

                {!isLoading && data && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {data.status === 'no_player' && (
                            <div className="rounded-3xl bg-gray-950 p-12 text-center text-white">
                                <div className="mb-6 text-5xl">👤</div>
                                <h2 className="mb-3 text-xl font-black tracking-tight">
                                    Not Linked to a Player
                                </h2>
                                <p className="text-sm font-medium leading-relaxed text-white/40">
                                    Complete your profile and join a team to see your match
                                    convocation.
                                </p>
                            </div>
                        )}

                        {data.status === 'no_match' && (
                            <div className="rounded-3xl bg-gray-950 p-12 text-center text-white">
                                <div className="mb-6 text-5xl">📅</div>
                                <h2 className="mb-3 text-xl font-black tracking-tight">
                                    No Upcoming Match
                                </h2>
                                <p className="text-sm font-medium leading-relaxed text-white/40">
                                    No match is scheduled for your team right now. Check back later.
                                </p>
                            </div>
                        )}

                        {(data.status === 'starting' ||
                            data.status === 'bench' ||
                            data.status === 'not_called' ||
                            data.status === 'pending') &&
                            (() => {
                                const cfg =
                                    CONVOCATION_CONFIG[
                                        data.status as LineupSelectionStatus | 'pending'
                                    ];
                                const matchData = data as {
                                    match: MatchInfo;
                                    player: PlayerInfo;
                                } & typeof data;
                                return (
                                    <div className={`rounded-3xl p-8 ${cfg.bg} ${cfg.textColor}`}>
                                        <div className="mb-2 text-center">
                                            <span className="text-6xl">{cfg.icon}</span>
                                        </div>
                                        <div className="mt-4 text-center">
                                            <h2 className="mb-2 text-2xl font-black tracking-tight">
                                                {cfg.label}
                                            </h2>
                                            <p
                                                className={`text-sm font-medium leading-relaxed opacity-70`}
                                            >
                                                {cfg.sublabel}
                                            </p>
                                        </div>
                                        {matchData.match && (
                                            <MatchDetails
                                                match={matchData.match}
                                                playerTeamId={matchData.player?.team_id ?? null}
                                            />
                                        )}
                                    </div>
                                );
                            })()}
                    </motion.div>
                )}
            </div>
        </PageLayout>
    );
}
