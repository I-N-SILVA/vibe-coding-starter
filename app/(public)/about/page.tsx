'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PageLayout, PageHeader, Card, CardContent } from '@/components/plyaz';
import { publicNavItems } from '@/lib/constants/navigation';

export default function AboutPage() {
    return (
        <PageLayout navItems={publicNavItems} title="ABOUT PLYAZ">
            <PageHeader
                label="Our Mission"
                title="Keeping Football Dreams Alive"
                description="10,000+ players are released from professional academies each year. Most disappear from the game. PLYAZ exists to ensure no talent is forgotten."
            />

            {/* Story */}
            <section className="mt-20">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 gap-16 items-center"
                    >
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-4">The Problem</p>
                            <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-6 uppercase leading-none">Every year, thousands are left behind.</h2>
                            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4 text-sm font-medium">
                                When professional clubs release young players, their careers often stall. Without visibility,
                                structured competition, or digital presence, talented athletes lose their connection to the sport.
                            </p>
                            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-sm font-medium">
                                PLYAZ bridges that gap — providing professional-grade tournament management, real-time statistics,
                                and a platform that keeps players visible to scouts, coaches, and fans.
                            </p>
                        </div>
                        <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 group">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <Image
                                src="/static/branding/footballer.png"
                                alt="Plyaz Athlete"
                                fill
                                className="object-contain p-8 group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="mt-32">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-4">Core Protocol</p>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Our Values</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                num: '01',
                                title: 'Spotlight',
                                desc: 'Every player deserves visibility. We create digital profiles and performance data that keep athletes on the radar.',
                            },
                            {
                                num: '02',
                                title: 'Support',
                                desc: 'Fans, sponsors, and partners fuel the comeback with structured support, mentoring, and community engagement.',
                            },
                            {
                                num: '03',
                                title: 'Success',
                                desc: 'Success pays forward — when players advance, the ecosystem that supported them grows stronger.',
                            },
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="relative p-8 rounded-[2rem] bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800 hover:border-orange-500/30 transition-colors group"
                            >
                                <span className="absolute top-4 right-8 text-5xl font-black text-neutral-200/50 dark:text-neutral-800/50 group-hover:text-orange-500/10 transition-colors">{value.num}</span>
                                <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase mb-4 tracking-tight">{value.title}</h3>
                                <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed font-medium">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="mt-32 text-center pb-20">
                <p className="text-[10px] font-bold tracking-[0.3em] text-neutral-300 dark:text-neutral-600 uppercase mb-12">Validated Network Partners</p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 dark:opacity-20 grayscale hover:opacity-80 transition-all duration-700">
                    <Image src="/static/branding/rise-logo.png" alt="Rise" width={100} height={40} className="h-6 object-contain dark:invert" />
                    <Image src="/static/branding/arden-logo.png" alt="Arden University" width={120} height={40} className="h-8 object-contain dark:invert" />
                    <Image src="/static/branding/gs-logo.png" alt="Grant Sports" width={100} height={40} className="h-6 object-contain dark:invert" />
                </div>
            </section>
        </PageLayout>
    );
}
