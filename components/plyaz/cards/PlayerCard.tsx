'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card } from '../Card';

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
                data-testid="player-card"
                {...props}
            >
                <div className="relative">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover bg-neutral-100 dark:bg-neutral-800"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <span className="text-lg font-semibold text-neutral-400 dark:text-neutral-500">
                                {name[0]}
                            </span>
                        </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-bold flex items-center justify-center">
                        {number}
                    </span>
                </div>

                <div className="flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-white tracking-tight">{name}</p>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider mt-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                        {position}
                    </span>
                </div>

                {stats && (
                    <div className="text-right text-xs">
                        {stats.goals !== undefined && (
                            <p className="text-neutral-900 dark:text-white">
                                <span className="font-bold">{stats.goals}</span>{' '}
                                <span className="text-neutral-400 dark:text-neutral-500 text-[10px]">G</span>
                            </p>
                        )}
                        {stats.assists !== undefined && (
                            <p className="text-neutral-900 dark:text-white">
                                <span className="font-bold">{stats.assists}</span>{' '}
                                <span className="text-neutral-400 dark:text-neutral-500 text-[10px]">A</span>
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
