'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { StatusBadge, type MatchStatus } from './Badge';
import { FileDown } from 'lucide-react';

/**
 * MatchCard Component - PLYAZ Design System
 */

interface Team {
    id: string;
    name: string;
    shortName?: string;
    logoUrl?: string;
}

interface MatchCardProps extends React.HTMLAttributes<HTMLDivElement> {
    homeTeam: Team;
    awayTeam: Team;
    homeScore?: number;
    awayScore?: number;
    status: MatchStatus;
    matchTime?: string;
    venue?: string;
    date?: string;
    onPress?: () => void;
    onDownloadReport?: (e: React.MouseEvent) => void;
}

const MatchCard = React.forwardRef<HTMLDivElement, MatchCardProps>(
    (
        {
            className,
            homeTeam,
            awayTeam,
            homeScore,
            awayScore,
            status,
            matchTime,
            venue,
            date,
            onPress,
            onDownloadReport,
            ...props
        },
        ref
    ) => {
        const isLive = status === 'live';
        const hasScore = homeScore !== undefined && awayScore !== undefined;

        return (
            <Card
                ref={ref}
                variant="match"
                padding="md"
                hoverable={!!onPress}
                className={cn(
                    'relative overflow-hidden',
                    isLive && 'border-primary',
                    className
                )}
                onClick={onPress}
                {...props}
            >
                {/* Live Indicator */}
                {isLive && (
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/20 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                        <span className="text-[10px] font-bold text-primary tracking-wider">LIVE</span>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    <StatusBadge status={status} />
                </div>

                {/* Match Content */}
                <div className="flex items-center justify-between gap-4 pt-2">
                    {/* Home Team */}
                    <div className="flex-1 text-left">
                        <div className="flex items-center gap-3">
                            {homeTeam.logoUrl ? (
                                <Image
                                    src={homeTeam.logoUrl}
                                    alt={homeTeam.name}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full object-cover bg-secondary/5"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">
                                        {homeTeam.shortName?.[0] || homeTeam.name[0]}
                                    </span>
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-neutral-900 dark:text-white tracking-tight">
                                    {homeTeam.shortName || homeTeam.name}
                                </p>
                                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Home</p>
                            </div>
                        </div>
                    </div>

                    {/* Score / Time */}
                    <div className={cn("text-center px-6 transition-all duration-500", isLive && hasScore && "animate-heartbeat text-primary")}>
                        {hasScore ? (
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tighter">
                                    {homeScore}
                                </span>
                                <span className="text-xl text-neutral-200 dark:text-neutral-700">:</span>
                                <span className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tighter">
                                    {awayScore}
                                </span>
                            </div>
                        ) : (
                            <div className="text-sm font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                                {matchTime || 'vs'}
                            </div>
                        )}
                        {isLive && matchTime && hasScore && (
                            <p className="text-xs font-semibold text-primary mt-1 tracking-wider">
                                {matchTime}
                            </p>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-3">
                            <div>
                                <p className="font-semibold text-neutral-900 dark:text-white tracking-tight">
                                    {awayTeam.shortName || awayTeam.name}
                                </p>
                                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Away</p>
                            </div>
                            {awayTeam.logoUrl ? (
                                <Image
                                    src={awayTeam.logoUrl}
                                    alt={awayTeam.name}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full object-cover bg-secondary/5"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">
                                        {awayTeam.shortName?.[0] || awayTeam.name[0]}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-700/50 flex items-center justify-between">
                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex gap-4">
                        {date && <span>{date}</span>}
                        {venue && <span>{venue}</span>}
                    </div>

                    {status === 'completed' && onDownloadReport && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownloadReport(e);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 text-primary hover:bg-primary hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all group/btn"
                        >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>Download Protocol</span>
                        </button>
                    )}
                </div>
            </Card>
        );
    }
);

MatchCard.displayName = 'MatchCard';

export { MatchCard };
export type { MatchCardProps, Team };
