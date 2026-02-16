'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card } from '../Card';

/**
 * TeamCard Component - PLYAZ Design System
 * Premium minimal design for team display
 */

export interface TeamCardProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    logoUrl?: string;
    stats?: {
        wins: number;
        draws: number;
        losses: number;
        points: number;
    };
    league?: string;
    onPress?: () => void;
}

export const TeamCard = React.forwardRef<HTMLDivElement, TeamCardProps>(
    ({ className, name, logoUrl, stats, league, onPress, ...props }, ref) => {
        return (
            <Card
                ref={ref}
                variant="team"
                padding="md"
                hoverable={!!onPress}
                className={cn('text-center', className)}
                onClick={onPress}
                {...props}
            >
                {/* Team Logo */}
                {logoUrl ? (
                    <Image
                        src={logoUrl}
                        alt={name}
                        width={64}
                        height={64}
                        className="w-16 h-16 mx-auto rounded-full object-cover bg-gray-100 mb-4"
                    />
                ) : (
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <span className="text-xl font-bold text-gray-400">
                            {name[0]}
                        </span>
                    </div>
                )}

                {/* Team Name */}
                <h3 className="text-lg font-semibold text-gray-900 tracking-tight mb-1">
                    {name}
                </h3>
                {league && (
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">
                        {league}
                    </p>
                )}

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100">
                        <div>
                            <p className="text-lg font-bold text-gray-900">{stats.wins}</p>
                            <p className="text-[9px] text-gray-400 uppercase tracking-wider">W</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">{stats.draws}</p>
                            <p className="text-[9px] text-gray-400 uppercase tracking-wider">D</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">{stats.losses}</p>
                            <p className="text-[9px] text-gray-400 uppercase tracking-wider">L</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">{stats.points}</p>
                            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Pts</p>
                        </div>
                    </div>
                )}
            </Card>
        );
    }
);

TeamCard.displayName = 'TeamCard';

export default TeamCard;
