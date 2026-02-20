'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { fadeUpLarge } from '@/lib/animations';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative px-6 py-32 bg-gray-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[80%] bg-orange-500 rounded-full blur-[200px]" />
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div initial="hidden" animate="show" variants={fadeUpLarge}>
                        <p className="text-xs font-bold tracking-[0.4em] text-orange-400 uppercase mb-6">Our Mission</p>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[0.9]">
                            KEEPING FOOTBALL <br />
                            <span className="text-orange-500 italic">DREAMS</span> ALIVE
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            10,000+ players are released from professional academies each year. Most disappear from the game.
                            PLYAZ exists to ensure no talent is forgotten.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Story */}
            <section className="px-6 py-24">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 gap-16 items-center"
                    >
                        <div>
                            <p className="text-xs font-bold tracking-[0.3em] text-orange-500 uppercase mb-4">The Problem</p>
                            <h2 className="text-3xl font-bold tracking-tight mb-6">Every year, thousands are left behind.</h2>
                            <p className="text-gray-500 leading-relaxed mb-4">
                                When professional clubs release young players, their careers often stall. Without visibility,
                                structured competition, or digital presence, talented athletes lose their connection to the sport.
                            </p>
                            <p className="text-gray-500 leading-relaxed">
                                PLYAZ bridges that gap — providing professional-grade tournament management, real-time statistics,
                                and a platform that keeps players visible to scouts, coaches, and fans.
                            </p>
                        </div>
                        <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-100">
                            <Image
                                src="/static/branding/footballer.png"
                                alt="Plyaz Athlete"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="px-6 py-24 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-xs font-bold tracking-[0.3em] text-orange-500 uppercase mb-4">What Drives Us</p>
                        <h2 className="text-3xl font-bold tracking-tight">Our Values</h2>
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
                                className="relative p-8 rounded-2xl bg-white border border-gray-100"
                            >
                                <span className="absolute top-4 right-6 text-5xl font-black text-gray-100">{value.num}</span>
                                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="px-6 py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase mb-8">Our Partners</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60">
                        <Image src="/static/branding/rise-logo.png" alt="Rise" width={100} height={40} className="h-8 object-contain" />
                        <Image src="/static/branding/arden-logo.png" alt="Arden University" width={120} height={40} className="h-10 object-contain" />
                        <Image src="/static/branding/gs-logo.png" alt="Grant Sports" width={100} height={40} className="h-8 object-contain" />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24 bg-gray-900 text-white text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">Ready to join the movement?</h2>
                    <p className="text-gray-400 mb-10">Join a community of players, coaches, and fans who believe every footballer deserves a chance.</p>
                    <a
                        href="https://community.plyaz.co.uk/"
                        className="inline-block px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full text-sm tracking-widest transition-colors"
                    >
                        JOIN US FOR FREE
                    </a>
                </div>
            </section>
        </div>
    );
}
