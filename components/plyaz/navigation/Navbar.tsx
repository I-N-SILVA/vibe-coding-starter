'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PlyazLogo } from './PlyazLogo';
import { UserMenu } from './UserMenu';
import { useNotifications } from '@/lib/hooks/use-notifications';

interface NavbarProps {
    title?: string;
    showBackButton?: boolean;
    onBackClick?: () => void;
    rightAction?: React.ReactNode;
    onSearchOpen?: () => void;
}

function NotificationBell({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const { notifications, count } = useNotifications();
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const typeColor: Record<string, string> = {
        urgent: 'text-red-500 bg-red-50 dark:bg-red-500/10',
        warning: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10',
        info: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
    };

    const typeDot: Record<string, string> = {
        urgent: 'bg-red-500',
        warning: 'bg-orange-400',
        info: 'bg-blue-400',
    };

    return (
        <div className="relative" ref={panelRef}>
            <div className="flex items-center gap-1.5 bg-neutral-100/50 dark:bg-white/5 p-1 rounded-2xl border border-neutral-200/50 dark:border-white/5">
                {/* ⌘K search trigger — desktop only */}
                {onSearchOpen && (
                    <button
                        onClick={onSearchOpen}
                        className="hidden md:flex items-center gap-3 h-9 pl-3 pr-2 rounded-xl bg-white dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 hover:text-primary dark:hover:text-primary transition-all duration-300 shadow-sm border border-neutral-200 dark:border-white/5 group/search"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover/search:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Global Search</span>
                        <kbd className="text-[9px] font-mono bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-lg border border-neutral-200 dark:border-white/10 shadow-inner">⌘K</kbd>
                    </button>
                )}

                {/* Bell */}
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-primary transition-all duration-300 shadow-sm border border-neutral-200 dark:border-white/5 group/bell"
                    aria-label="Notifications"
                >
                    <svg className="w-5 h-5 transition-transform group-hover/bell:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    {count > 0 && (
                        <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-neutral-800 shadow-sm"
                        >
                            <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-40" />
                        </motion.span>
                    )}
                </button>
            </div>

            {/* Notification Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 z-50 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                            <h3 className="text-xs font-black tracking-widest uppercase text-neutral-900 dark:text-white">
                                Notifications
                            </h3>
                            {count > 0 && (
                                <span className="text-[10px] font-bold bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 px-2 py-0.5 rounded-full">
                                    {count} new
                                </span>
                            )}
                        </div>

                        <div className="max-h-72 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-xs text-neutral-400">All clear — no pending actions.</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => { setOpen(false); router.push(n.href); }}
                                        className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-50 dark:border-neutral-800/50 last:border-0"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${typeDot[n.type]}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{n.title}</p>
                                                <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">{n.description}</p>
                                                <span className={`inline-block mt-1.5 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${typeColor[n.type]}`}>
                                                    {n.cta}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export const Navbar: React.FC<NavbarProps> = ({
    title = 'PLYAZ',
    showBackButton = false,
    onBackClick,
    rightAction,
    onSearchOpen,
}) => {
    const pathname = usePathname();

    const getLogoHref = () => {
        if (pathname.includes('/league/public')) return '/league/public';
        if (pathname.includes('/league')) return '/league';
        if (pathname.includes('/login')) return '/';
        return '/';
    };

    return (
        <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 transition-all duration-300" data-testid="app-navbar">
            {/* Subtle Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            <div className="h-16 px-6 flex items-center justify-between max-w-7xl mx-auto">
                {/* Left */}
                <div className="flex items-center gap-4">
                    {showBackButton ? (
                        <button
                            onClick={onBackClick}
                            className="p-2 -ml-2 rounded-2xl bg-neutral-100/50 dark:bg-white/5 hover:bg-primary hover:text-white transition-all duration-300 group shadow-sm hover:shadow-primary/20"
                            aria-label="Go back"
                        >
                            <svg className="w-5 h-5 transition-transform duration-300 group-active:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    ) : (
                        <Link href={getLogoHref()} className="flex items-center gap-2 group relative">
                            <PlyazLogo />
                            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500 rounded-full" />
                        </Link>
                    )}
                </div>

                {/* Center — page title when back button is shown */}
                {showBackButton && (
                    <motion.h1 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute left-1/2 -translate-x-1/2 text-[11px] font-black tracking-[0.3em] uppercase text-neutral-900 dark:text-white pointer-events-none"
                    >
                        {title}
                    </motion.h1>
                )}

                {/* Right */}
                <div className="flex items-center gap-2">
                    <NotificationBell onSearchOpen={onSearchOpen} />
                    {rightAction && (
                        <div className="h-8 w-[1px] bg-neutral-200 dark:bg-white/10 mx-2 hidden md:block" />
                    )}
                    {rightAction}
                    <div className="ml-1 pl-1 border-l border-neutral-100 dark:border-white/5">
                        <UserMenu />
                    </div>
                </div>
            </div>
            
            {/* Bottom Glow Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-100 dark:via-white/5 to-transparent" />
        </header>
    );
};

export default Navbar;
