'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Button Component - PLYAZ Design System (Kinetic Order)
 * 
 * Aligned with PLYAZ brand identity:
 * - Primary: Solid Obsidian/White with "+" markers
 * - Accent: Brand Gradient (Orange) with "+" markers
 * - Outline: Bordered Obsidian
 * - Ghost: Subtle transparent
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'secondary' | 'brand';
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
      inline-flex items-center justify-center gap-3
      font-bold tracking-widest
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
      rounded-full
      uppercase text-[10px]
      before:content-['+'] before:opacity-30 before:font-normal
      after:content-['+'] after:opacity-30 after:font-normal
    `;

        const variants = {
            // Primary: Solid Obsidian (Light) / White (Dark)
            primary: `
        bg-foreground text-background
        hover:bg-background hover:text-foreground hover:border-foreground border border-transparent
        active:scale-[0.98]
      `,
            // Accent: PLYAZ Brand Gradient
            accent: `
        bg-plyaz-gradient text-white border-none shadow-xl shadow-primary/20
        hover:scale-[1.02] hover:shadow-primary/40
        active:scale-[0.98]
        before:text-white before:opacity-50
        after:text-white after:opacity-50
      `,
            // Outline: Outlined Obsidian
            outline: `
        bg-transparent text-foreground border border-foreground/30
        hover:border-foreground hover:bg-foreground/5
        active:scale-[0.98]
      `,
            // Ghost: Transparent
            ghost: `
        bg-transparent text-foreground/60
        hover:text-foreground hover:bg-foreground/5
        active:scale-[0.98]
        before:opacity-10 after:opacity-10
      `,
            // Danger: Red accent
            danger: `
        bg-destructive text-destructive-foreground
        hover:opacity-90
        active:scale-[0.98]
      `,
            // Aliases for backward compatibility
            secondary: `
        bg-transparent text-foreground border border-foreground/30
        hover:border-foreground hover:bg-foreground/5
        active:scale-[0.98]
      `,
            brand: `
        bg-plyaz-gradient text-white border-none shadow-xl shadow-primary/20
        hover:scale-[1.02] hover:shadow-primary/40
        active:scale-[0.98]
        before:text-white before:opacity-50
        after:text-white after:opacity-50
      `,
        };

        const sizes = {
            sm: 'px-5 py-2',
            md: 'px-8 py-3.5',
            lg: 'px-12 py-5 text-xs h-[64px]',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant as keyof typeof variants] || variants.primary,
                    sizes[size],
                    fullWidth && 'w-full',
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <svg
                        className="animate-spin h-3 w-3"
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
                        {leftIcon && <span className="flex-shrink-0 -ml-1">{leftIcon}</span>}
                        <span className="flex-1 text-center">{children}</span>
                        {rightIcon && <span className="flex-shrink-0 -mr-1">{rightIcon}</span>}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
