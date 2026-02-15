'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { NavIcons } from '@/components/plyaz/navigation';

const features = [
    {
        title: 'Precision Analytics',
        description: 'Every goal, card, and substitution tracked with millisecond accuracy.',
        metric: '99.9%',
        metricLabel: 'Capture Rate',
        icon: NavIcons.Trophy,
    },
    {
        title: 'Instant Distribution',
        description: 'Results and standings updated globally within seconds of the final whistle.',
        metric: '< 2.0s',
        metricLabel: 'Sync Time',
        icon: NavIcons.Matches,
    },
    {
        title: 'Secure Governance',
        description: 'Enterprise-grade security for player data and organizational privacy.',
        metric: 'AES-256',
        metricLabel: 'Encryption',
        icon: NavIcons.Settings,
    },
    {
        title: 'Infinite Scale',
        description: 'Built on high-performance infrastructure to handle thousands of concurrent matches.',
        metric: '100k+',
        metricLabel: 'Live Events',
        icon: NavIcons.Analytics,
    },
];

export const MetricFeatureGrid = () => {
    return (
        <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-24">
                    <h2 className="text-[10px] font-black tracking-[0.3em] text-black/30 uppercase mb-4">
                        Engineered for Performance
                    </h2>
                    <p className="text-4xl md:text-5xl font-black tracking-tight text-black max-w-3xl uppercase leading-[0.9]">
                        The data layer of modern football management.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-black/5 divide-x divide-y divide-black/5">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="p-10 group hover:bg-black transition-colors duration-500"
                        >
                            <div className="mb-12">
                                <span className="text-[10px] font-black tracking-widest text-black/20 uppercase group-hover:text-white/20 transition-colors">
                                    Feature_{i.toString().padStart(2, '0')}
                                </span>
                            </div>

                            <div className="h-12 w-12 rounded-xl bg-black/5 flex items-center justify-center mb-8 group-hover:bg-white/10 transition-colors">
                                <feature.icon className="w-6 h-6 text-black group-hover:text-white transition-colors" />
                            </div>

                            <h3 className="text-xl font-black text-black uppercase mb-4 group-hover:text-white transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-12 group-hover:text-white/50 transition-colors leading-relaxed">
                                {feature.description}
                            </p>

                            <div className="mt-auto border-t border-black/5 pt-8 group-hover:border-white/10 transition-colors">
                                <div className="text-3xl font-black text-black group-hover:text-white transition-colors">
                                    {feature.metric}
                                </div>
                                <div className="text-[10px] font-bold tracking-widest text-black/40 uppercase group-hover:text-white/40 transition-colors mt-2">
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
