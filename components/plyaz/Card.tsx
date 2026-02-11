'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Card Component - PLYAZ Design System (Refined)
 * 
 * Premium styling with:
 * - Clean white cards
 * - Subtle borders
 * - Orange accent on hover only
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'match' | 'team' | 'player' | 'stats';
    padding?: 'sm' | 'md' | 'lg';
    hoverable?: boolean;
    elevated?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            variant = 'default',
            padding = 'md',
            hoverable = false,
            elevated = false,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      bg-surface-main rounded-lg
      border border-secondary-main/5
      transition-all duration-300 ease-out
    `;

        const paddingStyles = {
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        };

        const shadowStyles = elevated
            ? 'shadow-lg'
            : 'shadow-none';

        const hoverStyles = hoverable
            ? 'hover:border-accent-main hover:shadow-md cursor-pointer'
            : '';

        const variantStyles = {
            default: '',
            match: '',
            team: '',
            player: 'p-4',
            stats: '',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    baseStyles,
                    paddingStyles[padding],
                    shadowStyles,
                    hoverStyles,
                    variantStyles[variant],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Card Header
type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex items-center justify-between mb-6', className)}
            {...props}
        >
            {children}
        </div>
    )
);

CardHeader.displayName = 'CardHeader';

// Card Title - Premium typography
type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, children, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn(
                'text-sm font-medium tracking-widest uppercase text-primary-main',
                className
            )}
            {...props}
        >
            {children}
        </h3>
    )
);

CardTitle.displayName = 'CardTitle';

// Card Content
type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn('', className)} {...props}>
            {children}
        </div>
    )
);

CardContent.displayName = 'CardContent';

// Card Footer
type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'flex items-center gap-4 mt-6 pt-6 border-t border-secondary-main/5',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
export type { CardProps };
