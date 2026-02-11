'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
} from '@/components/plyaz';
import Image from 'next/image';

/**
 * PLYAZ Landing Page
 * Professional, minimal, high-impact entry point
 */

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-elevated">
      {/* Top Navigation with Logo */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 bg-surface-elevated/80 backdrop-blur-lg border-b border-secondary-main/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 md:gap-3 group">
            <Image
              src="/static/branding/logo-circle.png"
              alt="Plyaz"
              width={32}
              height={32}
              className="transition-transform duration-300 group-hover:scale-110 md:w-9 md:h-9"
            />
            <span className="text-sm font-bold tracking-[0.2em] text-secondary-main uppercase">
              PLYAZ
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary-main/50">
            <a href="/about" className="hover:text-accent-main transition-colors">About</a>
            <a href="/league/public/matches" className="hover:text-accent-main transition-colors">Matches</a>
            <a href="/contact" className="hover:text-accent-main transition-colors">Contact</a>
            <a href="/login" className="hover:text-accent-main transition-colors">Sign In</a>
            <a
              href="/league/create"
              className="px-5 py-2 bg-accent-main text-white font-bold rounded-full text-xs tracking-widest hover:bg-accent-dark transition-colors"
            >
              START A LEAGUE
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2 rounded-lg hover:bg-secondary-main/5 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 w-6 bg-secondary-main transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[9px]' : ''}`} />
              <span className={`block h-0.5 w-6 bg-secondary-main transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 bg-secondary-main transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-surface-elevated/98 backdrop-blur-xl md:hidden flex flex-col items-center justify-center"
          >
            <nav className="flex flex-col items-center gap-6 text-center">
              {[
                { label: 'About', href: '/about' },
                { label: 'Matches', href: '/league/public/matches' },
                { label: 'Teams', href: '/league/public/teams' },
                { label: 'Contact', href: '/contact' },
                { label: 'Sign In', href: '/login' },
              ].map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-2xl font-bold tracking-wider text-secondary-main hover:text-accent-main transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="/league/create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 px-8 py-4 bg-accent-main text-white font-bold rounded-full text-sm tracking-widest hover:bg-accent-dark transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                START A LEAGUE
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative px-4 pt-32 pb-32 md:pt-48 md:pb-64 overflow-hidden bg-primary-main">
        {/* Massive Background Text for Depth */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.03]">
          <span className="text-[40vw] font-black tracking-tighter text-white leading-none whitespace-nowrap">
            ELEVATE
          </span>
        </div>

        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] right-[-10%] w-[70%] h-[90%] bg-accent-main/10 rounded-full blur-[140px]"
          />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] bg-white/5 rounded-full blur-[100px]" />

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-12"
            >
              <span className="w-2 h-2 rounded-full bg-accent-main animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] text-white/60 uppercase">
                The New Standard of Competition
              </span>
            </motion.div>

            <div className="relative mb-12">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-7xl md:text-[11rem] font-black tracking-tight text-white leading-[0.85] uppercase"
              >
                Keep <br />
                <span className="relative inline-block">
                  Football
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 1, duration: 1, ease: 'easeInOut' }}
                    className="absolute bottom-4 left-0 h-4 bg-accent-main/30 -z-10"
                  />
                </span> <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-main to-accent-dark italic tracking-tighter">
                  Dreams
                </span> <br />
                Alive
              </motion.h1>

              {/* Decorative side text */}
              <div className="hidden xl:block absolute -right-24 top-1/2 -translate-y-1/2 rotate-90 origin-center">
                <span className="text-[10px] font-black tracking-[0.5em] text-white/20 uppercase whitespace-nowrap">
                  EST. TWENTY TWENTY FIVE — PLYAZ NETWORK
                </span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <p className="text-lg md:text-2xl text-white/50 mb-12 leading-relaxed">
                10,000+ players are released each year. <br className="hidden md:block" />
                <span className="font-bold text-white">PLYAZ</span> bridges the gap, turning every dropout into a comeback.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button
                  size="lg"
                  className="h-16 px-12 text-lg font-black bg-accent-main hover:bg-accent-dark text-white rounded-none skew-x-[-12deg] transition-all duration-300 hover:scale-105 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-none"
                  onClick={() => window.open('https://community.plyaz.co.uk/', '_blank')}
                >
                  <span className="skew-x-[12deg]">JOIN THE NETWORK</span>
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-16 px-12 text-lg font-black border-2 border-white/10 text-white hover:bg-white hover:text-black rounded-none skew-x-[-12deg] transition-all duration-300"
                  onClick={() => router.push('/league')}
                >
                  <span className="skew-x-[12deg]">EXPLORE LEAGUES</span>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <div className="w-px h-12 bg-gradient-to-b from-accent-main to-transparent" />
        </motion.div>
      </section>

      {/* Partners Section */}
      <section className="py-12 border-y border-secondary-main/5 bg-surface-main/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold tracking-[0.3em] text-secondary-main/30 uppercase mb-8">
            Our Partners
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <Image src="/static/branding/rise-logo.png" alt="Rise" width={100} height={40} className="h-8 object-contain" />
            <Image src="/static/branding/arden-logo.png" alt="Arden University" width={120} height={40} className="h-10 object-contain" />
            <Image src="/static/branding/gs-logo.png" alt="Grant Sports" width={100} height={40} className="h-8 object-contain" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Matches Played", value: "2,400+", suffix: "Elite Games" },
              { label: "Players Connected", value: "1,200+", suffix: "Active Talents" },
              { label: "Leagues Managed", value: "48", suffix: "Global Reach" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-panel p-8 rounded-[2rem] text-center group hover:bg-surface-main transition-colors duration-500"
              >
                <div className="text-4xl font-bold text-primary-main mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-bold tracking-widest text-accent-main uppercase mb-4 opacity-70">
                  {stat.label}
                </div>
                <div className="text-xs text-secondary-main/40 font-medium">
                  {stat.suffix}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-secondary-main -skew-y-3 origin-right h-[120%] -translate-y-1/2 -z-20 opacity-5" />
      </section>

      {/* Trust Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-primary-main mb-8 tracking-tight">
            Aligned with the football community
          </h3>
          <p className="text-xl text-secondary-main/50 mb-16 max-w-2xl mx-auto leading-relaxed">
            PLYAZ complements the work of academies, player-care teams, and community trusts — extending support beyond release and keeping players connected to the game.
          </p>
          <Button
            size="lg"
            className="h-14 px-10 text-lg font-bold bg-primary-main text-white hover:bg-black rounded-full mb-20"
            onClick={() => window.open('https://community.plyaz.co.uk/', '_blank')}
          >
            JOIN US FOR FREE
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            {[
              { title: "Spotlight", desc: "Fans and partners fuel the comeback with targeted support.", num: "01" },
              { title: "Support", desc: "Fans and partners fuel the comeback with targeted support.", num: "02" },
              { title: "Success", desc: "Success pays forward—players advance, backers gain rewards.", num: "03" }
            ].map((item, i) => (
              <div key={i} className="relative p-8 rounded-3xl bg-secondary-main/5 border border-secondary-main/5">
                <span className="absolute top-4 right-6 text-5xl font-black text-secondary-main/10">{item.num}</span>
                <h4 className="text-xl font-bold mb-4">{item.title}</h4>
                <p className="text-secondary-main/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-24 px-6 border-t border-secondary-main/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Image src="/static/branding/logo.png" alt="Plyaz Logo" width={100} height={40} className="mb-6" />
            <p className="text-sm text-secondary-main/40 leading-relaxed">
              The future of sports. <br /> Turn your game into gain.
            </p>
          </div>

          <div>
            <h5 className="font-bold mb-6 text-xs tracking-widest uppercase text-secondary-main/30">Platform</h5>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="https://plyaz.net/#how-it-works" className="hover:text-accent-main transition-colors">How it works</a></li>
              <li><a href="https://plyaz.net/insights" className="hover:text-accent-main transition-colors">Insights</a></li>
              <li><a href="https://community.plyaz.co.uk/" className="hover:text-accent-main transition-colors">Join us</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-6 text-xs tracking-widest uppercase text-secondary-main/30">Social</h5>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="https://x.com/Plyaz_" className="hover:text-accent-main transition-colors">Twitter (X)</a></li>
              <li><a href="https://www.linkedin.com/company/plyaz" className="hover:text-accent-main transition-colors">LinkedIn</a></li>
              <li><a href="https://www.instagram.com/plyaz_/" className="hover:text-accent-main transition-colors">Instagram</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-6 text-xs tracking-widest uppercase text-secondary-main/30">Legal</h5>
            <ul className="space-y-4 text-sm font-medium text-secondary-main/40">
              <li><a href="https://plyaz.net/legal/privacy-policy" className="hover:text-secondary-main transition-colors">Privacy Policy</a></li>
              <li><a href="https://plyaz.net/legal/terms-of-service" className="hover:text-secondary-main transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-secondary-main/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold tracking-[0.2em] text-secondary-main/20 uppercase">
          <p>© 2025 PLYAZ. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="mailto:help@plyaz.co.uk">CONTACT</a>
            <a href="https://plyaz.gitbook.io/plyaz_25/">DESC</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
