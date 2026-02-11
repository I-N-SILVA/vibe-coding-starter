'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PlayerCard,
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
    stats: { mp: 12, w: 9, d: 2, l: 1, pts: 29 },
    form: ['W', 'W', 'D', 'W', 'L'],
    roster: [
        { name: 'John Smith', position: 'FWD', number: 9, goals: 12, assists: 3 },
        { name: 'Mike Wilson', position: 'MID', number: 10, goals: 4, assists: 8 },
        { name: 'Robert Brown', position: 'DEF', number: 4, goals: 1, assists: 1 },
        { name: 'David Lee', position: 'GK', number: 1, goals: 0, assists: 0 },
    ],
    nextMatches: [
        {
            id: '101',
            homeTeam: { id: '1', name: 'FC United', shortName: 'FCU' },
            awayTeam: { id: '4', name: 'Eagles', shortName: 'EGL' },
            status: 'upcoming' as const,
            matchTime: '7:00 PM',
            date: 'Sat, Feb 15',
            venue: 'United Park',
        }
    ]
};

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function TeamProfile() {
    const router = useRouter();

    return (
        <PageLayout
            navItems={publicNavItems}
            title={teamData.name}
            showBackButton
            onBackClick={() => router.back()}
        >
            {/* Team Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-center gap-8 mb-12 py-4"
            >
                <div className="w-32 h-32 rounded-full bg-gray-900 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                    {teamData.shortName}
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                        {teamData.name}
                    </h1>
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                        <span className="text-xs font-medium tracking-widest uppercase text-gray-400">
                            {teamData.league}
                        </span>
                        <div className="flex items-center gap-1.5">
                            {teamData.form.map((res, i) => (
                                <span
                                    key={i}
                                    className={cn(
                                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                                        res === 'W' ? 'bg-gray-900 text-white' :
                                            res === 'D' ? 'bg-gray-200 text-gray-600' :
                                                'border border-gray-200 text-gray-400'
                                    )}
                                >
                                    {res}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12"
            >
                {[
                    { title: 'MP', value: teamData.stats.mp },
                    { title: 'W', value: teamData.stats.w },
                    { title: 'D', value: teamData.stats.d },
                    { title: 'L', value: teamData.stats.l },
                    { title: 'PTS', value: teamData.stats.pts },
                ].map((stat) => (
                    <motion.div key={stat.title} variants={fadeUp}>
                        <StatCard title={stat.title} value={stat.value} />
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Squad Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gray-400 mb-6">
                        Squad List
                    </h2>
                    <div className="grid gap-3">
                        {teamData.roster.map((player, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeUp}
                                onClick={() => router.push(`/league/public/players/${idx + 1}`)}
                                className="cursor-pointer"
                            >
                                <PlayerCard
                                    name={player.name}
                                    position={player.position}
                                    number={player.number}
                                    stats={{ goals: player.goals, assists: player.assists }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Fixtures Section */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                >
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gray-400 mb-6">
                        Upcoming
                    </h2>
                    <div className="space-y-4">
                        {teamData.nextMatches.map((match) => (
                            <MatchCard
                                key={match.id}
                                homeTeam={match.homeTeam}
                                awayTeam={match.awayTeam}
                                status={match.status}
                                matchTime={match.matchTime}
                                date={match.date}
                                venue={match.venue}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </PageLayout>
    );
}
