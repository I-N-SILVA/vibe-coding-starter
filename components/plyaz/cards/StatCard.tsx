'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '../Card';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    description?: string;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
    ({ className, title, value, icon, trend, description, ...props }, ref) => {
        return (
            <Card
                ref={ref}
                variant="stats"
                padding="md"
                className={cn('text-left group hover:shadow-md dark:hover:shadow-black/20 transition-shadow', className)}
                data-testid="stat-card"
                {...props}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-2">
                            {title}
                        </p>
                        <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight tabular-nums">
                            {value}
                        </p>
                        {trend && (
                            <p
                                className={cn(
                                    'text-[10px] font-semibold mt-2 tracking-wider',
                                    trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                                )}
                            >
                                {trend.isPositive ? '+' : ''}{Math.abs(trend.value)}%
                            </p>
                        )}
                        {description && (
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">{description}</p>
                        )}
                    </div>
                    {icon && (
                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-700/30 text-neutral-400 dark:text-neutral-500 group-hover:text-orange-500 transition-colors">
                            {icon}
                        </div>
                    )}
                </div>
            </Card>
        );
    }
);

StatCard.displayName = 'StatCard';

export default StatCard;
