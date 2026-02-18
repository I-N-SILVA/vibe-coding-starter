'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, Badge } from '@/components/plyaz';
import { Trophy, ChevronRight } from 'lucide-react';

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
    return (
        <div className="flex gap-12 overflow-x-auto pb-12 pt-8 px-4 hide-scrollbar">
            {rounds.map((round, roundIdx) => (
                <div key={round.round} className="flex flex-col gap-8 min-w-[280px]">
                    {/* Round Header */}
                    <div className="mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 px-2">
                            {round.name}
                        </h3>
                        <div className="h-0.5 w-8 bg-orange-500 rounded-full ml-2" />
                    </div>

                    {/* Matchups Container */}
                    <div className="flex flex-col flex-grow justify-around">
                        {round.matchups.map((matchup, matchIdx) => (
                            <div key={matchup.id} className="relative flex items-center py-4">
                                {/* Connecting Lines (except for first round) */}
                                {roundIdx > 0 && (
                                    <div className="absolute -left-12 w-12 h-0.5 bg-gray-200" />
                                )}

                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (roundIdx * 0.1) + (matchIdx * 0.05) }}
                                    className="w-full"
                                >
                                    <Card
                                        padding="sm"
                                        className={cn(
                                            "!p-0 overflow-hidden border-2 transition-all group cursor-pointer",
                                            matchup.status === 'live' ? "border-orange-500 shadow-lg shadow-orange-500/10" : "border-gray-50 hover:border-gray-200"
                                        )}
                                        onClick={() => onMatchClick?.(matchup.id)}
                                    >
                                        <CardContent className="p-0">
                                            {/* Team A */}
                                            <div className={cn(
                                                "flex items-center justify-between p-3 border-b border-gray-50",
                                                matchup.winnerId === 'home' ? "bg-orange-50/30" : ""
                                            )}>
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="w-5 h-5 rounded-full bg-gray-100 shrink-0" />
                                                    <span className={cn(
                                                        "text-sm font-bold truncate tracking-tight",
                                                        matchup.winnerId === 'home' ? "text-gray-900" : "text-gray-500"
                                                    )}>
                                                        {matchup.homeTeamName}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-black tabular-nums">{matchup.homeScore ?? '-'}</span>
                                            </div>

                                            {/* Team B */}
                                            <div className={cn(
                                                "flex items-center justify-between p-3",
                                                matchup.winnerId === 'away' ? "bg-orange-50/30" : ""
                                            )}>
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="w-5 h-5 rounded-full bg-gray-100 shrink-0" />
                                                    <span className={cn(
                                                        "text-sm font-bold truncate tracking-tight",
                                                        matchup.winnerId === 'away' ? "text-gray-900" : "text-gray-500"
                                                    )}>
                                                        {matchup.awayTeamName}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-black tabular-nums">{matchup.awayScore ?? '-'}</span>
                                            </div>

                                            {/* Match Status / Meta */}
                                            {matchup.status === 'live' && (
                                                <div className="bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest text-center py-1">
                                                    Live • 67'
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Forward Connecting Lines (except for last round) */}
                                {roundIdx < rounds.length - 1 && (
                                    <div className={cn(
                                        "absolute -right-12 w-12 border-gray-200",
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
            <div className="flex flex-col justify-center items-center gap-4 px-8 border-l border-gray-100 ml-4">
                <div className="w-16 h-16 rounded-3xl bg-orange-100 flex items-center justify-center text-orange-500 shadow-xl shadow-orange-500/10">
                    <Trophy className="w-8 h-8" />
                </div>
                <div className="text-center">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Champion</div>
                    <div className="text-sm font-black text-gray-900">TBD</div>
                </div>
            </div>
        </div>
    );
};
