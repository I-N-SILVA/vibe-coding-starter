'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SimulationBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const isSim = localStorage.getItem('plyaz_simulation_enabled') === 'true' ||
            (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL);

        setIsVisible(isSim);
    }, []);

    if (!isVisible || isDismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
            >
                <div className="bg-gray-900 text-white rounded-2xl p-4 shadow-2xl border border-gray-800 flex items-center justify-between gap-4 overflow-hidden relative group">
                    {/* Animated Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20">
                            <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-widest text-orange-400">Simulation Active</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">
                                Front-end only mode. Data remains in LocalStorage.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsDismissed(true)}
                        className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors relative z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
