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
      <nav className="px-6 py-6 flex justify-between items-center border-b border-gray-50 bg-white sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/static/branding/logo-circle.png" alt="Plyaz" width={28} height={28} />
          <span className="text-xs font-bold tracking-[0.2em] uppercase">PLYAZ</span>
        </Link>
        <div className="flex gap-6">
          <Link href="/login" className="text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-orange-500 transition-colors pt-3">Sign In</Link>
          <Button variant="primary" size="sm" onClick={() => window.location.href = '/league/create'}>Start League</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 md:py-32 bg-gray-900 text-white relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[80%] bg-orange-500 rounded-full blur-[200px]" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="show" variants={fadeUpLarge}>
            <p className="text-xs font-bold tracking-[0.4em] text-orange-400 uppercase mb-6">Capabilities</p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[0.9]">
              BUILT FOR THE <br />
              <span className="text-orange-500 italic">NEXT GEN</span> LEAGUE
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Professional tools designed to empower organizers, referees, and players.
              Everything you need to run an elite competition.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-2xl hover:shadow-orange-500/5 border border-transparent hover:border-orange-100 transition-all"
              >
                <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Showcase */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-orange-500 uppercase mb-4">Real-time Control</p>
            <h2 className="text-3xl font-bold tracking-tight mb-6">The Referee Pilot Panel.</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Our proprietary referee interface is designed for high-pressure pitch-side action.
              Large touch targets, adaptive high-contrast mode, and offline-resilience ensure
              the data remains accurate even in the toughest conditions.
            </p>
            <ul className="space-y-4">
              {['Goal & Card management', 'Live timer & stoppage tracking', 'Immediate standings updates', 'Direct player substitutions'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border-8 border-gray-800">
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-gray-800 tracking-widest uppercase rotate-90 whitespace-nowrap">
              REFEREE PANEL PREVIEW
            </div>
            <div className="absolute inset-4 rounded-xl bg-gray-800 flex flex-col p-6 space-y-4">
              <div className="h-2 w-12 bg-gray-700 rounded-full mx-auto" />
              <div className="h-12 w-full bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500 font-bold text-xs uppercase tracking-widest">Live: 72'</div>
              <div className="flex-1 rounded-lg bg-gray-900/50 p-4 space-y-3">
                <div className="h-4 w-1/2 bg-gray-700 rounded" />
                <div className="h-10 w-full bg-white rounded flex items-center justify-center text-gray-900 font-black text-xl">2 — 1</div>
                <div className="h-4 w-1/3 bg-gray-700 rounded ml-auto" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 bg-green-600 rounded-xl" />
                <div className="h-20 bg-yellow-500 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-24 bg-white border-t border-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <Image src="/static/branding/logo-circle.png" alt="Plyaz" width={24} height={24} />
            <span className="text-xs font-bold tracking-[0.2em] uppercase">PLYAZ &copy; 2025</span>
          </div>
          <div className="flex gap-8">
            {['About', 'Matches', 'Terms', 'Privacy'].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-orange-500 transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
