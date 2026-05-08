'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PageLayout, Badge, Button } from '@/components/plyaz';
import {
    Share2,
    Download,
    ChevronLeft,
    Zap,
    Target,
    Footprints,
    Shield,
    Dumbbell,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useCurrentPlayer, usePlayerCareerStats } from '@/lib/hooks/use-players';
import { useToast } from '@/components/providers/ToastProvider';

/**
 * FIFA Ultimate Team Style Player Card
 * Full-screen premium stats card with radar chart and season history.
 * Data is sourced from the logged-in player's real record.
 */

const STAT_LABELS = [
    { key: 'pace', label: 'PAC', icon: Zap, color: '#22c55e' },
    { key: 'shooting', label: 'SHO', icon: Target, color: '#f97316' },
    { key: 'passing', label: 'PAS', icon: Share2, color: '#3b82f6' },
    { key: 'dribbling', label: 'DRI', icon: Footprints, color: '#a855f7' },
    { key: 'defense', label: 'DEF', icon: Shield, color: '#eab308' },
    { key: 'physical', label: 'PHY', icon: Dumbbell, color: '#ef4444' },
] as const;

// Derive approximate FIFA-style radar values from real player stats.
// These are computed estimates since the DB doesn't store pace/shooting/etc.
function computeRadarStats(stats: {
    goals: number;
    assists: number;
    appearances: number;
    yellow_cards: number;
    red_cards: number;
}) {
    if (stats.appearances === 0) {
        return { pace: 0, shooting: 0, passing: 0, dribbling: 0, defense: 0, physical: 0 };
    }
    const goalsPerGame = stats.goals / stats.appearances;
    const assistsPerGame = stats.assists / stats.appearances;
    // Cap derived stats at 99
    const cap = (v: number) => Math.min(Math.round(v), 99);
    return {
        pace: cap(50 + goalsPerGame * 30),
        shooting: cap(50 + goalsPerGame * 40),
        passing: cap(50 + assistsPerGame * 50),
        dribbling: cap(50 + (goalsPerGame + assistsPerGame) * 20),
        defense: cap(40),
        physical: cap(55 + stats.appearances),
    };
}

// SVG Radar Chart Component
function RadarChart({ stats }: { stats: Record<string, number> }) {
    const cx = 150,
        cy = 150,
        r = 110;
    const keys = ['pace', 'shooting', 'passing', 'dribbling', 'defense', 'physical'];
    const angleStep = (2 * Math.PI) / keys.length;

    const getPoint = (value: number, index: number) => {
        const angle = angleStep * index - Math.PI / 2;
        const radius = (value / 100) * r;
        return {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle),
        };
    };

    const gridLevels = [0.25, 0.5, 0.75, 1.0];
    const dataPoints = keys.map((key, i) => getPoint(stats[key] ?? 0, i));
    const pathData =
        dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
        <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[280px]">
            {/* Grid */}
            {gridLevels.map((level) => (
                <polygon
                    key={level}
                    points={keys
                        .map((_, i) => {
                            const p = getPoint(level * 100, i);
                            return `${p.x},${p.y}`;
                        })
                        .join(' ')}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                />
            ))}
            {/* Axis Lines */}
            {keys.map((_, i) => {
                const p = getPoint(100, i);
                return (
                    <line
                        key={i}
                        x1={cx}
                        y1={cy}
                        x2={p.x}
                        y2={p.y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="1"
                    />
                );
            })}
            {/* Data polygon */}
            <motion.path
                d={pathData}
                fill="rgba(249, 115, 22, 0.2)"
                stroke="#f97316"
                strokeWidth="2.5"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
            {/* Data points */}
            {dataPoints.map((p, i) => (
                <motion.circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#f97316"
                    stroke="white"
                    strokeWidth="2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                />
            ))}
            {/* Labels */}
            {keys.map((key, i) => {
                const p = getPoint(120, i);
                return (
                    <text
                        key={key}
                        x={p.x}
                        y={p.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="rgba(255,255,255,0.5)"
                        fontSize="10"
                        fontWeight="800"
                        letterSpacing="0.1em"
                    >
                        {STAT_LABELS[i].label}
                    </text>
                );
            })}
        </svg>
    );
}

