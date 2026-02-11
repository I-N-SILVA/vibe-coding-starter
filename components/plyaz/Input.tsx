'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Input Component - PLYAZ Design System (Refined)
 * Premium black/white styling with orange focus accent
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        { className, label, error, helperText, leftIcon, rightIcon, id, ...props },
        ref
    ) => {
        const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-[10px] font-medium tracking-widest uppercase text-secondary-main/30 mb-2"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-main/30">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'w-full h-12 px-4 rounded-lg border bg-surface-main',
                            'text-primary-main placeholder:text-secondary-main/20',
                            'text-sm tracking-tight',
                            'transition-all duration-200',
                            'focus:outline-none focus:border-accent-main',
                            error
                                ? 'border-red-500'
                                : 'border-secondary-main/10 hover:border-secondary-main/30',
                            leftIcon && 'pl-11',
                            rightIcon && 'pr-11',
                            'disabled:bg-secondary-main/5 disabled:text-secondary-main/20 disabled:cursor-not-allowed',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-main/30">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-[10px] text-red-500 mt-2 tracking-wider uppercase">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="text-[10px] text-secondary-main/30 mt-2">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

/**
 * Select Component
 */

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, placeholder, id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-[10px] font-medium tracking-widest uppercase text-secondary-main/30 mb-2"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={cn(
                        'w-full h-12 px-4 rounded-lg border bg-surface-main appearance-none',
                        'text-primary-main text-sm tracking-tight',
                        'transition-all duration-200',
                        'focus:outline-none focus:border-accent-main',
                        error
                            ? 'border-red-500'
                            : 'border-secondary-main/10 hover:border-secondary-main/30',
                        'disabled:bg-secondary-main/5 disabled:text-secondary-main/20 disabled:cursor-not-allowed',
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="text-[10px] text-red-500 mt-2 tracking-wider uppercase">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

/**
 * Toggle / Switch Component
 * Black/white with orange active state
 */

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({
    checked,
    onChange,
    label,
    disabled = false,
}) => {
    return (
        <label className="inline-flex items-center gap-3 cursor-pointer">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                    checked ? 'bg-primary-main' : 'bg-secondary-main/10',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
            >
                <span
                    className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-surface-main shadow transition-transform duration-200',
                        checked ? 'translate-x-6' : 'translate-x-1'
                    )}
                />
            </button>
            {label && (
                <span
                    className={cn(
                        'text-xs tracking-tight',
                        disabled ? 'text-secondary-main/20' : 'text-secondary-main/40'
                    )}
                >
                    {label}
                </span>
            )}
        </label>
    );
};

export { Input, Select, Toggle };
export type { InputProps, SelectProps, ToggleProps };
