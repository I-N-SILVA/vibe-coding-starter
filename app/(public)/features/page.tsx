'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/plyaz';
import Image from 'next/image';
import Link from 'next/link';

import { fadeUpLarge } from '@/lib/animations';

const FEATURES = [
    {
        title: 'Live Scoreboards',
        desc: 'Instant updates for fans and managers. Track every goal, card, and sub in real-time.',
        icon: '⚡',
    },
    {
        title: 'Auto-Fixtures',
        desc: 'Generate complete season schedules in seconds. Supports round-robin and knockout formats.',
        icon: '📅',
    },
    {
        title: 'Player Onboarding',
        desc: 'Seamless registration for athletes. Build professional digital profiles and track career stats.',
        icon: '⚽',
    },
    {
        title: 'Referee Panel',
        desc: 'High-touch mobile interface for match officials. Controlled scores with precision on the touchline.',
        icon: '🟨',
    },
    {
        title: 'Standings & Stats',
        desc: 'Real-time league tables and player leaderboards. Track top scorers and clean sheets automatically.',
        icon: '🏆',
    },
    {
        title: 'Mobile First',
        desc: 'Designed for the pitch side. Every feature is optimized for fast, reliable access on any device.',
        icon: '📱',
    },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Nav placeholder or use the landing page nav */}
            <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-50 bg-white px-6 py-6">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/static/branding/logo-circle.png"
                        alt="Plyaz"
                        width={28}
                        height={28}
                    />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">PLYAZ</span>
                </Link>
                <div className="flex gap-6">
                    <Link
                        href="/login"
                        className="pt-3 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-orange-500"
                    >
                        Sign In
                    </Link>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => (window.location.href = '/league/create')}
                    >
                        Start League
                    </Button>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative overflow-hidden bg-gray-900 px-6 py-24 text-center text-white md:py-32">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute bottom-[-20%] left-[-10%] h-[80%] w-[50%] rounded-full bg-orange-500 blur-[200px]" />
                </div>
                <div className="relative z-10 mx-auto max-w-4xl">
                    <motion.div initial="hidden" animate="show" variants={fadeUpLarge}>
                        <p className="mb-6 text-xs font-bold uppercase tracking-[0.4em] text-orange-400">
                            Capabilities
                        </p>
                        <h1 className="mb-8 text-5xl font-black leading-[0.9] tracking-tight md:text-7xl">
                            BUILT FOR THE <br />
                            <span className="italic text-orange-500">NEXT GEN</span> LEAGUE
                        </h1>
                        <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-400">
                            Professional tools designed to empower organizers, referees, and
                            players. Everything you need to run an elite competition.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-6 py-24 md:py-32">
                <div className="mx-auto max-w-6xl">
                    <div className="grid gap-8 md:grid-cols-3 md:gap-12">
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group rounded-3xl border border-transparent bg-gray-50 p-8 transition-all hover:border-orange-100 hover:bg-white hover:shadow-2xl hover:shadow-orange-500/5"
                            >
                                <div className="mb-6 transform text-4xl grayscale transition-all group-hover:scale-110 group-hover:grayscale-0">
                                    {f.icon}
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-gray-900">{f.title}</h3>
                                <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive Showcase */}
            <section className="bg-gray-50 px-6 py-24">
                <div className="mx-auto grid max-w-5xl items-center gap-16 md:grid-cols-2">
                    <div>
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-orange-500">
                            Real-time Control
                        </p>
                        <h2 className="mb-6 text-3xl font-bold tracking-tight">
                            The Referee Pilot Panel.
                        </h2>
                        <p className="mb-6 leading-relaxed text-gray-500">
                            Our proprietary referee interface is designed for high-pressure
                            pitch-side action. Large touch targets, adaptive high-contrast mode, and
                            offline-resilience ensure the data remains accurate even in the toughest
                            conditions.
                        </p>
                        <ul className="space-y-4">
                            {[
                                'Goal & Card management',
                                'Live timer & stoppage tracking',
                                'Immediate standings updates',
                                'Direct player substitutions',
                            ].map((item) => (
                                <li
                                    key={item}
                                    className="flex items-center gap-3 text-sm font-medium text-gray-700"
                                >
                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border-8 border-gray-800 bg-gray-900 shadow-2xl">
                        <div className="absolute inset-0 flex rotate-90 items-center justify-center whitespace-nowrap text-4xl font-black uppercase tracking-widest text-gray-800">
                            REFEREE PANEL PREVIEW
                        </div>
                        <div className="absolute inset-4 flex flex-col space-y-4 rounded-xl bg-gray-800 p-6">
                            <div className="mx-auto h-2 w-12 rounded-full bg-gray-700" />
                            <div className="flex h-12 w-full items-center justify-center rounded-lg bg-orange-500/10 text-xs font-bold uppercase tracking-widest text-orange-500">
                                Live: 72'
                            </div>
                            <div className="flex-1 space-y-3 rounded-lg bg-gray-900/50 p-4">
                                <div className="h-4 w-1/2 rounded bg-gray-700" />
                                <div className="flex h-10 w-full items-center justify-center rounded bg-white text-xl font-black text-gray-900">
                                    2 — 1
                                </div>
                                <div className="ml-auto h-4 w-1/3 rounded bg-gray-700" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="h-20 rounded-xl bg-green-600" />
                                <div className="h-20 rounded-xl bg-yellow-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-50 bg-white px-6 py-24">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-10 md:flex-row">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/static/branding/logo-circle.png"
                            alt="Plyaz"
                            width={24}
                            height={24}
                        />
                        <span className="text-xs font-bold uppercase tracking-[0.2em]">
                            PLYAZ &copy; 2026
                        </span>
                    </div>
                    <div className="flex gap-8">
                        {['About', 'Matches', 'Terms', 'Privacy'].map((item) => (
                            <Link
                                key={item}
                                href={`/${item.toLowerCase()}`}
                                className="text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-orange-500"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
