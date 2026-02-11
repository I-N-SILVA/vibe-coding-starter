'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { StatusBadge, type MatchStatus } from './Badge';

/**
 * MatchCard Component - PLYAZ Design System (Refined)
 * 
 * Premium styling with:
 * - Clean black/white typography
 * - Orange accent on hover only
 * - Large, bold scores
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
                    isLive && 'border-accent-main',
                    className
                )}
                onClick={onPress}
                {...props}
            >
                {/* Live Indicator */}
                {isLive && (
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-main/20 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-main" />
                        </span>
                        <span className="text-[10px] font-bold text-accent-main tracking-wider">LIVE</span>
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
                                <img
                                    src={homeTeam.logoUrl}
                                    alt={homeTeam.name}
                                    className="w-10 h-10 rounded-full object-cover bg-secondary-main/5"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-secondary-main/5 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-secondary-main/30">
                                        {homeTeam.shortName?.[0] || homeTeam.name[0]}
                                    </span>
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-primary-main tracking-tight">
                                    {homeTeam.shortName || homeTeam.name}
                                </p>
                                <p className="text-[10px] text-secondary-main/40 uppercase tracking-wider">Home</p>
                            </div>
                        </div>
                    </div>

                    {/* Score / Time */}
                    <div className="text-center px-6">
                        {hasScore ? (
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-bold text-primary-main tracking-tighter">
                                    {homeScore}
                                </span>
                                <span className="text-xl text-secondary-main/10">—</span>
                                <span className="text-4xl font-bold text-primary-main tracking-tighter">
                                    {awayScore}
                                </span>
                            </div>
                        ) : (
                            <div className="text-sm font-medium text-secondary-main/40 uppercase tracking-wider">
                                {matchTime || 'vs'}
                            </div>
                        )}
                        {isLive && matchTime && hasScore && (
                            <p className="text-xs font-semibold text-accent-main mt-1 tracking-wider">
                                {matchTime}
                            </p>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-3">
                            <div>
                                <p className="font-semibold text-primary-main tracking-tight">
                                    {awayTeam.shortName || awayTeam.name}
                                </p>
                                <p className="text-[10px] text-secondary-main/40 uppercase tracking-wider">Away</p>
                            </div>
                            {awayTeam.logoUrl ? (
                                <img
                                    src={awayTeam.logoUrl}
                                    alt={awayTeam.name}
                                    className="w-10 h-10 rounded-full object-cover bg-secondary-main/5"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-secondary-main/5 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-secondary-main/30">
                                        {awayTeam.shortName?.[0] || awayTeam.name[0]}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                {(date || venue) && (
                    <div className="mt-6 pt-4 border-t border-secondary-main/5 flex items-center justify-between text-[10px] text-secondary-main/40 uppercase tracking-wider">
                        {date && <span>{date}</span>}
                        {venue && <span>{venue}</span>}
                    </div>
                )}
            </Card>
        );
    }
);

MatchCard.displayName = 'MatchCard';

export { MatchCard };
export type { MatchCardProps, Team };
