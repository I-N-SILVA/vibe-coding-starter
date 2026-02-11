'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Badge Component - PLYAZ Design System (Refined)
 * 
 * Premium styling with:
 * - Black/white primary colors
 * - Minimal, uppercase typography
 */

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', size = 'sm', children, ...props }, ref) => {
        const baseStyles = `
      inline-flex items-center justify-center
      font-medium uppercase tracking-wider
      rounded-full
      transition-colors duration-200
    `;

        const variants = {
            default: 'bg-gray-100 text-gray-600',
            primary: 'bg-gray-900 text-white',
            secondary: 'bg-white text-gray-900 border border-gray-200',
            success: 'bg-gray-900 text-white',
            warning: 'bg-gray-900 text-white',
            error: 'bg-gray-900 text-white',
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

/**
 * StatusBadge Component - For match status indicators
 * Only LIVE status uses color accent
 */

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
                bg: 'bg-red-500',
                text: 'text-white',
                pulse: true,
            },
            upcoming: {
                label: 'UPCOMING',
                bg: 'bg-gray-900',
                text: 'text-white',
            },
            completed: {
                label: 'FINAL',
                bg: 'bg-gray-100',
                text: 'text-gray-600',
            },
            cancelled: {
                label: 'CANCELLED',
                bg: 'bg-gray-100',
                text: 'text-gray-500',
            },
            postponed: {
                label: 'POSTPONED',
                bg: 'bg-gray-100',
                text: 'text-gray-500',
            },
            scheduled: {
                label: 'SCHEDULED',
                bg: 'bg-gray-900',
                text: 'text-white',
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
