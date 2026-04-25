'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchCard } from '@/components/plyaz';
import type { MatchUI } from '@/lib/mappers';

interface MatchDayMultiBoardProps {
    matches: MatchUI[];
    onMatchPress?: (id: string) => void;
}

export function MatchDayMultiBoard({ matches, onMatchPress }: MatchDayMultiBoardProps) {
    const liveMatches = matches.filter(m => m.status === 'live');
    const upcomingMatches = matches.filter(m => m.status === 'scheduled' || m.status === 'upcoming');

    return (
        <div className="space-y-12">
            {/* Live Section: High Intensity Multi-Board */}
            {liveMatches.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Live Command Center</h2>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-full">
                            {liveMatches.length} ACTIVE
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {liveMatches.map((match) => (
                                <motion.div
                                    key={match.id}
                                    layout
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="relative group"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                                    <MatchCard
                                        homeTeam={match.homeTeam!}
                                        awayTeam={match.awayTeam!}
                                        homeScore={match.homeScore}
                                        awayScore={match.awayScore}
                                        status={match.status}
                                        matchTime={match.matchTime ?? undefined}
                                        venue={match.venue ?? undefined}
                                        onPress={() => onMatchPress?.(match.id)}
                                        className="relative bg-white dark:bg-slate-900 border-primary/20 shadow-2xl"
                                    />
                                    {/* Progress Bar for the half */}
                                    <div className="absolute bottom-4 inset-x-8 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-primary"
                                            initial={{ width: 0 }}
                                            animate={{ width: '65%' }} // Mock progress
                                            transition={{ duration: 2, ease: "easeOut" }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>
            )}

            {/* Upcoming Section: Compact Grid */}
            {upcomingMatches.length > 0 && (
                <section className="space-y-6 opacity-80">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Up Next</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {upcomingMatches.map((match) => (
                            <MatchCard
                                key={match.id}
                                homeTeam={match.homeTeam!}
                                awayTeam={match.awayTeam!}
                                status={match.status}
                                matchTime={match.matchTime ?? undefined}
                                date={match.scheduledAt ? new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                onPress={() => onMatchPress?.(match.id)}
                                className="scale-95 hover:scale-100 transition-transform opacity-70 hover:opacity-100"
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
