'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Button,
    NavIcons,
} from '@/components/plyaz';
import Image from 'next/image';
import Link from 'next/link';
import { SportsTechHero } from '@/components/landing/SportsTechHero';
import { MetricFeatureGrid } from '@/components/landing/MetricFeatureGrid';
import { RolePreview } from '@/components/landing/RolePreview';
import { ThemeToggle } from '@/components/plyaz';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 selection:bg-orange-500/20 selection:text-orange-900 dark:selection:text-orange-200" data-testid="landing-page">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3.5 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-2xl border-b border-neutral-100 dark:border-neutral-800/50" data-testid="landing-nav">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group" data-testid="logo-link">
                        <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                            <NavIcons.Trophy className="text-white dark:text-neutral-900 w-4 h-4" />
                        </div>
                        <span className="text-sm font-black tracking-[0.2em] text-neutral-900 dark:text-white">
                            PLYAZ
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-10">
                        <div className="flex items-center gap-7 text-[11px] font-semibold tracking-[0.1em] text-neutral-400 dark:text-neutral-500 uppercase">
                            <Link href="/about" className="hover:text-neutral-900 dark:hover:text-white transition-colors duration-200" data-testid="nav-protocol">Protocol</Link>
                            <Link href="/league/public/matches" className="hover:text-neutral-900 dark:hover:text-white transition-colors duration-200" data-testid="nav-live-data">Live Data</Link>
                            <Link href="/contact" className="hover:text-neutral-900 dark:hover:text-white transition-colors duration-200" data-testid="nav-access">Access</Link>
                        </div>
                        <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-700" />
                        <ThemeToggle />
                        <Link href="/login" className="text-[11px] font-semibold tracking-[0.1em] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white uppercase transition-colors" data-testid="nav-signin">Sign In</Link>
                        <Link
                            href="/login?mode=signup"
                            data-testid="nav-create-league-btn"
                            className="h-9 px-5 inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-semibold tracking-[0.1em] rounded-lg hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                        >
                            CREATE LEAGUE
                        </Link>
                    </div>

                    {/* Mobile controls */}
                    <div className="md:hidden flex items-center gap-3">
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            data-testid="mobile-menu-btn"
                        >
                            <div className="w-5 h-4 flex flex-col justify-between">
                                <span className={`block h-[2px] w-5 bg-neutral-900 dark:bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                                <span className={`block h-[2px] w-5 bg-neutral-900 dark:bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                                <span className={`block h-[2px] w-5 bg-neutral-900 dark:bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed inset-0 z-40 bg-white dark:bg-neutral-950 pt-24 px-6 md:hidden"
                    >
                        <nav className="flex flex-col gap-6">
                            {[
                                { label: 'Protocol', href: '/about' },
                                { label: 'Live Data', href: '/league/public/matches' },
                                { label: 'Access', href: '/contact' },
                                { label: 'Sign In', href: '/login' },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white uppercase"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Button
                                fullWidth
                                size="lg"
                                className="h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold tracking-[0.15em] rounded-xl mt-4 shadow-lg shadow-orange-500/20"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    router.push('/login?mode=signup');
                                }}
                            >
                                CREATE YOUR LEAGUE
                            </Button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            <main>
                <SportsTechHero />

                {/* Partner Band */}
                <section className="py-10 border-y border-neutral-100 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/30" data-testid="partner-band">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 dark:opacity-30 grayscale hover:opacity-70 dark:hover:opacity-50 hover:grayscale-0 transition-all duration-700">
                            <Image src="/static/branding/rise-logo.png" alt="Rise" width={100} height={40} className="h-6 object-contain dark:invert" />
                            <Image src="/static/branding/arden-logo.png" alt="Arden University" width={120} height={40} className="h-8 object-contain dark:invert" />
                            <Image src="/static/branding/gs-logo.png" alt="Grant Sports" width={100} height={40} className="h-6 object-contain dark:invert" />
                            <div className="text-[10px] font-semibold tracking-[0.2em] text-neutral-900 dark:text-neutral-100 uppercase">TRUSTED PROTOCOL</div>
                        </div>
                    </div>
                </section>

                <RolePreview />
                <MetricFeatureGrid />

                {/* Global Statistics Section */}
                <section className="py-28 md:py-36 bg-neutral-900 dark:bg-neutral-950 text-white relative overflow-hidden" data-testid="stats-section">
                    <div
                        className="absolute inset-0 opacity-[0.06] pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)`,
                            backgroundSize: '28px 28px'
                        }}
                    />
                    <motion.div
                        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04]"
                        style={{ background: 'radial-gradient(circle, #FF5C1A 0%, transparent 70%)' }}
                    />

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-[11px] font-semibold tracking-[0.25em] text-white/30 uppercase mb-6">
                                    Network Statistics
                                </h2>
                                <h3 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase leading-[0.9] mb-8">
                                    Validated <br /> by the numbers.
                                </h3>
                                <p className="text-base text-white/40 max-w-md font-medium leading-relaxed">
                                    A global network of organizers, players, and fans operating on a unified data standard.
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { label: 'Matches Processed', value: '24k+', sub: 'Precision Tracking' },
                                    { label: 'Active Talents', value: '1.2k+', sub: 'Validated Profiles' },
                                    { label: 'Leagues Active', value: '48', sub: 'Global Deployment' },
                                    { label: 'Uptime Protocol', value: '99.9%', sub: 'High Availability' }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-6 border border-white/[0.06] hover:border-white/[0.12] transition-colors duration-300"
                                        data-testid={`stat-card-${i}`}
                                    >
                                        <div className="text-3xl md:text-4xl font-black text-white mb-2 tabular-nums">{stat.value}</div>
                                        <div className="text-[10px] font-semibold tracking-[0.15em] text-white/40 uppercase mb-1">{stat.label}</div>
                                        <div className="text-[9px] font-medium tracking-[0.1em] text-white/20 uppercase">{stat.sub}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 md:py-40 bg-white dark:bg-neutral-950 text-center relative overflow-hidden" data-testid="cta-section">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-orange-500/5 to-amber-500/5 blur-3xl" />
                    </div>
                    <div className="max-w-4xl mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-[11px] font-semibold tracking-[0.25em] text-neutral-400 dark:text-neutral-500 uppercase mb-6">
                                Ready to Deploy?
                            </h2>
                            <h3 className="text-4xl md:text-7xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase leading-[0.85] mb-10">
                                START YOUR <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">LEGACY NOW.</span>
                            </h3>
                            <Button
                                size="lg"
                                data-testid="cta-create-league-btn"
                                className="h-16 px-10 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold tracking-[0.2em] rounded-xl hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1"
                                onClick={() => router.push('/login?mode=signup')}
                            >
                                CREATE YOUR LEAGUE
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-16 px-6 border-t border-neutral-100 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/30" data-testid="landing-footer">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
                        <div className="col-span-1">
                            <div className="flex items-center gap-2.5 mb-6">
                                <div className="w-7 h-7 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center">
                                    <NavIcons.Trophy className="text-white dark:text-neutral-900 w-3.5 h-3.5" />
                                </div>
                                <span className="text-sm font-black tracking-[0.2em] text-neutral-900 dark:text-white">PLYAZ</span>
                            </div>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed max-w-[200px]">
                                Performance Standard for Football Management.
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
                                <h5 className="text-[10px] font-semibold tracking-[0.2em] text-neutral-300 dark:text-neutral-600 uppercase mb-5">{col.title}</h5>
                                <ul className="space-y-3">
                                    {col.links.map((link, j) => (
                                        <li key={j}>
                                            {link.h.startsWith('http') ? (
                                                <a href={link.h} className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                                                    {link.l}
                                                </a>
                                            ) : (
                                                <Link href={link.h} className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                                                    {link.l}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-neutral-200/50 dark:border-neutral-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] font-medium tracking-[0.15em] text-neutral-300 dark:text-neutral-600 uppercase">
                            &copy; 2026 PLYAZ. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-[10px] font-medium tracking-[0.1em] text-neutral-300 dark:text-neutral-600 uppercase">
                            <span>BUILD 2026.04.14</span>
                            <a href="mailto:help@plyaz.co.uk" className="hover:text-neutral-900 dark:hover:text-white transition-colors">CONTACT</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
