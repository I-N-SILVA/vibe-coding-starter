'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PageLayout, Badge, Button } from '@/components/plyaz';
import { playerNavItems } from '@/lib/constants/navigation';
import { Share2, Download, ChevronLeft, Star, Zap, Target, Footprints, Shield, Dumbbell } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * FIFA Ultimate Team Style Player Card
 * Full-screen premium stats card with radar chart and season history.
 */

// Mock player data (simulation mode)
const MOCK_PLAYER = {
    id: 'p1',
    name: 'Marcus Rivera',
    position: 'ST',
    jerseyNumber: 9,
    nationality: 'English',
    age: 24,
    team: 'Phoenix FC',
    overallRating: 86,
    avatar: null,
    stats: {
        pace: 78,
        shooting: 85,
        passing: 72,
        dribbling: 80,
        defense: 45,
        physical: 70,
    },
    seasonStats: {
        goals: 12,
        assists: 4,
        appearances: 18,
        yellowCards: 2,
        redCards: 0,
        minutesPlayed: 1420,
        cleanSheets: 0,
        motm: 3,
    },
    competitions: [
        { name: 'Premier League 2026', goals: 9, assists: 3, apps: 14, rating: '8.2' },
        { name: 'Champions Cup', goals: 3, assists: 1, apps: 4, rating: '7.8' },
    ],
};

const STAT_LABELS = [
    { key: 'pace', label: 'PAC', icon: Zap, color: '#22c55e' },
    { key: 'shooting', label: 'SHO', icon: Target, color: '#f97316' },
    { key: 'passing', label: 'PAS', icon: Share2, color: '#3b82f6' },
    { key: 'dribbling', label: 'DRI', icon: Footprints, color: '#a855f7' },
    { key: 'defense', label: 'DEF', icon: Shield, color: '#eab308' },
    { key: 'physical', label: 'PHY', icon: Dumbbell, color: '#ef4444' },
] as const;

// SVG Radar Chart Component
function RadarChart({ stats }: { stats: Record<string, number> }) {
    const cx = 150, cy = 150, r = 110;
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
    const dataPoints = keys.map((key, i) => getPoint(stats[key], i));
    const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
        <svg viewBox="0 0 300 300" className="w-full max-w-[280px] mx-auto">
            {/* Grid */}
            {gridLevels.map((level) => (
                <polygon
                    key={level}
                    points={keys.map((_, i) => {
                        const p = getPoint(level * 100, i);
                        return `${p.x},${p.y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                />
            ))}
            {/* Axis Lines */}
            {keys.map((_, i) => {
                const p = getPoint(100, i);
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
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

export default function PlayerCardPage() {
    const router = useRouter();
    const player = MOCK_PLAYER;

    return (
        <PageLayout navItems={playerNavItems} title="MY CARD">
            <div className="max-w-md mx-auto pb-24">
                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 hover:text-orange-500 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30, rotateY: -10 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border border-white/5 shadow-2xl"
                >
                    {/* Decorative glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[80px]" />

                    <div className="relative p-8 pt-10">
                        {/* Rating + Position */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: 'spring' }}
                                    className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-500 leading-none"
                                >
                                    {player.overallRating}
                                </motion.div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-1">Overall</div>
                            </div>
                            <div className="text-right">
                                <Badge variant="primary" className="bg-orange-600 text-white text-xs px-3 py-1 font-black">
                                    {player.position}
                                </Badge>
                                <div className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">{player.team}</div>
                            </div>
                        </div>

                        {/* Avatar */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center text-4xl font-black text-white mb-4 ring-4 ring-orange-500/30 shadow-xl">
                                #{player.jerseyNumber}
                            </div>
                            <h1 className="text-2xl font-black text-white uppercase tracking-wide">{player.name}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-gray-400 font-bold">{player.nationality}</span>
                                <span className="text-gray-600">•</span>
                                <span className="text-xs text-gray-400 font-bold">Age {player.age}</span>
                            </div>
                        </div>

                        {/* Radar Chart */}
                        <RadarChart stats={player.stats} />

                        {/* Stat Bars */}
                        <div className="grid grid-cols-3 gap-3 mt-6">
                            {STAT_LABELS.map(({ key, label, icon: Icon, color }) => (
                                <div key={key} className="bg-white/5 rounded-xl p-3 text-center">
                                    <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
                                    <div className="text-lg font-black text-white">{player.stats[key]}</div>
                                    <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Season Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
                >
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-4">Season Breakdown</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: 'Goals', value: player.seasonStats.goals, emoji: '⚽' },
                            { label: 'Assists', value: player.seasonStats.assists, emoji: '🅰️' },
                            { label: 'Apps', value: player.seasonStats.appearances, emoji: '📋' },
                            { label: 'MOTM', value: player.seasonStats.motm, emoji: '⭐' },
                            { label: 'Minutes', value: player.seasonStats.minutesPlayed, emoji: '⏱️' },
                            { label: 'Yellow', value: player.seasonStats.yellowCards, emoji: '🟡' },
                            { label: 'Red', value: player.seasonStats.redCards, emoji: '🔴' },
                            { label: 'Rating', value: '8.1', emoji: '📊' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center py-2">
                                <div className="text-lg mb-1">{stat.emoji}</div>
                                <div className="text-lg font-black text-gray-900">{stat.value}</div>
                                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Competition History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 space-y-3"
                >
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">Competition History</h3>
                    {player.competitions.map((comp) => (
                        <div key={comp.name} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-sm font-bold text-gray-900">{comp.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold mt-1">
                                    {comp.goals}G · {comp.assists}A · {comp.apps} Apps
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-orange-500" />
                                <span className="text-sm font-black text-gray-900">{comp.rating}</span>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Actions */}
                <div className="flex gap-3 mt-8">
                    <Button fullWidth className="h-14 bg-black text-white rounded-2xl">
                        <Share2 className="w-4 h-4 mr-2" /> Share Card
                    </Button>
                    <Button variant="secondary" className="h-14 rounded-2xl px-6 border-gray-200">
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
}
