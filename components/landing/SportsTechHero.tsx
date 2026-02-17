'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/plyaz';
import { useRouter } from 'next/navigation';

export const SportsTechHero = () => {
    const router = useRouter();

    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center bg-white overflow-hidden pt-20">
            {/* Minimal Grid Background */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-[10px] font-black tracking-[0.2em] text-white uppercase mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                    </span>
                    Performance Protocol 01
                </motion.div>

                <div className="space-y-4 mb-12">
                    <div className="overflow-hidden">
                        <motion.h1
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[clamp(3rem,10vw,8rem)] leading-[0.9] font-black tracking-[-0.04em] text-black uppercase"
                        >
                            Propelling
                        </motion.h1>
                    </div>
                    <div className="overflow-hidden">
                        <motion.h1
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[clamp(3rem,10vw,8rem)] leading-[0.9] font-black tracking-[-0.04em] text-black uppercase"
                        >
                            Elite Talent
                        </motion.h1>
                    </div>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="max-w-2xl mx-auto text-base md:text-xl text-gray-400 font-medium mb-12 leading-relaxed"
                >
                    Precision league management for the next generation of football.
                    Streamlined, data-driven, and built for speed.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button
                        variant="primary"
                        size="lg"
                        className="h-16 px-10 text-xs font-black tracking-[0.2em] rounded-none border-2 border-black hover:bg-white hover:text-black transition-all duration-300"
                        onClick={() => router.push('/login?mode=signup')}
                    >
                        CREATE YOUR LEAGUE
                    </Button>
                    <Button
                        variant="ghost"
                        size="lg"
                        className="h-16 px-10 text-xs font-black tracking-[0.2em] rounded-none border-2 border-transparent hover:border-black transition-all duration-300"
                        onClick={() => router.push('/league/public/matches')}
                    >
                        EXPLORE DATA
                    </Button>
                </motion.div>
            </div>

            {/* Precision UI Accents */}
            <div className="absolute bottom-10 left-10 hidden lg:block">
                <div className="flex items-center gap-4 text-[10px] font-black tracking-widest text-black/20 uppercase vertical-text transform -rotate-180">
                    <span className="w-[1px] h-20 bg-black/10" />
                    System Status: Optimized
                </div>
            </div>

            <div className="absolute bottom-10 right-10 hidden lg:block text-right">
                <div className="text-[10px] font-black tracking-widest text-black/20 uppercase mb-4">
                    Coordinate: 51.5074° N, 0.1278° W
                </div>
                <div className="w-40 h-[1px] bg-black/10 ml-auto" />
            </div>
        </section>
    );
};
