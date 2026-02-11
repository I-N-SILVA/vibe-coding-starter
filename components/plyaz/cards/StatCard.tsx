'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '../Card';

/**
 * StatCard Component - PLYAZ Design System
 * Premium black/white styling with minimal design
 */

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
                className={cn('text-left', className)}
                {...props}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-[10px] font-medium tracking-widest uppercase text-secondary-main/30 mb-2">
                            {title}
                        </p>
                        <p className="text-3xl font-bold text-primary-main tracking-tight">
                            {value}
                        </p>
                        {trend && (
                            <p
                                className={cn(
                                    'text-[10px] font-medium mt-2 tracking-wider',
                                    trend.isPositive ? 'text-secondary-main' : 'text-secondary-main/40'
                                )}
                            >
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </p>
                        )}
                        {description && (
                            <p className="text-xs text-secondary-main/40 mt-2">{description}</p>
                        )}
                    </div>
                    {icon && (
                        <div className="p-3 rounded-lg bg-secondary-main/5 text-secondary-main/30">
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
