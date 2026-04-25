'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import anime from 'animejs';
import { cn } from '@/lib/utils';
import { Card, CardContent, Button } from '@/components/plyaz';
import { Trophy, Maximize2, Minimize2, MousePointer2 } from 'lucide-react';

export interface BracketMatchup {
    id: string;
    round: number;
    position: number;
    homeTeamName: string;
    awayTeamName: string;
    homeScore?: number;
    awayScore?: number;
    winnerId?: string | null;
    status: 'upcoming' | 'completed' | 'bye' | 'live';
}

export interface BracketRound {
    round: number;
    name: string;
    matchups: BracketMatchup[];
}

interface KnockoutBracketProps {
    rounds: BracketRound[];
    onMatchClick?: (matchId: string) => void;
}

export const KnockoutBracket: React.FC<KnockoutBracketProps> = ({ rounds, onMatchClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const bracketRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!bracketRef.current) return;
        
        anime({
            targets: bracketRef.current.querySelectorAll('.bracket-line'),
            scaleX: [0, 1],
            scaleY: [0, 1],
            opacity: [0, 1],
            transformOrigin: ['0% 50%', '0% 0%'],
            duration: 1200,
            delay: anime.stagger(150, { start: 300 }),
            easing: 'easeOutExpo'
        });
    }, [isExpanded, rounds]); // Re-animate if opened in modal or rounds change

    const BracketContent = ({ expanded = false }: { expanded?: boolean }) => (
        <div 
            ref={expanded ? undefined : bracketRef}
            className={cn(
                "flex gap-12 pt-8 px-4 hide-scrollbar",
                expanded ? "min-w-max pb-32" : "overflow-x-auto pb-12"
            )}
        >
            {rounds.map((round, roundIdx) => (
                <div key={round.round} className="flex flex-col gap-8 min-w-[280px]">
                    {/* Round Header */}
                    <div className="mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 px-2">
                            {round.name}
                        </h3>
                        <div className="h-0.5 w-8 bg-plyaz-gradient rounded-full ml-2" />
                    </div>

                    {/* Matchups Container */}
                    <div className="flex flex-col flex-grow justify-around">
                        {round.matchups.map((matchup, matchIdx) => (
                            <div key={matchup.id} className="relative flex items-center py-4">
                                {/* Connecting Lines (except for first round) */}
                                {roundIdx > 0 && (
                                    <div className="bracket-line absolute -left-12 w-12 h-0.5 bg-neutral-200 dark:bg-neutral-800 origin-left" />
                                )}

                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (roundIdx * 0.1) + (matchIdx * 0.05) }}
                                    className="w-full"
                                >
                                    <Card
                                        className={cn(
                                            "!p-0 overflow-hidden border-2 transition-all group cursor-pointer",
                                            matchup.status === 'live' 
                                                ? "border-primary shadow-lg shadow-primary/10" 
                                                : "border-neutral-100 dark:border-neutral-800 hover:border-primary/30"
                                        )}
                                        onClick={() => onMatchClick?.(matchup.id)}
                                    >
                                        <CardContent className="p-0">
                                            {/* Team A */}
                                            <div className={cn(
                                                "flex items-center justify-between p-3 border-b border-neutral-50 dark:border-neutral-800/50",
                                                matchup.winnerId === 'home' ? "bg-primary/5" : ""
                                            )}>
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 shrink-0" />
                                                    <span className={cn(
                                                        "text-sm font-bold truncate tracking-tight",
                                                        matchup.winnerId === 'home' ? "text-foreground" : "text-muted-foreground"
                                                    )}>
                                                        {matchup.homeTeamName}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-black tabular-nums">{matchup.homeScore ?? '-'}</span>
                                            </div>

                                            {/* Team B */}
                                            <div className={cn(
                                                "flex items-center justify-between p-3",
                                                matchup.winnerId === 'away' ? "bg-primary/5" : ""
                                            )}>
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 shrink-0" />
                                                    <span className={cn(
                                                        "text-sm font-bold truncate tracking-tight",
                                                        matchup.winnerId === 'away' ? "text-foreground" : "text-muted-foreground"
                                                    )}>
                                                        {matchup.awayTeamName}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-black tabular-nums">{matchup.awayScore ?? '-'}</span>
                                            </div>

                                            {/* Match Status / Meta */}
                                            {matchup.status === 'live' && (
                                                <div className="bg-primary text-white text-[9px] font-black uppercase tracking-widest text-center py-1">
                                                    Live • 67'
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Forward Connecting Lines (except for last round) */}
                                {roundIdx < rounds.length - 1 && (
                                    <div className={cn(
                                        "bracket-line absolute -right-12 w-12 border-neutral-200 dark:border-neutral-800 origin-left",
                                        matchIdx % 2 === 0
                                            ? "h-1/2 border-t-2 border-r-2 top-1/2 rounded-tr-xl"
                                            : "h-1/2 border-b-2 border-r-2 bottom-1/2 rounded-br-xl"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Trophy Section */}
            <div className="flex flex-col justify-center items-center gap-4 px-12 border-l border-neutral-100 dark:border-neutral-800 ml-4">
                <div className="w-20 h-20 rounded-[2rem] bg-plyaz-gradient p-[1px]">
                    <div className="w-full h-full rounded-[1.95rem] bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                        <Trophy className="w-10 h-10" />
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Champion</div>
                    <div className="text-lg font-black text-foreground uppercase tracking-tight">TBD</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative group">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-9 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-neutral-200 dark:border-neutral-800 shadow-sm"
                    onClick={() => setIsExpanded(true)}
                    leftIcon={<Maximize2 className="w-3.5 h-3.5" />}
                >
                    Expand
                </Button>
            </div>

            <BracketContent />

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Tournament Protocol</h2>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-2">
                                    <MousePointer2 className="w-3 h-3" />
                                    Pan to navigate the bracket
                                </p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-10 w-10 !p-0 rounded-xl"
                                onClick={() => setIsExpanded(false)}
                            >
                                <Minimize2 className="w-5 h-5" />
                            </Button>
                        </div>
                        
                        <div className="flex-1 overflow-auto bg-neutral-50/30 dark:bg-slate-950/30 p-8 cursor-grab active:cursor-grabbing">
                            <BracketContent expanded />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
