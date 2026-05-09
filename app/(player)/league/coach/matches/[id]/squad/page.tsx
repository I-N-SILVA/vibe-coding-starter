'use client';

import React, { use, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PageLayout, PageHeader, Button, Badge } from '@/components/plyaz';
import { ChevronLeft, Save, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useTeams, usePlayers, useMatch } from '@/lib/hooks';
import { stagger, fadeUp } from '@/lib/animations';
import type { Player, Team, LineupSelectionStatus, MatchLineup } from '@/lib/supabase/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

type PageProps = { params: Promise<{ id: string }> };

const STATUS_LABELS: Record<LineupSelectionStatus, string> = {
    starting: 'START',
    bench: 'BENCH',
    not_called: 'OUT',
};

const STATUS_STYLES: Record<LineupSelectionStatus, string> = {
    starting: 'bg-green-500 text-white',
    bench: 'bg-yellow-400 text-gray-900',
    not_called: 'bg-red-500 text-white',
};

const INACTIVE_STYLE = 'bg-gray-100 text-gray-400 hover:bg-gray-200';

function countByStatus(
    selections: Record<string, LineupSelectionStatus>,
    status: LineupSelectionStatus,
) {
    return Object.values(selections).filter((s) => s === status).length;
}

export default function CoachSquadPage({ params }: PageProps) {
    const { id: matchId } = use(params);
    const router = useRouter();
    const { profile } = useAuth();
    const queryClient = useQueryClient();

    const { data: match } = useMatch(matchId);
    const { data: teams = [] } = useTeams();
    const team =
        (teams as Team[]).find((t) => t.manager_id === profile?.id) ?? (teams[0] as Team) ?? null;
    const { data: players = [] } = usePlayers(team?.id ?? '');
    const squadPlayers = players as Player[];

    const { data: existingLineup = [] } = useQuery({
        queryKey: ['match-lineup', matchId],
        queryFn: () => apiClient.get<MatchLineup[]>(`/api/league/matches/${matchId}/squad`),
        enabled: !!matchId,
        staleTime: 30_000,
    });

    const [selections, setSelections] = useState<Record<string, LineupSelectionStatus>>(() => {
        const initial: Record<string, LineupSelectionStatus> = {};
        if (Array.isArray(existingLineup)) {
            existingLineup.forEach((entry) => {
                initial[entry.player_id] = entry.selection_status;
            });
        }
        return initial;
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    React.useEffect(() => {
        if (existingLineup && Array.isArray(existingLineup) && existingLineup.length > 0) {
            const loaded: Record<string, LineupSelectionStatus> = {};
            existingLineup.forEach((entry) => {
                loaded[entry.player_id] = entry.selection_status;
            });
            setSelections(loaded);
        }
    }, [existingLineup]);

    const setStatus = useCallback((playerId: string, status: LineupSelectionStatus) => {
        setSelections((prev) => ({ ...prev, [playerId]: status }));
        setSaved(false);
    }, []);

    const handleSave = async () => {
        if (!team) return;
        setIsSaving(true);
        try {
            const selectionsArr = squadPlayers.map((p) => ({
                player_id: p.id,
                team_id: team.id,
                selection_status: selections[p.id] ?? 'not_called',
            }));
            await apiClient.post(`/api/league/matches/${matchId}/squad`, {
                selections: selectionsArr,
            });
            queryClient.invalidateQueries({ queryKey: ['match-lineup', matchId] });
            setSaved(true);
        } finally {
            setIsSaving(false);
        }
    };

    const startingCount = countByStatus(selections, 'starting');
    const benchCount = countByStatus(selections, 'bench');
    const outCount = countByStatus(selections, 'not_called');

    const isHome = match?.home_team_id === team?.id;
    const opponent = isHome ? match?.away_team : match?.home_team;
    const matchDate = match?.scheduled_at
        ? new Date(match.scheduled_at).toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
          })
        : 'TBC';

    return (
        <PageLayout title="SQUAD SELECTION">
            <div className="mx-auto max-w-2xl pb-24">
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-orange-500"
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </button>

                <PageHeader label="Match Convocation" title="Set Your Squad" />

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="mt-6 space-y-6"
                >
                    {/* Match Info */}
                    <motion.div
                        variants={fadeUp}
                        className="rounded-3xl bg-gray-900 p-6 text-white"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                {match?.status?.toUpperCase() ?? 'UPCOMING'}
                            </span>
                            {match?.matchday && (
                                <Badge variant="default">MD {match.matchday}</Badge>
                            )}
                        </div>
                        <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                                <p className="text-xl font-black tracking-tight">
                                    {team?.short_name ?? team?.name ?? 'Your Team'}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                                    {isHome ? 'Home' : 'Away'}
                                </p>
                            </div>
                            <span className="text-3xl font-black text-white/10">VS</span>
                            <div className="text-center">
                                <p className="text-xl font-black tracking-tight">
                                    {opponent?.short_name ?? opponent?.name ?? 'Opponent'}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                                    {isHome ? 'Away' : 'Home'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
                            <span>{matchDate}</span>
                            {match?.venue && <span>· {match.venue}</span>}
                        </div>
                    </motion.div>

                    {/* Summary Counts */}
                    <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
                        {[
                            {
                                label: 'Starting',
                                count: startingCount,
                                color: 'text-green-600 bg-green-50 border-green-200',
                            },
                            {
                                label: 'Bench',
                                count: benchCount,
                                color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
                            },
                            {
                                label: 'Not Called',
                                count: outCount,
                                color: 'text-red-600 bg-red-50 border-red-200',
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className={`rounded-2xl border-2 p-4 text-center ${s.color}`}
                            >
                                <p className="text-2xl font-black">{s.count}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </motion.div>

                    {/* Player List */}
                    <motion.section variants={fadeUp}>
                        <h2 className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                            <Users className="h-3 w-3" />
                            Squad ({squadPlayers.length} players)
                            <div className="h-px flex-1 bg-gray-100" />
                        </h2>

                        {squadPlayers.length === 0 ? (
                            <div className="rounded-2xl border-2 border-gray-100 bg-white p-8 text-center">
                                <p className="text-sm font-bold text-gray-400">
                                    No players in squad yet
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {squadPlayers.map((player) => {
                                    const current = selections[player.id];
                                    return (
                                        <div
                                            key={player.id}
                                            className="flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white p-3 transition-colors"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-sm font-black text-white">
                                                {player.jersey_number ?? '—'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold tracking-tight text-gray-900">
                                                    {player.name}
                                                </p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                    {player.position ?? '—'}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                {(
                                                    [
                                                        'starting',
                                                        'bench',
                                                        'not_called',
                                                    ] as LineupSelectionStatus[]
                                                ).map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => setStatus(player.id, status)}
                                                        className={`rounded-lg px-2 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                                                            current === status
                                                                ? STATUS_STYLES[status]
                                                                : INACTIVE_STYLE
                                                        }`}
                                                    >
                                                        {STATUS_LABELS[status]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.section>

                    {/* Save Button */}
                    <motion.div variants={fadeUp} className="pt-4">
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleSave}
                            disabled={isSaving || squadPlayers.length === 0}
                            className="h-14"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Squad'}
                        </Button>
                        {saved && (
                            <p className="mt-3 text-center text-xs font-bold uppercase tracking-widest text-green-600">
                                Squad published — players can now see their status
                            </p>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </PageLayout>
    );
}
