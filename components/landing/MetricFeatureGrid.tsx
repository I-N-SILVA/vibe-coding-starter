'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Shield,
    Users,
    Trophy,
} from 'lucide-react';

interface MetricFeature {
    title: string;
    description: string;
    metric: string;
    metricLabel: string;
    icon: React.ElementType;
    accent: string;
    accentBg: string;
}

const features: MetricFeature[] = [
    {
        title: 'League Management',
        description: 'Automate your entire tournament cycle from registration to the final trophy presentation.',
        metric: '10k+',
        metricLabel: 'Leagues managed',
        icon: Trophy,
        accent: 'from-orange-500 to-orange-600',
        accentBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    },
    {
        title: 'Player Performance',
        description: 'High-fidelity statistics tracking for every player, including heatmaps and minute-by-minute logs.',
        metric: '99.9%',
        metricLabel: 'Data accuracy',
        icon: Activity,
        accent: 'from-black to-neutral-800',
        accentBg: 'bg-black/5 dark:bg-white/5',
    },
    {
        title: 'Safety & Verification',
        description: 'Digital ID checks and official match protocols to ensure tournament integrity.',
        metric: 'Secure',
        metricLabel: 'Verified protocols',
        icon: Shield,
        accent: 'from-orange-400 to-orange-500',
        accentBg: 'bg-orange-400/10 dark:bg-orange-400/20',
    },
    {
        title: 'Community Access',
        description: 'Connect talent with scouts and teams through our integrated recruitment marketplace.',
        metric: 'Elite',
        metricLabel: 'Talent network',
        icon: Users,
        accent: 'from-neutral-900 to-black',
        accentBg: 'bg-black/10 dark:bg-white/10',
    },
];

export const MetricFeatureGrid: React.FC = () => {
    return (
        <section className="py-24 md:py-32 bg-white dark:bg-black overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="relative group p-8 rounded-[32px] border border-neutral-100 dark:border-white/5 hover:border-orange-500/20 transition-all duration-500"
                        >
                            <div className={`w-12 h-12 rounded-2xl ${feature.accentBg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                <feature.icon className="w-6 h-6 text-orange-500" />
                            </div>
                            
                            <div className="mb-4">
                                <span className={`text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br ${feature.accent}`}>
                                    {feature.metric}
                                </span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-1">
                                    {feature.metricLabel}
                                </p>
                            </div>

                            <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900 dark:text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
