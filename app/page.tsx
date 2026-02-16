'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  NavIcons,
} from '@/components/plyaz';
import Image from 'next/image';
import { SportsTechHero } from '@/components/landing/SportsTechHero';
import { MetricFeatureGrid } from '@/components/landing/MetricFeatureGrid';

/**
 * PLYAZ Landing Page - Ultra-Minimalist Sports Tech Revamp
 * High-performance, monochromatic, precision-driven design
 */

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white">
      {/* Precision Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black flex items-center justify-center transition-transform duration-500 group-hover:rotate-90">
              <NavIcons.Trophy className="text-white w-4 h-4" />
            </div>
            <span className="text-xs font-black tracking-[0.3em] text-black">
              PLYAZ
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12">
            <div className="flex items-center gap-8 text-[10px] font-black tracking-widest text-black/40 uppercase">
              <a href="/about" className="hover:text-black transition-colors">Protocol</a>
              <a href="/league/public/matches" className="hover:text-black transition-colors">Live Data</a>
              <a href="/contact" className="hover:text-black transition-colors">Access</a>
            </div>
            <div className="h-4 w-[1px] bg-black/10" />
            <a href="/login" className="text-[10px] font-black tracking-widest text-black/60 hover:text-black uppercase transition-colors">Sign In</a>
            <Button
              onClick={() => router.push('/login?mode=signup')}
              className="h-10 px-6 bg-black text-white text-[10px] font-black tracking-widest rounded-none hover:bg-gray-900 transition-colors"
            >
              INITIALIZE
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-[2px] w-6 bg-black transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[9px]' : ''}`} />
              <span className={`block h-[2px] w-6 bg-black transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-[2px] w-6 bg-black transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <nav className="flex flex-col gap-8">
              {[
                { label: 'Protocol', href: '/about' },
                { label: 'Live Data', href: '/league/public/matches' },
                { label: 'Access', href: '/contact' },
                { label: 'Sign In', href: '/login' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-4xl font-black tracking-tighter text-black uppercase"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button
                fullWidth
                size="lg"
                className="h-16 bg-black text-white text-sm font-black tracking-[0.2em] rounded-none mt-4"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/login?mode=signup');
                }}
              >
                INITIALIZE LEAGUE
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <SportsTechHero />

        {/* Precision Partner Band */}
        <section className="py-12 border-y border-black/5 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:opacity-100 transition-all duration-1000">
              <Image src="/static/branding/rise-logo.png" alt="Rise" width={100} height={40} className="h-6 object-contain" />
              <Image src="/static/branding/arden-logo.png" alt="Arden University" width={120} height={40} className="h-8 object-contain" />
              <Image src="/static/branding/gs-logo.png" alt="Grant Sports" width={100} height={40} className="h-6 object-contain" />
              <div className="text-[10px] font-black tracking-[0.3em] text-black">TRUSTED PROTOCOL</div>
            </div>
          </div>
        </section>

        <MetricFeatureGrid />

        {/* Global Statistics Section */}
        <section className="py-32 bg-black text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                <h2 className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase mb-8">
                  Network Statistics
                </h2>
                <h3 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase leading-[0.9] mb-12">
                  Validated <br /> by the numbers.
                </h3>
                <p className="text-lg text-white/50 max-w-md font-medium leading-relaxed">
                  A global network of organizers, players, and fans, operating on a unified data standard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                {[
                  { label: "Matches Processed", value: "24k+", sub: "Precision Tracking" },
                  { label: "Active Talents", value: "1.2k+", sub: "Validated Profiles" },
                  { label: "Leagues Active", value: "48", sub: "Global Deployment" },
                  { label: "Uptime Protocol", value: "99.9%", sub: "High Availability" }
                ].map((stat, i) => (
                  <div key={i} className="border-l border-white/10 pl-8 py-4">
                    <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                    <div className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-1">{stat.label}</div>
                    <div className="text-[8px] font-bold tracking-widest text-white/20 uppercase">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 bg-white text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-[10px] font-black tracking-[0.3em] text-black/30 uppercase mb-8">
              Ready to Deploy?
            </h2>
            <h3 className="text-5xl md:text-8xl font-black tracking-tighter text-black uppercase leading-[0.8] mb-12">
              START YOUR <br /> LEGACY NOW.
            </h3>
            <Button
              size="lg"
              className="h-20 px-12 bg-black text-white text-sm font-black tracking-[0.3em] rounded-none hover:bg-gray-900 transition-all duration-300"
              onClick={() => router.push('/login?mode=signup')}
            >
              INITIALIZE ENVIRONMENT
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-20 px-6 border-t border-black/5 bg-gray-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-6 h-6 bg-black flex items-center justify-center">
                  <NavIcons.Trophy className="text-white w-3 h-3" />
                </div>
                <span className="text-[10px] font-black tracking-[0.3em] text-black uppercase">PLYAZ</span>
              </div>
              <p className="text-[10px] font-bold text-black/40 tracking-widest uppercase leading-relaxed">
                Performance Standard <br /> for Football Management.
              </p>
            </div>

            {[
              {
                title: 'Protocol',
                links: [{ l: 'Network', h: '/about' }, { l: 'Matches', h: '/league/public/matches' }, { l: 'Terms', h: '/terms' }]
              },
              {
                title: 'Social',
                links: [{ l: 'X / Twitter', h: 'https://x.com/Plyaz_' }, { l: 'LinkedIn', h: 'https://www.linkedin.com/company/plyaz' }, { l: 'Instagram', h: 'https://www.instagram.com/plyaz_/' }]
              },
              {
                title: 'Legal',
                links: [{ l: 'Privacy', h: '/privacy' }, { l: 'Cookies', h: '/cookies' }, { l: 'Security', h: '/security' }]
              }
            ].map((col, i) => (
              <div key={i}>
                <h5 className="text-[10px] font-black tracking-widest text-black/20 uppercase mb-8">{col.title}</h5>
                <ul className="space-y-4">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href={link.h} className="text-[10px] font-black tracking-widest text-black/60 hover:text-black uppercase transition-colors">
                        {link.l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black tracking-[0.3em] text-black/20 uppercase">
              © 2026 PLYAZ. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-8 text-[10px] font-black tracking-widest text-black/20 uppercase">
              <span>BUILD 2026.04.14</span>
              <a href="mailto:help@plyaz.co.uk" className="hover:text-black transition-colors">CONTACT_ROOT</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
