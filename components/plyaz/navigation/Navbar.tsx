'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlyazLogo } from './PlyazLogo';
import { ThemeToggle } from '../ThemeToggle';

import { LiveTicker } from './LiveTicker';

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
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50" data-testid="app-navbar">
            <div className="h-16 px-4 flex items-center justify-between max-w-7xl mx-auto">
                {/* Left: Back button or Logo */}
                <div className="flex items-center gap-3">
                    {showBackButton ? (
                        <button
                            onClick={onBackClick}
                            className="p-2 -ml-2 rounded-xl hover:bg-primary/5 transition-colors group"
                            aria-label="Go back"
                        >
                            <svg
                                className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
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

                {/* Center: Live Ticker or Title */}
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
                    {!showBackButton ? <LiveTicker /> : (
                        <h1 className="text-xs font-black tracking-[0.3em] uppercase text-slate-400">
                            {title}
                        </h1>
                    )}
                </div>

                {/* Center: Title (mobile only) */}
                {showBackButton && (
                    <h1 className="md:hidden absolute left-1/2 -translate-x-1/2 text-[10px] font-black tracking-[0.25em] uppercase text-neutral-900 dark:text-white">
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
