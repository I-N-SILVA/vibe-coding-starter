'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'accent';
    size?: 'sm' | 'md';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', size = 'sm', children, ...props }, ref) => {
        const baseStyles = `
      inline-flex items-center justify-center
      font-semibold uppercase tracking-wider
      rounded-full
      transition-colors duration-200
    `;

        const variants = {
            default: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300',
            primary: 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900',
            secondary: 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700',
            accent: 'bg-orange-500 text-white',
            success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            error: 'bg-red-500/10 text-red-600 dark:text-red-400',
        };

        const sizes = {
            sm: 'px-3 py-1 text-[9px]',
            md: 'px-4 py-1.5 text-[10px]',
        };

        return (
            <span
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

type MatchStatus = 'live' | 'upcoming' | 'completed' | 'cancelled' | 'postponed' | 'scheduled';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    status: MatchStatus;
    showIcon?: boolean;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
    ({ className, status, showIcon = true, ...props }, ref) => {
        const statusConfig: Record<
            MatchStatus,
            { label: string; bg: string; text: string; pulse?: boolean }
        > = {
            live: {
                label: 'LIVE',
                bg: 'bg-orange-500',
                text: 'text-white',
                pulse: true,
            },
            upcoming: {
                label: 'UPCOMING',
                bg: 'bg-neutral-900 dark:bg-neutral-200',
                text: 'text-white dark:text-neutral-900',
            },
            completed: {
                label: 'FINAL',
                bg: 'bg-neutral-100 dark:bg-neutral-800',
                text: 'text-neutral-600 dark:text-neutral-300',
            },
            cancelled: {
                label: 'CANCELLED',
                bg: 'bg-red-50 dark:bg-red-500/10',
                text: 'text-red-500 dark:text-red-400',
            },
            postponed: {
                label: 'POSTPONED',
                bg: 'bg-amber-50 dark:bg-amber-500/10',
                text: 'text-amber-600 dark:text-amber-400',
            },
            scheduled: {
                label: 'SCHEDULED',
                bg: 'bg-neutral-900 dark:bg-neutral-200',
                text: 'text-white dark:text-neutral-900',
            },
        };

        const config = statusConfig[status];

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                    'text-[9px] font-semibold uppercase tracking-wider',
                    config.bg,
                    config.text,
                    className
                )}
                {...props}
            >
                {showIcon && config.pulse && (
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                )}
                {config.label}
            </span>
        );
    }
);

StatusBadge.displayName = 'StatusBadge';

export { Badge, StatusBadge };
export type { BadgeProps, StatusBadgeProps, MatchStatus };
