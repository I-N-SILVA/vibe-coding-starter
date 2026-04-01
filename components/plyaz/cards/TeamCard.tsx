'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card } from '../Card';

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
                data-testid="team-card"
                {...props}
            >
                {logoUrl ? (
                    <Image
                        src={logoUrl}
                        alt={name}
                        width={64}
                        height={64}
                        className="w-16 h-16 mx-auto rounded-full object-cover bg-neutral-100 dark:bg-neutral-800 mb-4"
                    />
                ) : (
                    <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                        <span className="text-xl font-bold text-neutral-400 dark:text-neutral-500">
                            {name[0]}
                        </span>
                    </div>
                )}

                <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight mb-1">
                    {name}
                </h3>
                {league && (
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">
                        {league}
                    </p>
                )}

                {stats && (
                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-700/50">
                        {[
                            { val: stats.wins, label: 'W' },
                            { val: stats.draws, label: 'D' },
                            { val: stats.losses, label: 'L' },
                            { val: stats.points, label: 'Pts' },
                        ].map((s, i) => (
                            <div key={i}>
                                <p className="text-lg font-bold text-neutral-900 dark:text-white">{s.val}</p>
                                <p className="text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        );
    }
);

TeamCard.displayName = 'TeamCard';

export default TeamCard;
