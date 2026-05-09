'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    CardTitle,
    Badge,
    StatusBadge,
} from '@/components/plyaz';
import { stagger, fadeUp } from '@/lib/animations';
import { subscribeToMatch } from '@/lib/supabase/realtime';
import type { Match, MatchEvent, Player, Team } from '@/lib/supabase/types';
import { MapPin, Clock, Calendar, Users } from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type MatchWithTeams = Match & {
    home_team: Team | null;
    away_team: Team | null;
};

// ─────────────────────────────────────────────
// Event icon helper
// ─────────────────────────────────────────────

function eventIcon(type: MatchEvent['type']): string {
    switch (type) {
        case 'goal':
        case 'penalty':
            return '⚽';
        case 'own_goal':
            return '⚽';
        case 'yellow_card':
            return '🟨';
        case 'red_card':
            return '🟥';
        case 'substitution':
            return '↕️';
        case 'injury':
            return '🩹';
        case 'var_review':
            return '📺';
        default:
            return '•';
    }
}

function eventLabel(type: MatchEvent['type']): string {
    switch (type) {
        case 'goal':
            return 'Goal';
        case 'own_goal':
            return 'Own Goal';
        case 'penalty':
            return 'Penalty';
        case 'yellow_card':
            return 'Yellow Card';
        case 'red_card':
            return 'Red Card';
        case 'substitution':
            return 'Substitution';
        case 'injury':
            return 'Injury';
        case 'var_review':
            return 'VAR Review';
        default:
            return type;
    }
}

// ─────────────────────────────────────────────
// Scoreboard Section
// ─────────────────────────────────────────────

