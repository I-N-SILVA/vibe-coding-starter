'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveMatches } from '@/lib/hooks';

export function LiveTicker() {
    const { data: matches = [], isLoading } = useLiveMatches();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter only matches that have scores or are actually live
    const liveMatches = matches.filter(m => m.status === 'live');

    useEffect(() => {
        if (liveMatches.length <= 1) return;
        
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % liveMatches.length);
        }, 5000); // Rotate every 5 seconds

        return () => clearInterval(timer);
    }, [liveMatches.length]);

    if (isLoading || liveMatches.length === 0) {
        return (
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-20" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500/20" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Awaiting Kickoff
                </span>
            </div>
        );
    }

    const match = liveMatches[currentIndex];

    return (
        <div className="hidden md:flex items-center gap-4 h-9 px-4 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 overflow-hidden min-w-[280px]">
            <div className="flex items-center gap-2 shrink-0">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                    Live
                </span>
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="flex-1 relative h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={match.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute inset-0 flex items-center justify-center gap-3"
                    >
                        <span className="text-[11px] font-bold uppercase truncate max-w-[80px]">
                            {match.home_team?.short_name || 'HOM'}
                        </span>
                        <span className="text-xs font-black tabular-nums bg-slate-900 text-white px-1.5 py-0.5 rounded">
                            {match.home_score} — {match.away_score}
                        </span>
                        <span className="text-[11px] font-bold uppercase truncate max-w-[80px]">
                            {match.away_team?.short_name || 'AWY'}
                        </span>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
