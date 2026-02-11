'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Button Component - PLYAZ Design System (Refined)
 * 
 * Premium styling with:
 * - Black/white primary colors
 * - Orange accent on hover states only
 * - Premium typography (tracking, weight)
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
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
      font-medium tracking-tight
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
      rounded-full
      uppercase text-xs tracking-widest
    `;

        const variants = {
            // Primary: Black button, orange glow on hover
            primary: `
        bg-primary-main text-white
        hover:bg-primary-light hover:shadow-[0_0_20px_rgba(255,92,26,0.3)]
        active:scale-[0.98]
      `,
            // Secondary: White with black border, orange border on hover
            secondary: `
        bg-surface-main text-primary-main border-2 border-primary-main
        hover:border-accent-main hover:text-accent-main
        active:scale-[0.98]
      `,
            // Ghost: Transparent, orange text on hover
            ghost: `
        bg-transparent text-secondary-main
        hover:text-accent-main
        active:scale-[0.98]
      `,
            // Danger: Red accent
            danger: `
        bg-red-500 text-white
        hover:bg-red-600 hover:shadow-lg
        active:scale-[0.98]
      `,
        };

        const sizes = {
            sm: 'px-5 py-2 text-[10px]',
            md: 'px-7 py-3 text-xs',
            lg: 'px-10 py-4 text-sm h-[60px] min-w-[140px]', // Referee controls
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