interface ScoreboardProps {
    match: MatchWithTeams;
    liveScore: { home: number; away: number };
    matchTime: string | null;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ match, liveScore, matchTime }) => {
    const homeTeam = match.home_team;
    const awayTeam = match.away_team;
    const isLive = match.status === 'live';

    const formattedDate = match.scheduled_at
        ? new Date(match.scheduled_at).toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : null;

    const formattedTime = match.scheduled_at
        ? new Date(match.scheduled_at).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
          })
        : null;

    return (
        <div className="mb-6 rounded-2xl bg-neutral-900 p-6 text-white md:p-8">
            {/* Status badge + matchday */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <StatusBadge
                        status={
                            match.status as
                                | 'live'
                                | 'upcoming'
                                | 'completed'
                                | 'cancelled'
                                | 'postponed'
                                | 'scheduled'
                        }
                    />
                    {match.matchday && (
                        <Badge className="bg-neutral-800 text-neutral-400">
                            Matchday {match.matchday}
                        </Badge>
                    )}
                </div>
                {isLive && matchTime && (
                    <div className="flex items-center gap-2 text-sm font-black text-orange-400">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
                        </span>
                        {matchTime}&apos;
                    </div>
                )}
            </div>

            {/* Teams and score */}
            <div className="grid grid-cols-3 items-center gap-4">
                {/* Home Team */}
                <div className="flex flex-col items-center gap-2 md:items-start">
                    {homeTeam?.logo_url && (
                        <img
                            src={homeTeam.logo_url}
                            alt={homeTeam.name}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                    )}
                    {!homeTeam?.logo_url && (
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-black text-white"
                            style={{ backgroundColor: homeTeam?.primary_color ?? '#374151' }}
                        >
                            {homeTeam?.short_name?.slice(0, 3) ?? 'HOM'}
                        </div>
                    )}
                    <div className="text-center md:text-left">
                        <p className="text-base font-black leading-none md:text-lg">
                            {homeTeam?.short_name ?? homeTeam?.name ?? 'Home'}
                        </p>
                        {homeTeam?.name && homeTeam.short_name && (
                            <p className="mt-0.5 hidden text-xs text-neutral-400 md:block">
                                {homeTeam.name}
                            </p>
                        )}
                    </div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-3">
                        <span className="text-5xl font-black tabular-nums md:text-7xl">
                            {liveScore.home}
                        </span>
                        <span className="text-2xl text-neutral-500">—</span>
                        <span className="text-5xl font-black tabular-nums md:text-7xl">
                            {liveScore.away}
                        </span>
                    </div>
                    {match.status === 'upcoming' && formattedTime && (
                        <p className="text-sm text-neutral-400">{formattedTime}</p>
                    )}
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center gap-2 md:items-end">
                    {awayTeam?.logo_url && (
                        <img
                            src={awayTeam.logo_url}
                            alt={awayTeam.name}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                    )}
                    {!awayTeam?.logo_url && (
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-black text-white"
                            style={{ backgroundColor: awayTeam?.primary_color ?? '#374151' }}
                        >
                            {awayTeam?.short_name?.slice(0, 3) ?? 'AWY'}
                        </div>
                    )}
                    <div className="text-center md:text-right">
                        <p className="text-base font-black leading-none md:text-lg">
                            {awayTeam?.short_name ?? awayTeam?.name ?? 'Away'}
                        </p>
                        {awayTeam?.name && awayTeam.short_name && (
                            <p className="mt-0.5 hidden text-xs text-neutral-400 md:block">
                                {awayTeam.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Venue and date row */}
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-neutral-800 pt-4 text-xs text-neutral-400">
                {match.venue && (
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        <span>{match.venue}</span>
                    </div>
                )}
                {formattedDate && (
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{formattedDate}</span>
                    </div>
                )}
                {formattedTime && match.status !== 'upcoming' && (
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>{formattedTime}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Event Timeline
// ─────────────────────────────────────────────

interface EventTimelineProps {
    events: MatchEvent[];
    homeTeamId: string;
}

const EventTimeline: React.FC<EventTimelineProps> = ({ events, homeTeamId }) => {
    if (events.length === 0) {
        return <p className="py-6 text-center text-sm text-neutral-400">No events recorded yet</p>;
    }

    const sorted = [...events].sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
            {sorted.map((event) => {
                const isHome = event.team_id === homeTeamId;
                const isGoal = event.type === 'goal' || event.type === 'penalty';
                const isOwnGoal = event.type === 'own_goal';

                return (
                    <motion.div
                        key={event.id}
                        variants={fadeUp}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                            isGoal || isOwnGoal
                                ? 'border border-orange-200 bg-orange-50 dark:border-orange-500/20 dark:bg-orange-500/10'
                                : 'bg-neutral-50 dark:bg-neutral-800/50'
                        }`}
                    >
                        {/* Minute — left side for home, right side for away */}
                        {isHome ? (
                            <>
                                <span className="w-8 flex-shrink-0 text-right text-[10px] font-black text-neutral-400">
                                    {event.minute ?? '?'}&apos;
                                </span>
                                <span className="flex-shrink-0 text-lg">
                                    {eventIcon(event.type)}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={`truncate text-sm font-bold ${isGoal ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-800 dark:text-neutral-200'}`}
                                    >
                                        {event.player_name ?? eventLabel(event.type)}
                                    </p>
                                    {event.player_name && (
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                                            {eventLabel(event.type)}
                                            {event.half ? ` · ${event.half}` : ''}
                                        </p>
                                    )}
                                </div>
                                <Badge variant="secondary" size="sm">
                                    HOME
                                </Badge>
                            </>
                        ) : (
                            <>
                                <Badge variant="secondary" size="sm">
                                    AWAY
                                </Badge>
                                <div className="min-w-0 flex-1 text-right">
                                    <p
                                        className={`truncate text-sm font-bold ${isGoal || isOwnGoal ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-800 dark:text-neutral-200'}`}
                                    >
                                        {event.player_name ?? eventLabel(event.type)}
                                    </p>
                                    {event.player_name && (
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                                            {eventLabel(event.type)}
                                            {event.half ? ` · ${event.half}` : ''}
                                        </p>
                                    )}
                                </div>
                                <span className="flex-shrink-0 text-lg">
                                    {eventIcon(event.type)}
                                </span>
                                <span className="w-8 flex-shrink-0 text-[10px] font-black text-neutral-400">
                                    {event.minute ?? '?'}&apos;
                                </span>
                            </>
                        )}
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

// ─────────────────────────────────────────────
// Team Lineup Column
// ─────────────────────────────────────────────

interface LineupColumnProps {
    teamName: string;
    players: Player[];
    side: 'home' | 'away';
}

const LineupColumn: React.FC<LineupColumnProps> = ({ teamName, players, side }) => (
    <div className={`flex flex-col gap-2 ${side === 'away' ? 'items-end text-right' : ''}`}>
        <h4 className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
            {teamName}
        </h4>
        {players.length === 0 ? (
            <p className="text-sm text-neutral-400">Lineup not available</p>
        ) : (
            players.map((player) => (
                <div
                    key={player.id}
                    className={`flex items-center gap-2 ${side === 'away' ? 'flex-row-reverse' : ''}`}
                >
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-black text-white dark:bg-neutral-200 dark:text-neutral-900">
                        {player.jersey_number ?? '—'}
                    </div>
                    <div className={side === 'away' ? 'text-right' : ''}>
                        <p className="text-sm font-bold leading-none text-neutral-800 dark:text-neutral-200">
                            {player.name}
                        </p>
                        {player.position && (
                            <p className="text-[9px] uppercase tracking-widest text-neutral-400">
                                {player.position}
                            </p>
                        )}
                    </div>
                </div>
            ))
        )}
    </div>
);

// ─────────────────────────────────────────────
// Match Tabs
// ─────────────────────────────────────────────

interface MatchTabsProps {
    id: string;
}

const MatchTabs: React.FC<MatchTabsProps> = ({ id }) => {
    const pathname = usePathname();
    const tabs = [
        { label: 'Overview', href: `/league/matches/${id}` },
        { label: 'Lineup', href: `/league/matches/${id}/lineup` },
        { label: 'Substitutions', href: `/league/matches/${id}/substitutions` },
    ];

    return (
        <div className="mb-6 flex gap-1 rounded-2xl bg-neutral-100 p-1 dark:bg-neutral-800/60">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex-1 rounded-xl py-2.5 text-center text-[10px] font-black uppercase tracking-widest transition-all ${
                            isActive
                                ? 'bg-black text-white shadow-md dark:bg-orange-500'
                                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                        }`}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
};

// ─────────────────────────────────────────────
// Main Match Detail Page
// ─────────────────────────────────────────────

export default function MatchDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    // ── Fetch match ──────────────────────────────
    const { data: match, isLoading: matchLoading } = useQuery<MatchWithTeams>({
        queryKey: ['match', id],
        queryFn: () => fetch(`/api/league/matches/${id}`).then((r) => r.json()),
        enabled: !!id,
        staleTime: 30_000,
    });

    // ── Fetch events ─────────────────────────────
    const { data: initialEvents = [] } = useQuery<MatchEvent[]>({
        queryKey: ['match-events', id],
        queryFn: () => fetch(`/api/league/matches/${id}/events`).then((r) => r.json()),
        enabled: !!id,
        staleTime: 30_000,
    });

    // ── Fetch home team players ───────────────────
    const { data: homePlayers = [] } = useQuery<Player[]>({
        queryKey: ['team-players', match?.home_team_id],
        queryFn: () =>
            fetch(`/api/league/teams/${match!.home_team_id}/players`).then((r) => r.json()),
        enabled: !!match?.home_team_id,
        staleTime: 60_000,
    });

    // ── Fetch away team players ───────────────────
    const { data: awayPlayers = [] } = useQuery<Player[]>({
        queryKey: ['team-players', match?.away_team_id],
        queryFn: () =>
            fetch(`/api/league/teams/${match!.away_team_id}/players`).then((r) => r.json()),
        enabled: !!match?.away_team_id,
        staleTime: 60_000,
    });

    // ── Live state ───────────────────────────────
    const [events, setEvents] = useState<MatchEvent[]>([]);
    const [liveScore, setLiveScore] = useState({ home: 0, away: 0 });
    const [matchTime, setMatchTime] = useState<string | null>(null);

    // Sync initial events from query
    useEffect(() => {
        if (initialEvents.length > 0) {
            setEvents(initialEvents);
        }
    }, [initialEvents]);

    // Sync initial score from match
    useEffect(() => {
        if (match) {
            setLiveScore({
                home: match.home_score ?? 0,
                away: match.away_score ?? 0,
            });
            setMatchTime(match.match_time);
        }
    }, [match]);

    // ── Realtime subscription (live matches only) ─
    const handleMatchUpdate = useCallback((updated: Partial<Match>) => {
        if (updated.home_score !== undefined || updated.away_score !== undefined) {
            setLiveScore((prev) => ({
                home: updated.home_score ?? prev.home,
                away: updated.away_score ?? prev.away,
            }));
        }
        if (updated.match_time !== undefined) {
            setMatchTime(updated.match_time);
        }
    }, []);

    const handleNewEvent = useCallback((event: MatchEvent) => {
        setEvents((prev) => {
            // Avoid duplicates
            if (prev.some((e) => e.id === event.id)) return prev;
            return [...prev, event];
        });
    }, []);

    useEffect(() => {
        if (!match || match.status !== 'live' || !id) return;

        const channel = subscribeToMatch(id, {
            onMatchUpdate: handleMatchUpdate,
            onEventNew: handleNewEvent,
        });

        return () => {
            channel.unsubscribe();
        };
    }, [id, match?.status, handleMatchUpdate, handleNewEvent]);

    // ── Loading state ────────────────────────────
    if (matchLoading || !match) {
        return (
            <PageLayout>
                <div className="animate-pulse space-y-4">
                    <div className="h-48 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
                    <div className="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                    <div className="h-48 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                </div>
            </PageLayout>
        );
    }

    const homeTeamName = match.home_team?.name ?? 'Home Team';
    const awayTeamName = match.away_team?.name ?? 'Away Team';

    return (
        <PageLayout>
            <PageHeader
                label="Match"
                title={`${match.home_team?.short_name ?? 'HOME'} vs ${match.away_team?.short_name ?? 'AWAY'}`}
                description={match.venue ?? undefined}
            />

            {/* Scoreboard */}
            <motion.div variants={fadeUp} initial="hidden" animate="show">
                <Scoreboard match={match} liveScore={liveScore} matchTime={matchTime} />
            </motion.div>

            {/* Tab Navigation */}
            <MatchTabs id={id} />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Event Timeline */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.1 }}
                >
                    <Card padding="md">
                        <CardTitle className="mb-4">Event Timeline</CardTitle>
                        <CardContent>
                            <AnimatePresence mode="popLayout">
                                <EventTimeline events={events} homeTeamId={match.home_team_id} />
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Team Lineups */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.2 }}
                >
                    <Card padding="md">
                        <div className="mb-4 flex items-center gap-2">
                            <Users className="h-4 w-4 text-neutral-400" />
                            <CardTitle>Lineups</CardTitle>
                        </div>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <LineupColumn
                                    teamName={homeTeamName}
                                    players={Array.isArray(homePlayers) ? homePlayers : []}
                                    side="home"
                                />
                                <LineupColumn
                                    teamName={awayTeamName}
                                    players={Array.isArray(awayPlayers) ? awayPlayers : []}
                                    side="away"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </PageLayout>
    );
}
