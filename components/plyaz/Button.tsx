'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Button Component - PLYAZ Design System
 * 
 * Aligned with PLYAZ brand identity:
 * - Primary: Brand Gradient (Purple to Orange)
 * - Secondary: Outlined Brand Color
 * - Ghost: Transparent with hover state
 * - Danger: Red accent
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-bold tracking-tight
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
      rounded-full
      uppercase text-xs tracking-[0.1em]
    `;

        const variants = {
            // Primary: PLYAZ Brand Gradient
            primary: `
        bg-plyaz-gradient text-white shadow-lg shadow-primary/20
        hover:opacity-90 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30
        active:scale-[0.98]
      `,
            // Brand: Solid Primary Color
            brand: `
        bg-primary text-white
        hover:bg-primary/90
        active:scale-[0.98]
      `,
            // Secondary: Outlined
            secondary: `
        bg-transparent text-foreground border-2 border-primary/20
        hover:border-primary hover:text-primary
        active:scale-[0.98]
      `,
            // Ghost: Transparent
            ghost: `
        bg-transparent text-muted-foreground
        hover:text-primary hover:bg-primary/5
        active:scale-[0.98]
      `,
            // Danger: Red accent
            danger: `
        bg-destructive text-white
        hover:bg-destructive/90 hover:shadow-lg
        active:scale-[0.98]
      `,
        };

        const sizes = {
            sm: 'px-5 py-2 text-[10px]',
            md: 'px-7 py-3 text-xs',
            lg: 'px-10 py-4 text-sm h-[60px] min-w-[140px]', // Referee controls / Hero
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    fullWidth && 'w-full',
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                ) : (
                    <>
                        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
