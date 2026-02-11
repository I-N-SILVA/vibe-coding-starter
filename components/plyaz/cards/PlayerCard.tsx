'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '../Card';

/**
 * PlayerCard Component - PLYAZ Design System
 * Minimal player display with stats
 */

export interface PlayerCardProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    avatarUrl?: string;
    position: string;
    number: number;
    stats?: {
        goals?: number;
        assists?: number;
        appearances?: number;
    };
    onPress?: () => void;
}

export const PlayerCard = React.forwardRef<HTMLDivElement, PlayerCardProps>(
    (
        { className, name, avatarUrl, position, number, stats, onPress, ...props },
        ref
    ) => {
        return (
            <Card
                ref={ref}
                variant="player"
                padding="sm"
                hoverable={!!onPress}
                className={cn('flex items-center gap-4', className)}
                onClick={onPress}
                {...props}
            >
                {/* Avatar */}
                <div className="relative">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={name}
                            className="w-12 h-12 rounded-full object-cover bg-gray-100"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-400">
                                {name[0]}
                            </span>
                        </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">
                        {number}
                    </span>
                </div>

                {/* Info */}
                <div className="flex-1">
                    <p className="font-medium text-gray-900 tracking-tight">{name}</p>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider mt-1 bg-gray-100 text-gray-500">
                        {position}
                    </span>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="text-right text-xs">
                        {stats.goals !== undefined && (
                            <p className="text-gray-900">
                                <span className="font-bold">{stats.goals}</span>{' '}
                                <span className="text-gray-400 text-[10px]">G</span>
                            </p>
                        )}
                        {stats.assists !== undefined && (
                            <p className="text-gray-900">
                                <span className="font-bold">{stats.assists}</span>{' '}
                                <span className="text-gray-400 text-[10px]">A</span>
                            </p>
                        )}
                    </div>
                )}
            </Card>
        );
    }
);

PlayerCard.displayName = 'PlayerCard';

export default PlayerCard;