// Empty state for players with no match data yet
function NoStatsYet() {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 text-4xl">⚽</div>
            <p className="text-sm font-bold text-gray-400">No matches played yet</p>
            <p className="mt-1 text-xs text-gray-500">
                Your card will fill up after your first game.
            </p>
        </div>
    );
}

export default function PlayerCardPage() {
    const router = useRouter();
    const toast = useToast();
    const { profile } = useAuth();

    // Fetch the logged-in user's player record
    const { data: player, isLoading: playerLoading } = useCurrentPlayer(profile?.id ?? undefined);

    // Fetch their competition stats
    const { data: careerStats, isLoading: statsLoading } = usePlayerCareerStats(player?.id ?? '');

    const isLoading = playerLoading || (!!player && statsLoading);

    const hasStats = player && player.stats && player.stats.appearances > 0;

    // Compute totals across all competitions
    const seasonStats = hasStats
        ? {
              goals: player.stats.goals,
              assists: player.stats.assists,
              appearances: player.stats.appearances,
              yellowCards: player.stats.yellow_cards,
              redCards: player.stats.red_cards,
              minutesPlayed: player.stats.appearances * 75, // estimate
              motm: 0,
          }
        : null;

    // Compute radar stats from real data
    const radarStats = hasStats
        ? computeRadarStats({
              goals: player.stats.goals,
              assists: player.stats.assists,
              appearances: player.stats.appearances,
              yellow_cards: player.stats.yellow_cards,
              red_cards: player.stats.red_cards,
          })
        : { pace: 0, shooting: 0, passing: 0, dribbling: 0, defense: 0, physical: 0 };

    // Compute overall rating from available stats
    const overallRating = hasStats
        ? Math.min(
              99,
              Math.max(
                  50,
                  Math.round(
                      (radarStats.pace +
                          radarStats.shooting +
                          radarStats.passing +
                          radarStats.dribbling +
                          radarStats.defense +
                          radarStats.physical) /
                          6,
                  ),
              ),
          )
        : 50;

    // Map career stats to competition history rows
    const competitions = Array.isArray(careerStats)
        ? (
              careerStats as Array<{
                  competition_id: string;
                  goals: number;
                  assists: number;
                  games_played: number;
                  competitions?: { name: string };
              }>
          )
              .filter((cs) => cs.games_played > 0)
              .map((cs) => ({
                  name: cs.competitions?.name ?? 'Unknown Competition',
                  goals: cs.goals,
                  assists: cs.assists,
                  apps: cs.games_played,
                  rating: (6 + (cs.goals + cs.assists) / Math.max(cs.games_played, 1)).toFixed(1),
              }))
        : [];

    const handleShareCard = async () => {
        if (!player?.id) return;
        const url = `${window.location.origin}/league/public/players/${player.id}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied!');
        } catch {
            toast.error('Could not copy link. Please copy it manually.');
        }
    };

    return (
        <PageLayout title="MY CARD">
            <div className="mx-auto max-w-md pb-24">
                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-orange-500"
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </button>

                {isLoading ? (
                    <div className="animate-pulse space-y-6">
                        <div className="h-[480px] rounded-[2rem] bg-gray-800/50" />
                        <div className="h-48 rounded-3xl bg-gray-100" />
                    </div>
                ) : !player ? (
                    <div className="py-20 text-center">
                        <div className="mb-4 text-5xl">🎽</div>
                        <h2 className="mb-2 text-lg font-black text-gray-700">
                            No Player Profile Found
                        </h2>
                        <p className="text-sm text-gray-400">
                            You haven&apos;t been added to a team yet. Ask your coach to add you.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Main Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30, rotateY: -10 }}
                            animate={{ opacity: 1, y: 0, rotateY: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 shadow-2xl"
                        >
                            {/* Decorative glow */}
                            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[100px]" />
                            <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-orange-500/5 blur-[80px]" />

                            <div className="relative p-8 pt-10">
                                {/* Rating + Position */}
                                <div className="mb-6 flex items-start justify-between">
                                    <div>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.3, type: 'spring' }}
                                            className="bg-gradient-to-b from-yellow-300 to-orange-500 bg-clip-text text-6xl font-black leading-none text-transparent"
                                        >
                                            {overallRating}
                                        </motion.div>
                                        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
                                            Overall
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge
                                            variant="primary"
                                            className="bg-orange-600 px-3 py-1 text-xs font-black text-white"
                                        >
                                            {player.position ?? 'N/A'}
                                        </Badge>
                                        <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            {/* Team name not directly on player; show org placeholder */}
                                            Player
                                        </div>
                                    </div>
                                </div>

                                {/* Avatar */}
                                <div className="mb-8 flex flex-col items-center">
                                    <div className="mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-700 text-4xl font-black text-white shadow-xl ring-4 ring-orange-500/30">
                                        {player.jersey_number != null
                                            ? `#${player.jersey_number}`
                                            : '?'}
                                    </div>
                                    <h1 className="text-2xl font-black uppercase tracking-wide text-white">
                                        {player.name}
                                    </h1>
                                    <div className="mt-2 flex items-center gap-3">
                                        <span className="text-xs font-bold text-gray-400">
                                            {player.nationality ?? 'Unknown'}
                                        </span>
                                    </div>
                                </div>

                                {/* Radar Chart or empty state */}
                                {hasStats ? <RadarChart stats={radarStats} /> : <NoStatsYet />}

                                {/* Stat Bars */}
                                {hasStats && (
                                    <div className="mt-6 grid grid-cols-3 gap-3">
                                        {STAT_LABELS.map(({ key, label, icon: Icon, color }) => (
                                            <div
                                                key={key}
                                                className="rounded-xl bg-white/5 p-3 text-center"
                                            >
                                                <Icon
                                                    className="mx-auto mb-1 h-4 w-4"
                                                    style={{ color }}
                                                />
                                                <div className="text-lg font-black text-white">
                                                    {radarStats[key as keyof typeof radarStats]}
                                                </div>
                                                <div className="text-[8px] font-bold uppercase tracking-widest text-gray-500">
                                                    {label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Season Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
                        >
                            <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                                Season Breakdown
                            </h3>
                            {seasonStats ? (
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        { label: 'Goals', value: seasonStats.goals, emoji: '⚽' },
                                        {
                                            label: 'Assists',
                                            value: seasonStats.assists,
                                            emoji: '🅰️',
                                        },
                                        {
                                            label: 'Apps',
                                            value: seasonStats.appearances,
                                            emoji: '📋',
                                        },
                                        { label: 'MOTM', value: seasonStats.motm, emoji: '⭐' },
                                        {
                                            label: 'Minutes',
                                            value: seasonStats.minutesPlayed,
                                            emoji: '⏱️',
                                        },
                                        {
                                            label: 'Yellow',
                                            value: seasonStats.yellowCards,
                                            emoji: '🟡',
                                        },
                                        { label: 'Red', value: seasonStats.redCards, emoji: '🔴' },
                                        { label: 'Rating', value: overallRating, emoji: '📊' },
                                    ].map((stat) => (
                                        <div key={stat.label} className="py-2 text-center">
                                            <div className="mb-1 text-lg">{stat.emoji}</div>
                                            <div className="text-lg font-black text-gray-900">
                                                {stat.value}
                                            </div>
                                            <div className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-gray-400">
                                    Stats will appear here after your first match.
                                </p>
                            )}
                        </motion.div>

                        {/* Competition History */}
                        {competitions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-6 space-y-3"
                            >
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                                    Competition History
                                </h3>
                                {competitions.map((comp) => (
                                    <div
                                        key={comp.name}
                                        className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">
                                                {comp.name}
                                            </p>
                                            <p className="mt-1 text-[10px] font-bold text-gray-400">
                                                {comp.goals}G · {comp.assists}A · {comp.apps} Apps
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-black text-gray-900">
                                                {comp.rating}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* Actions */}
                        <div className="mt-8 flex gap-3">
                            <Button
                                fullWidth
                                className="h-14 rounded-2xl bg-black text-white"
                                onClick={handleShareCard}
                                disabled={!player?.id}
                            >
                                <Share2 className="mr-2 h-4 w-4" /> Share Card
                            </Button>
                            <Button
                                variant="secondary"
                                className="h-14 rounded-2xl border-gray-200 px-6"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </PageLayout>
    );
}
