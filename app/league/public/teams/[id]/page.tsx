'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    PageLayout,
    UltimatePlayerCard,
    MatchCard,
    StatCard,
} from '@/components/plyaz';
import { publicNavItems } from '@/lib/constants/navigation';
import { cn } from '@/lib/utils';

const teamData = {
    id: '1',
    name: 'FC United',
    shortName: 'FCU',
    league: 'Premier Division',
    founded: '2022',
    manager: 'Alex Ferguson',
    stats: { mp: 12, w: 9, d: 2, l: 1, pts: 29, gf: 28, ga: 10 },
    form: ['W', 'W', 'D', 'W', 'L'],
    roster: [
        { name: 'John Smith', position: 'FWD', number: 9, rating: 88, stats: [{ label: 'PAC', value: 89 }, { label: 'SHO', value: 92 }, { label: 'PAS', value: 80 }, { label: 'DRI', value: 86 }, { label: 'DEF', value: 45 }, { label: 'PHY', value: 78 }] },
        { name: 'Mike Wilson', position: 'MID', number: 10, rating: 85, stats: [{ label: 'PAC', value: 76 }, { label: 'SHO', value: 80 }, { label: 'PAS', value: 91 }, { label: 'DRI', value: 88 }, { label: 'DEF', value: 65 }, { label: 'PHY', value: 70 }] },
        { name: 'Robert Brown', position: 'DEF', number: 4, rating: 82, stats: [{ label: 'PAC', value: 68 }, { label: 'SHO', value: 45 }, { label: 'PAS', value: 72 }, { label: 'DRI', value: 65 }, { label: 'DEF', value: 88 }, { label: 'PHY', value: 86 }] },
        { name: 'David Lee', position: 'GK', number: 1, rating: 84, stats: [{ label: 'DIV', value: 85 }, { label: 'HAN', value: 82 }, { label: 'KIC', value: 78 }, { label: 'REF', value: 88 }, { label: 'SPD', value: 50 }, { label: 'POS', value: 84 }] },
    ],
    nextMatches: [
        {
            id: '101',
            homeTeam: { id: '1', name: 'FC United', shortName: 'FCU' },
            awayTeam: { id: '4', name: 'Eagles', shortName: 'EGL' },
            status: 'upcoming' as const,
            matchTime: '19:00',
            date: 'Sat, Feb 15',
            venue: 'United Park',
        },
        {
            id: '102',
            homeTeam: { id: '2', name: 'City Blues', shortName: 'CTY' },
            awayTeam: { id: '1', name: 'FC United', shortName: 'FCU' },
            status: 'upcoming' as const,
            matchTime: '15:00',
            date: 'Sat, Feb 22',
            venue: 'City Stadium',
        }
    ]
};

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function TeamProfile() {
    const router = useRouter();

    return (
        <PageLayout
            navItems={publicNavItems}
            title={teamData.name}
            showBackButton
            onBackClick={() => router.back()}
            className="bg-surface-elevated"
        >
            {/* Magazine Hero Section */}
            <div className="relative -mx-4 md:-mx-8 -mt-8 mb-16 overflow-hidden min-h-[40vh] flex items-end">
                {/* Background Image / Gradient */}
                <div className="absolute inset-0 bg-primary-main">
                    <div className="absolute inset-0 opacity-20 bg-[url('/static/branding/pattern.png')] bg-repeat mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-primary-main/80 to-transparent" />
                </div>

                {/* Team Badge as Background Watermark */}
                <div className="absolute -right-20 -bottom-20 w-[60vh] h-[60vh] opacity-[0.03] select-none pointer-events-none">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[20rem] font-black font-serif">
                        {teamData.shortName[0]}
                    </div>
                </div>

                <div className="relative z-10 w-full px-4 md:px-8 pb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-8"
                    >
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-surface-elevated shadow-2xl border-4 border-surface-elevated flex items-center justify-center text-5xl md:text-7xl font-black text-primary-main relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300" />
                            <span className="relative z-10">{teamData.shortName}</span>
                            <div className="absolute inset-0 bg-accent-main/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        <div className="flex-1 mb-2">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-accent-main text-white text-xs font-bold tracking-widest uppercase">
                                    {teamData.league}
                                </span>
                                <span className="text-white/60 text-xs font-medium uppercase tracking-widest">
                                    Est. {teamData.founded}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none mb-4">
                                {teamData.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-white/80">
                                <div className="flex items-center gap-2">
                                    <span className="text-accent-main font-bold">Manager</span>
                                    <span className="text-sm font-medium">{teamData.manager}</span>
                                </div>
                                <div className="h-4 w-px bg-white/20" />
                                <div className="flex items-center gap-1">
                                    {teamData.form.map((res, i) => (
                                        <span
                                            key={i}
                                            className={cn(
                                                'w-6 h-6 rounded flex items-center justify-center text-[10px] font-black border border-white/10',
                                                res === 'W' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                                                    res === 'D' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                                                        'bg-red-500/20 text-red-400 border-red-500/50'
                                            )}
                                        >
                                            {res}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 md:gap-8 text-center bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                            <div>
                                <div className="text-2xl font-black text-white">{teamData.stats.mp}</div>
                                <div className="text-[10px] uppercase tracking-widest text-white/50">Played</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white">{teamData.stats.w}</div>
                                <div className="text-[10px] uppercase tracking-widest text-white/50">Won</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-accent-main">{teamData.stats.pts}</div>
                                <div className="text-[10px] uppercase tracking-widest text-white/50">Points</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
                {/* Squad Section - Main Content */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black tracking-tight text-primary-main">
                            Starting XI
                        </h2>
                        <button className="text-sm font-bold text-accent-main hover:text-accent-dark transition-colors uppercase tracking-widest">
                            View Full Squad
                        </button>
                    </div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {teamData.roster.map((player, idx) => (
                            <motion.div key={idx} variants={fadeUp}>
                                <UltimatePlayerCard
                                    name={player.name}
                                    position={player.position}
                                    number={player.number}
                                    stats={player.stats}
                                    overallRating={player.rating}
                                    onClick={() => router.push(`/league/public/players/${idx + 1}`)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Sidebar - Fixtures & Stats */}
                <div className="lg:col-span-4 space-y-12">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <h2 className="text-lg font-black tracking-widest uppercase text-secondary-main/50 mb-6">
                            Next Match
                        </h2>
                        {teamData.nextMatches.slice(0, 1).map((match) => (
                            <div key={match.id} className="bg-white rounded-3xl p-6 shadow-xl shadow-secondary-main/5 border border-secondary-main/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-main/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent-main/10 transition-colors" />

                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-xs font-bold text-secondary-main/50 uppercase tracking-wider">{match.date} • {match.matchTime}</span>
                                    <span className="px-2 py-1 rounded bg-accent-main/10 text-accent-main text-[10px] font-bold uppercase tracking-widest">
                                        {match.venue}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mb-8">
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 mb-2 mx-auto flex items-center justify-center text-xl font-black text-gray-400">
                                            {match.homeTeam.shortName}
                                        </div>
                                        <span className="font-bold text-lg">{match.homeTeam.shortName}</span>
                                    </div>
                                    <div className="text-3xl font-black text-secondary-main/20">VS</div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 mb-2 mx-auto flex items-center justify-center text-xl font-black text-gray-400">
                                            {match.awayTeam.shortName}
                                        </div>
                                        <span className="font-bold text-lg">{match.awayTeam.shortName}</span>
                                    </div>
                                </div>

                                <button className="w-full py-4 rounded-xl bg-primary-main text-white font-bold text-sm tracking-widest hover:bg-black transition-colors">
                                    MATCH CENTER
                                </button>
                            </div>
                        ))}
                    </motion.div>

                    <div>
                        <h2 className="text-lg font-black tracking-widest uppercase text-secondary-main/50 mb-6">
                            Season Stats
                        </h2>
                        <div className="space-y-4">
                            <StatCard title="Goals Scored" value={teamData.stats.gf} className="bg-white border-secondary-main/5" />
                            <StatCard title="Goals Against" value={teamData.stats.ga} className="bg-white border-secondary-main/5" />
                            <StatCard title="Clean Sheets" value={4} className="bg-white border-secondary-main/5" />
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
