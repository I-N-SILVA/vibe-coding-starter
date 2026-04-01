'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { NavIcons } from '@/components/plyaz/navigation';

/* ─── Animated Counter ─── */
const AnimCounter = ({ target, suffix = '' }: { target: string; suffix?: string }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const [val, setVal] = useState('0');

    useEffect(() => {
        if (!inView) return;
        const num = parseFloat(target.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) { setVal(target); return; }
        let cur = 0;
        const isFloat = target.includes('.');
        const step = Math.max(isFloat ? 0.1 : 1, num / 35);
        const timer = setInterval(() => {
            cur += step;
            if (cur >= num) { setVal(target); clearInterval(timer); }
            else setVal(isFloat ? cur.toFixed(1) : Math.floor(cur).toLocaleString());
        }, 30);
        return () => clearInterval(timer);
    }, [inView, target]);

    return <span ref={ref}>{val}{suffix}</span>;
};

const features = [
    {
        title: 'Precision Analytics',
        description: 'Every goal, card, and substitution tracked with millisecond accuracy.',
        metric: '99.9',
        metricSuffix: '%',
        metricLabel: 'Capture Rate',
        icon: NavIcons.Trophy,
        accent: 'from-orange-500 to-amber-500',
        accentBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    },
    {
        title: 'Instant Distribution',
        description: 'Results and standings updated globally within seconds of the final whistle.',
        metric: '< 2.0',
        metricSuffix: 's',
        metricLabel: 'Sync Time',
        icon: NavIcons.Matches,
        accent: 'from-blue-500 to-indigo-500',
        accentBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    },
    {
        title: 'Secure Governance',
        description: 'Enterprise-grade security for player data and organizational privacy.',
        metric: 'AES-256',
        metricSuffix: '',
        metricLabel: 'Encryption',
        icon: NavIcons.Settings,
        accent: 'from-emerald-500 to-teal-500',
        accentBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    },
    {
        title: 'Infinite Scale',
        description: 'Built on high-performance infrastructure to handle thousands of concurrent matches.',
        metric: '100',
        metricSuffix: 'k+',
        metricLabel: 'Live Events',
        icon: NavIcons.Analytics,
        accent: 'from-violet-500 to-purple-500',
        accentBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    },
];

export const MetricFeatureGrid = () => {
    return (
        <section className="py-28 md:py-36 bg-neutral-50/80 dark:bg-neutral-900/50" data-testid="features-section">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 md:mb-20"
                >
                    <h2 className="text-[11px] font-semibold tracking-[0.25em] text-neutral-400 dark:text-neutral-500 uppercase mb-4">
                        Engineered for Performance
                    </h2>
                    <p className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white max-w-3xl uppercase leading-[0.92]">
                        The data layer of modern football management.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            data-testid={`feature-card-${i}`}
                            className="group relative bg-white dark:bg-neutral-800/50 rounded-2xl p-7 border border-neutral-200/60 dark:border-neutral-700/50 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-500 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1"
                        >
                            {/* Gradient accent line */}
                            <div className={`absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r ${feature.accent} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className={`h-11 w-11 rounded-xl ${feature.accentBg} flex items-center justify-center mb-6`}>
                                <feature.icon className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
                            </div>

                            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8">
                                {feature.description}
                            </p>

                            <div className="pt-5 border-t border-neutral-100 dark:border-neutral-700/50">
                                <div className="text-2xl font-black text-neutral-900 dark:text-white tabular-nums">
                                    <AnimCounter target={feature.metric} suffix={feature.metricSuffix} />
                                </div>
                                <div className="text-[10px] font-semibold tracking-[0.15em] text-neutral-400 dark:text-neutral-500 uppercase mt-1">
                                    {feature.metricLabel}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
