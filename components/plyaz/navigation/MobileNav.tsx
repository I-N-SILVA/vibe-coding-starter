'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthProvider';
import { NavItem, NavGroup } from './types';
import { NavIcons } from './NavIcons';

interface MobileNavProps {
    items?: NavItem[];
    navGroups?: NavGroup[];
    className?: string;
}

// Top-5 priority routes for the quick bottom bar
const PRIORITY_HREFS = ['/league', '/league/matches', '/league/teams', '/league/invites'];

export const MobileNav: React.FC<MobileNavProps> = ({ items = [], navGroups, className }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Derive priority items from either flat items or groups
    const allItems = navGroups ? navGroups.flatMap((g) => g.items) : items;
    const priorityItems = PRIORITY_HREFS
        .map((href) => allItems.find((item) => item.href === href))
        .filter(Boolean) as NavItem[];

    const isActive = (href: string) =>
        pathname === href || (href !== '/league' && pathname.startsWith(href + '/'));

    return (
        <>
            {/* Bottom Tab Bar */}
            <nav
                className={cn(
                    'fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-100 dark:border-neutral-800',
                    'pb-safe md:hidden',
                    className
                )}
            >
                <div className="h-16 flex items-stretch">
                    {priorityItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                                isActive(item.href)
                                    ? 'text-neutral-900 dark:text-white'
                                    : 'text-neutral-400 dark:text-neutral-500'
                            )}
                        >
                            <span className={cn('w-5 h-5', isActive(item.href) && 'text-orange-500')}>
                                {item.icon}
                            </span>
                            <span className="text-[9px] font-semibold tracking-wider uppercase">
                                {item.label}
                            </span>
                        </Link>
                    ))}

                    {/* More button */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className={cn(
                            'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                            drawerOpen
                                ? 'text-orange-500'
                                : 'text-neutral-400 dark:text-neutral-500'
                        )}
                    >
                        <span className="w-5 h-5">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </span>
                        <span className="text-[9px] font-semibold tracking-wider uppercase">More</span>
                    </button>
                </div>
            </nav>

            {/* Full Nav Drawer */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
                            onClick={() => setDrawerOpen(false)}
                        />

                        {/* Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-[61] bg-white dark:bg-neutral-900 rounded-t-3xl shadow-2xl md:hidden max-h-[85vh] overflow-y-auto"
                        >
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-2">
                                <div className="w-10 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                            </div>

                            <div className="px-4 pb-safe pb-8">
                                <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-neutral-400 mb-4 px-2">
                                    Navigation
                                </h2>

                                {navGroups ? (
                                    navGroups.map((group) => (
                                        <div key={group.label} className="mb-5">
                                            <p className="text-[9px] font-black tracking-[0.2em] uppercase text-neutral-300 dark:text-neutral-600 mb-2 px-2">
                                                {group.label}
                                            </p>
                                            <div className="space-y-0.5">
                                                {group.items.map((item) => {
                                                    const active = isActive(item.href);
                                                    return (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            onClick={() => setDrawerOpen(false)}
                                                            className={cn(
                                                                'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                                                                active
                                                                    ? 'bg-neutral-900 dark:bg-white/10 text-white'
                                                                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                                            )}
                                                        >
                                                            <span className={cn('w-5 h-5', active && 'text-orange-400')}>
                                                                {item.icon}
                                                            </span>
                                                            <span className="text-sm font-semibold">{item.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="space-y-0.5">
                                        {allItems.map((item) => {
                                            const active = isActive(item.href);
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setDrawerOpen(false)}
                                                    className={cn(
                                                        'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                                                        active
                                                            ? 'bg-neutral-900 dark:bg-white/10 text-white'
                                                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                                    )}
                                                >
                                                    <span className="w-5 h-5">{item.icon}</span>
                                                    <span className="text-sm font-semibold">{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Fan View + Sign out */}
                                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-0.5">
                                    <Link
                                        href="/league/public"
                                        onClick={() => setDrawerOpen(false)}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                    >
                                        <span className="w-5 h-5"><NavIcons.Public /></span>
                                        <span className="text-sm font-semibold">Fan View</span>
                                    </Link>
                                    <button
                                        onClick={async () => { await signOut(); router.push('/'); }}
                                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    >
                                        <span className="w-5 h-5"><NavIcons.Logout /></span>
                                        <span className="text-sm font-semibold">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default MobileNav;
