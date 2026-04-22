'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/plyaz';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

/* ─── Animated Grid Background ─── */
const GridBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
            style={{
                backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
                backgroundSize: '48px 48px',
            }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-neutral-950" />
        <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
                background: 'radial-gradient(circle, rgba(255,92,26,0.06) 0%, transparent 70%)',
            }}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        />
    </div>
);

/* ─── Animated Text Reveal ─── */
const TextReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <div className="overflow-hidden">
        <motion.div
            initial={{ y: '110%', rotateX: -15 }}
            animate={{ y: 0, rotateX: 0 }}
            transition={{
                duration: 0.9,
                delay,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            {children}
        </motion.div>
    </div>
);

/* ─── Gradient Text ─── */
const GradientText = ({ children }: { children: React.ReactNode }) => (
    <span className="relative">
        <span className="text-transparent bg-clip-text bg-plyaz-gradient">
            {children}
        </span>
    </span>
);

/* ─── Floating Badge ─── */
const StatusBadge = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full 
            bg-white dark:bg-slate-900 
            border border-slate-200 dark:border-slate-800
            shadow-lg shadow-black/5 dark:shadow-black/20"
    >
        <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span className="text-[11px] font-bold tracking-[0.15em] text-slate-600 dark:text-slate-400 uppercase">
            Performance Protocol 01
        </span>
    </motion.div>
);

/* ─── Animated Counter ─── */
const AnimatedNumber = ({ value, suffix = '' }: { value: string; suffix?: string }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const [display, setDisplay] = useState('0');

    useEffect(() => {
        if (!inView) return;
        const num = parseInt(value.replace(/[^0-9]/g, ''));
        if (isNaN(num)) {
            setDisplay(value);
            return;
        }
        let current = 0;
        const step = Math.max(1, Math.floor(num / 40));
        const timer = setInterval(() => {
            current += step;
            if (current >= num) {
                setDisplay(value);
                clearInterval(timer);
            } else {
                setDisplay(current.toLocaleString());
            }
        }, 30);
        return () => clearInterval(timer);
    }, [inView, value]);

    return (
        <span ref={ref}>
            {display}{suffix}
        </span>
    );
};

/* ─── Main Hero ─── */
export const SportsTechHero = () => {
    const router = useRouter();

    return (
        <section className="relative min-h-[92vh] flex flex-col items-center justify-center bg-white dark:bg-neutral-950 overflow-hidden pt-20" data-testid="hero-section">
            <GridBackground />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">
                <StatusBadge />

                <div className="mt-10 mb-10">
                    <TextReveal delay={0.1}>
                        <h1 className="text-[clamp(2.8rem,9vw,7.5rem)] leading-[0.88] font-black tracking-[-0.04em] text-neutral-900 dark:text-white uppercase">
                            Propelling
                        </h1>
                    </TextReveal>
                    <TextReveal delay={0.2}>
                        <h1 className="text-[clamp(2.8rem,9vw,7.5rem)] leading-[0.88] font-black tracking-[-0.04em] uppercase">
                            <GradientText>Elite Talent</GradientText>
                        </h1>
                    </TextReveal>
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="max-w-xl mx-auto text-base md:text-lg text-neutral-500 dark:text-neutral-400 font-medium mb-12 leading-relaxed"
                >
                    Precision league management for the next generation of football.
                    Streamlined, data-driven, and built for speed.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="/login?mode=signup"
                        data-testid="hero-create-league-btn"
                        className="h-14 px-8 text-xs font-bold tracking-[0.15em] rounded-xl border-0 bg-plyaz-gradient text-white hover:opacity-90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center justify-center"
                    >
                        CREATE YOUR LEAGUE
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                    <Button
                        variant="ghost"
                        size="lg"
                        data-testid="hero-explore-btn"
                        className="h-14 px-8 text-xs font-bold tracking-[0.15em] rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-300"
                        onClick={() => router.push('/league/public/matches')}
                    >
                        EXPLORE DATA
                    </Button>
                </motion.div>

                {/* Floating Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
                >
                    {[
                        { value: '24', suffix: 'k+', label: 'Matches' },
                        { value: '1200', suffix: '+', label: 'Players' },
                        { value: '99.9', suffix: '%', label: 'Uptime' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white tabular-nums">
                                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="text-[10px] font-semibold tracking-[0.2em] text-neutral-400 dark:text-neutral-500 uppercase mt-1">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Bottom accents */}
            <div className="absolute bottom-8 left-8 hidden lg:block">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="flex items-center gap-3 text-[10px] font-semibold tracking-widest text-neutral-300 dark:text-neutral-600 uppercase"
                >
                    <span className="w-8 h-[1px] bg-neutral-300 dark:bg-neutral-700" />
                    System Optimized
                </motion.div>
            </div>

            <div className="absolute bottom-8 right-8 hidden lg:block text-right">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-[10px] font-semibold tracking-widest text-neutral-300 dark:text-neutral-600 uppercase"
                >
                    51.5074° N, 0.1278° W
                    <div className="w-12 h-[1px] bg-neutral-300 dark:bg-neutral-700 ml-auto mt-2" />
                </motion.div>
            </div>
        </section>
    );
};
