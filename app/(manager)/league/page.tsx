'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useCompetitions,
    useLiveMatches,
    useMatches,
    useTeams,
    useOrganization,
    useSetupChecklist,
} from '@/lib/hooks';
import { useInvites, useCreateInvite } from '@/lib/hooks/use-organizations';
import { queryKeys } from '@/lib/hooks/query-keys';
import {
    PageLayout,
    NavIcons,
    MatchCard,
    Card,
    CardContent,
    Button,
    Modal,
    Input,
    Select,
    SkeletonMatchCard,
} from '@/components/plyaz';
import { adminNavItems, adminNavGroups } from '@/lib/constants/navigation';
import { useToast } from '@/components/providers';
import { fadeUp } from '@/lib/animations';
import { CheckCircle2, Circle, ArrowRight, Copy, Check, Link2, Zap } from 'lucide-react';
import type { Competition } from '@/types';
import type { MatchStatus } from '@/types/models';

// ─── Setup Checklist ──────────────────────────────────────────────────────────

function SetupChecklist({ competitionId }: { competitionId: string | null }) {
    const router = useRouter();
    const { steps, completed, total, percentage, nextStep } = useSetupChecklist(competitionId);
    const toast = useToast();
    const createInvite = useCreateInvite();
    const [freshLink, setFreshLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerateInvite = async () => {
        try {
            const result = await createInvite.mutateAsync({ type: 'player_join', role: 'player' }) as { token: string };
            setFreshLink(`${window.location.origin}/invites/accept?token=${result.token}`);
        } catch {
            toast.error('Failed to generate invite link');
        }
    };

    const handleCopy = () => {
        if (!freshLink) return;
        navigator.clipboard.writeText(freshLink);
        setCopied(true);
        toast.success('Copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-5">
            {/* Progress hero */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-neutral-900 dark:bg-neutral-800 p-5 md:p-6 text-white"
            >
                <div className="flex items-start justify-between mb-4 gap-3">
                    <div>
                        <p className="text-[10px] font-black tracking-[0.25em] uppercase text-neutral-400 mb-1">Setup Progress</p>
                        <h2 className="text-xl md:text-2xl font-black leading-tight">
                            {percentage < 50 ? "Let's build your league" : percentage < 100 ? 'Almost ready to launch' : 'League is live!'}
                        </h2>
                        <p className="text-sm text-neutral-400 mt-1">{completed} of {total} steps complete</p>
                    </div>
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-lg font-black text-white">{percentage}%</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                        className="h-full bg-orange-500 rounded-full"
                    />
                </div>

                {nextStep && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        onClick={() => nextStep.href && router.push(nextStep.href)}
                        className="mt-4 flex items-center gap-2 text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors"
                    >
                        <Zap className="w-4 h-4" />
                        Next: {nextStep.cta}
                        <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                )}
            </motion.div>

            {/* Checklist steps */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card>
                    <CardContent className="p-0 divide-y divide-neutral-50 dark:divide-neutral-800">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 + i * 0.04 }}
                            >
                                <button
                                    onClick={() => step.href && router.push(step.href)}
                                    disabled={!step.href || step.done}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left ${
                                        step.done
                                            ? 'opacity-60'
                                            : step.href
                                            ? 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer'
                                            : 'cursor-default'
                                    }`}
                                >
                                    <span className={`flex-shrink-0 ${step.done ? 'text-green-500' : 'text-neutral-300 dark:text-neutral-600'}`}>
                                        {step.done
                                            ? <CheckCircle2 className="w-5 h-5" />
                                            : <Circle className="w-5 h-5" />}
                                    </span>
                                    <span className={`flex-1 text-sm font-semibold ${step.done ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>
                                        {step.label}
                                    </span>
                                    {!step.done && step.href && (
                                        <span className="flex-shrink-0 text-[10px] font-bold tracking-wider uppercase text-orange-500 flex items-center gap-1">
                                            {step.cta} <ArrowRight className="w-3 h-3" />
                                        </span>
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Quick Invite */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <h3 className="text-[10px] font-black tracking-[0.25em] uppercase text-neutral-400 mb-3">Quick Invite</h3>
                <Card className="border-dashed">
                    <CardContent className="p-4">
                        {freshLink ? (
                            <div>
                                <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-2">Invite link ready</p>
                                <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2.5">
                                    <p className="flex-1 text-[11px] font-mono text-neutral-600 dark:text-neutral-300 truncate">{freshLink}</p>
                                    <button
                                        onClick={handleCopy}
                                        className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                                    >
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button onClick={() => router.push('/league/invites')} className="text-[10px] text-neutral-400 hover:text-neutral-700 underline underline-offset-2">
                                        Manage all invites
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-neutral-800 dark:text-white">Invite a team or player</p>
                                    <p className="text-xs text-neutral-400 mt-0.5">Share a link — no email required.</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Button size="sm" variant="secondary" onClick={handleGenerateInvite} disabled={createInvite.isPending} isLoading={createInvite.isPending}>
                                        <Link2 className="w-3.5 h-3.5 mr-1.5" />
                                        Get Link
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => router.push('/league/invites')}>
                                        All Invites
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

// ─── Actionable KPI Card ─────────────────────────────────────────────────────

interface KpiCardProps {
    label: string;
    value: string | number;
    sub?: string;
    accent?: 'orange' | 'green' | 'red' | 'neutral';
    onClick?: () => void;
    loading?: boolean;
}

function KpiCard({ label, value, sub, accent = 'neutral', onClick, loading }: KpiCardProps) {
    const accentClasses: Record<string, string> = {
        orange: 'text-orange-500',
        green: 'text-green-500',
        red: 'text-red-500',
        neutral: 'text-neutral-900 dark:text-white',
    };
    return (
        <button
            onClick={onClick}
            disabled={!onClick}
            className={`w-full text-left bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 transition-all ${onClick ? 'hover:shadow-md hover:border-neutral-200 dark:hover:border-neutral-700 active:scale-[0.98]' : ''}`}
        >
            <p className="text-[9px] font-black tracking-[0.2em] uppercase text-neutral-400 mb-2">{label}</p>
            {loading ? (
                <div className="h-7 w-10 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
            ) : (
                <p className={`text-2xl font-black leading-none ${accentClasses[accent]}`}>{value}</p>
            )}
            {sub && !loading && <p className="text-[10px] text-neutral-400 mt-1 leading-snug">{sub}</p>}
        </button>
    );
}

// ─── Rich Empty State ─────────────────────────────────────────────────────────

interface RichEmptyProps {
    icon: React.ReactNode;
    title: string;
    hint: string;
    cta: string;
    onCta: () => void;
}

function RichEmpty({ icon, title, hint, cta, onCta }: RichEmptyProps) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-300 dark:text-neutral-600 mb-3">
                {icon}
            </div>
            <p className="text-sm font-bold text-neutral-600 dark:text-neutral-300">{title}</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-snug">{hint}</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={onCta}>{cta}</Button>
        </div>
    );
}

// ─── Operations Dashboard ─────────────────────────────────────────────────────

function OperationsDashboard({
    competitions,
    liveMatches,
    upcomingMatches,
    teams,
    pendingInvites,
    isLoading,
}: {
    competitions: Competition[];
    liveMatches: Competition[];
    upcomingMatches: Competition[];
    teams: Competition[];
    pendingInvites: number;
    isLoading: boolean;
}) {
    const router = useRouter();
    const draftComps = competitions.filter((c) => c.status === 'draft');

    return (
        <div className="space-y-8">
            {/* Needs attention */}
            <AnimatePresence>
                {draftComps.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-neutral-400 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-400" />
                            Needs Attention
                        </h2>
                        <div className="space-y-2">
                            {draftComps.map((comp) => (
                                <div
                                    key={comp.id}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{comp.name}</p>
                                        <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">Draft — not published</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-orange-500" onClick={() => router.push(`/league/competitions/${comp.id}`)}>
                                        Set Up →
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* KPIs */}
            <motion.section variants={fadeUp} initial="hidden" animate="show">
                <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-neutral-400 mb-3">Overview</h2>
                <div className="grid grid-cols-2 gap-3">
                    <KpiCard
                        label="Leagues"
                        value={competitions.length}
                        sub={`${competitions.filter((c) => c.status === 'active').length} active`}
                        accent={competitions.filter((c) => c.status === 'active').length > 0 ? 'green' : 'neutral'}
                        onClick={() => router.push('/league')}
                        loading={isLoading}
                    />
                    <KpiCard
                        label="Teams"
                        value={(teams as unknown[]).length}
                        sub={(teams as unknown[]).length === 0 ? 'Add your first team' : 'registered'}
                        accent={(teams as unknown[]).length === 0 ? 'orange' : 'neutral'}
                        onClick={() => router.push('/league/teams')}
                        loading={isLoading}
                    />
                    <KpiCard
                        label="Pending Invites"
                        value={pendingInvites}
                        sub={pendingInvites > 0 ? 'awaiting response' : 'All accepted'}
                        accent={pendingInvites > 0 ? 'orange' : 'neutral'}
                        onClick={() => router.push('/league/invites')}
                        loading={isLoading}
                    />
                    <KpiCard
                        label="Live Now"
                        value={(liveMatches as unknown[]).length}
                        sub={(liveMatches as unknown[]).length > 0 ? 'matches in progress' : 'No active matches'}
                        accent={(liveMatches as unknown[]).length > 0 ? 'green' : 'neutral'}
                        onClick={() => router.push('/league/matches')}
                        loading={isLoading}
                    />
                </div>
            </motion.section>

            {/* Live Matches */}
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-neutral-400 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400/40" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                        </span>
                        Live
                    </h2>
                    <button onClick={() => router.push('/league/matches')} className="text-[10px] font-bold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 uppercase tracking-wider">
                        All →
                    </button>
                </div>
                {isLoading ? (
                    <div className="space-y-3"><SkeletonMatchCard /><SkeletonMatchCard /></div>
                ) : (liveMatches as unknown[]).length > 0 ? (
                    <div className="space-y-3">
                        {(liveMatches as Parameters<typeof MatchCard>[0]['homeTeam'][]).slice(0, 3).map((match) => {
                            const m = match as unknown as Record<string, unknown>;
                            return (
                                <MatchCard
                                    key={m.id as string}
                                    homeTeam={(m.home_team as { id: string; name: string }) ?? { id: m.home_team_id as string ?? '', name: 'Home' }}
                                    awayTeam={(m.away_team as { id: string; name: string }) ?? { id: m.away_team_id as string ?? '', name: 'Away' }}
                                    homeScore={m.home_score as number}
                                    awayScore={m.away_score as number}
                                    status={m.status as MatchStatus}
                                    matchTime={m.match_time as string ?? undefined}
                                    onPress={() => router.push(`/league/referee/live/${m.id as string}`)}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <RichEmpty
                        icon={<NavIcons.Matches className="w-6 h-6" />}
                        title="No matches live yet"
                        hint="Start a match from the schedule when your teams are ready."
                        cta="View Fixtures"
                        onCta={() => router.push('/league/fixtures')}
                    />
                )}
            </motion.section>

            {/* Upcoming + Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid md:grid-cols-2 gap-6"
            >
                {/* Upcoming */}
                <section>
                    <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-neutral-400 mb-3">Upcoming</h2>
                    {isLoading ? (
                        <div className="space-y-3"><SkeletonMatchCard /></div>
                    ) : (upcomingMatches as unknown[]).length > 0 ? (
                        <div className="space-y-3">
                            {(upcomingMatches as Record<string, unknown>[]).slice(0, 3).map((match) => (
                                <MatchCard
                                    key={match.id as string}
                                    homeTeam={(match.home_team as { id: string; name: string }) ?? { id: match.home_team_id as string ?? '', name: 'Home' }}
                                    awayTeam={(match.away_team as { id: string; name: string }) ?? { id: match.away_team_id as string ?? '', name: 'Away' }}
                                    status={match.status as MatchStatus}
                                    matchTime={match.match_time as string ?? undefined}
                                    date={match.scheduled_at ? new Date(match.scheduled_at as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'TBD'}
                                    venue={match.venue as string ?? undefined}
                                />
                            ))}
                        </div>
                    ) : (
                        <RichEmpty
                            icon={<NavIcons.Calendar className="w-6 h-6" />}
                            title="Nothing scheduled yet"
                            hint="Build your fixture list to prepare for the season."
                            cta="Schedule a Match"
                            onCta={() => router.push('/league/matches/schedule')}
                        />
                    )}
                </section>

                {/* Quick Actions */}
                <section>
                    <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-neutral-400 mb-3">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Add Team', icon: <NavIcons.Teams className="w-4 h-4" />, href: '/league/teams' },
                            { label: 'Send Invite', icon: <NavIcons.Public className="w-4 h-4" />, href: '/league/invites' },
                            { label: 'Schedule', icon: <NavIcons.Calendar className="w-4 h-4" />, href: '/league/matches/schedule' },
                            { label: 'Standings', icon: <NavIcons.Standings className="w-4 h-4" />, href: '/league/standings' },
                        ].map((action) => (
                            <button
                                key={action.href}
                                onClick={() => router.push(action.href)}
                                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50 transition-colors text-left"
                            >
                                <span className="text-neutral-500 dark:text-neutral-400">{action.icon}</span>
                                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </section>
            </motion.div>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const router = useRouter();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [isCreateLeagueOpen, setIsCreateLeagueOpen] = useState(false);
    const [newLeague, setNewLeague] = useState({ name: '', type: 'league', startDate: '' });
    const [isCreating, setIsCreating] = useState(false);

    const { data: competitions = [], isLoading: compsLoading } = useCompetitions();
    const { data: liveMatches = [], isLoading: liveLoading } = useLiveMatches();
    const { data: upcomingMatches = [], isLoading: upcomingLoading } = useMatches({ status: 'upcoming' });
    const { data: teams = [], isLoading: teamsLoading } = useTeams();
    const { data: invites = [] } = useInvites();
    const { data: org } = useOrganization();

    const compsArray = Array.isArray(competitions) ? competitions : [];
    const isLoading = compsLoading || liveLoading || upcomingLoading || teamsLoading;

    // Determine mode: setup if no active competitions
    const hasActive = compsArray.some((c) => c.status === 'active');
    const primaryComp = compsArray.find((c) => c.status === 'active') ?? compsArray[0] ?? null;
    const isSetupMode = !hasActive;

    const pendingInvites = (Array.isArray(invites) ? invites : []).filter(
        (inv) => (inv as { status: string }).status === 'pending'
    ).length;

    const handleCreateLeague = async () => {
        if (!newLeague.name.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch('/api/league/competitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newLeague.name,
                    type: newLeague.type,
                    status: 'draft',
                    start_date: newLeague.startDate || null,
                }),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || 'Failed to create league');
            }
            toast.success('League created!');
            setIsCreateLeagueOpen(false);
            setNewLeague({ name: '', type: 'league', startDate: '' });
            await queryClient.invalidateQueries({ queryKey: queryKeys.competitions });
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to create league');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <PageLayout navItems={adminNavItems} navGroups={adminNavGroups} title="PLYAZ">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6 md:mb-8 gap-3">
                <div>
                    <p className="text-[10px] font-black tracking-[0.25em] uppercase text-neutral-400">Dashboard</p>
                    <h1 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-white mt-0.5">
                        {org?.name ?? 'Your League'}
                    </h1>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Pro banner condensed to a small badge */}
                    {!isLoading && org?.plan === 'free' && (
                        <button
                            onClick={() => router.push('/pricing')}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest hover:bg-orange-100 transition-colors"
                        >
                            <NavIcons.Trophy className="w-3.5 h-3.5" />
                            Upgrade
                        </button>
                    )}
                    <Button size="sm" onClick={() => setIsCreateLeagueOpen(true)}>
                        + New League
                    </Button>
                </div>
            </div>

            {/* Loading shimmer */}
            {compsLoading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            )}

            {/* Empty — no competitions at all */}
            {!compsLoading && compsArray.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="w-16 h-16 rounded-3xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-300 mb-4">
                        <NavIcons.Trophy className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-black text-neutral-900 dark:text-white">Create your first league</h2>
                    <p className="text-sm text-neutral-400 mt-2 max-w-xs">Set up competitions, add teams, and manage everything in one place.</p>
                    <Button className="mt-6" onClick={() => setIsCreateLeagueOpen(true)}>
                        Create League
                    </Button>
                </motion.div>
            )}

            {/* Setup mode — has competitions but none active */}
            {!compsLoading && compsArray.length > 0 && isSetupMode && (
                <SetupChecklist competitionId={primaryComp?.id ?? null} />
            )}

            {/* Operations mode — at least one active competition */}
            {!compsLoading && hasActive && (
                <OperationsDashboard
                    competitions={compsArray}
                    liveMatches={liveMatches as unknown as Competition[]}
                    upcomingMatches={upcomingMatches as unknown as Competition[]}
                    teams={teams as unknown as Competition[]}
                    pendingInvites={pendingInvites}
                    isLoading={isLoading}
                />
            )}

            {/* Create League Modal */}
            <Modal
                isOpen={isCreateLeagueOpen}
                onClose={() => setIsCreateLeagueOpen(false)}
                title="Create League"
                description="Set up a new competition"
            >
                <div className="space-y-4">
                    <Input
                        label="League Name"
                        placeholder="e.g., Premier Division"
                        value={newLeague.name}
                        onChange={(e) => setNewLeague({ ...newLeague, name: e.target.value })}
                    />
                    <Select
                        label="Format"
                        options={[
                            { value: 'league', label: 'League (Round Robin)' },
                            { value: 'knockout', label: 'Cup (Knockout)' },
                            { value: 'group_knockout', label: 'Group Stage + Knockout' },
                        ]}
                        value={newLeague.type}
                        onChange={(e) => setNewLeague({ ...newLeague, type: e.target.value })}
                    />
                    <Input
                        label="Start Date (optional)"
                        type="date"
                        value={newLeague.startDate}
                        onChange={(e) => setNewLeague({ ...newLeague, startDate: e.target.value })}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setIsCreateLeagueOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateLeague} disabled={!newLeague.name.trim() || isCreating} isLoading={isCreating}>
                            Create
                        </Button>
                    </div>
                </div>
            </Modal>
        </PageLayout>
    );
}
