'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PlyazLogo } from './PlyazLogo';
import { ThemeToggle } from '../ThemeToggle';

/**
 * Navbar Component - PLYAZ Design System
 * Top navigation bar for mobile and desktop
 */

interface NavbarProps {
    title?: string;
    showBackButton?: boolean;
    onBackClick?: () => void;
    rightAction?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
    title = 'PLYAZ',
    showBackButton = false,
    onBackClick,
    rightAction,
}) => {
    const pathname = usePathname();

    // Intelligent logo redirection
    const getLogoHref = () => {
        if (pathname.includes('/league/public')) return '/league/public';
        if (pathname.includes('/league')) return '/league';
        if (pathname.includes('/login')) return '/';
        return '/';
    };

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <div className="h-14 px-4 flex items-center justify-between max-w-7xl mx-auto">
                {/* Left: Back button or Logo */}
                <div className="flex items-center gap-3">
                    {showBackButton ? (
                        <button
                            onClick={onBackClick}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors group"
                            aria-label="Go back"
                        >
                            <svg
                                className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    ) : (
                        <Link href={getLogoHref()} className="flex items-center gap-2 group">
                            <PlyazLogo />
                        </Link>
                    )}
                </div>

                {/* Center: Title (mobile only) */}
                {showBackButton && (
                    <h1 className="absolute left-1/2 -translate-x-1/2 text-xs font-bold tracking-[0.2em] uppercase text-gray-900">
                        {title}
                    </h1>
                )}

                {/* Right: Action button */}
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {rightAction}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
