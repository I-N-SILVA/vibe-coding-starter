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

export const MobileNav: React.FC<MobileNavProps> = ({ items = [], navGroups, className }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Derive priority items from either flat items or groups — first 4 for role-aware bottom bar
    const allItems = navGroups ? navGroups.flatMap((g) => g.items) : items;
    const priorityItems = allItems.slice(0, 4);

    const isActive = (href: string) =>
        pathname === href || (href !== '/league' && pathname.startsWith(href + '/'));

    return (
        <>
            {/* Bottom Tab Bar */}
            <nav
                className={cn(
                    'fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-100 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/95',
                    'md:hidden',
                    className,
                )}
            >
                <div
                    className="flex items-stretch"
                    style={{
                        height: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
                        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                    }}
                >
                    {priorityItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors',
                                isActive(item.href)
                                    ? 'text-neutral-900 dark:text-white'
                                    : 'text-neutral-400 dark:text-neutral-500',
                            )}
                        >
                            <span
                                className={cn('h-5 w-5', isActive(item.href) && 'text-orange-500')}
                            >
                                {item.icon}
                            </span>
                            <span className="text-[9px] font-semibold uppercase tracking-wider">
                                {item.label}
                            </span>
                        </Link>
                    ))}

                    {/* More button */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className={cn(
                            'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors',
                            drawerOpen
                                ? 'text-orange-500'
                                : 'text-neutral-400 dark:text-neutral-500',
                        )}
                    >
                        <span className="h-5 w-5">
                            <svg
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                />
                            </svg>
                        </span>
                        <span className="text-[9px] font-semibold uppercase tracking-wider">
                            More
                        </span>
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
                            className="fixed bottom-0 left-0 right-0 z-[61] max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl dark:bg-neutral-900 md:hidden"
                        >
                            {/* Handle */}
                            <div className="flex justify-center pb-2 pt-3">
                                <div className="h-1 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                            </div>

                            <div
                                className="px-4"
                                style={{
                                    paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
                                }}
                            >
                                <h2 className="mb-4 px-2 text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
                                    Navigation
                                </h2>

                                {navGroups ? (
                                    navGroups.map((group) => (
                                        <div key={group.label} className="mb-5">
                                            <p className="mb-2 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-300 dark:text-neutral-600">
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
                                                                'flex items-center gap-3 rounded-xl px-3 py-3 transition-colors',
                                                                active
                                                                    ? 'bg-neutral-900 text-white dark:bg-white/10'
                                                                    : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800',
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    'h-5 w-5',
                                                                    active && 'text-orange-400',
                                                                )}
                                                            >
                                                                {item.icon}
                                                            </span>
                                                            <span className="text-sm font-semibold">
                                                                {item.label}
                                                            </span>
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
                                                        'flex items-center gap-3 rounded-xl px-3 py-3 transition-colors',
                                                        active
                                                            ? 'bg-neutral-900 text-white dark:bg-white/10'
                                                            : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800',
                                                    )}
                                                >
                                                    <span className="h-5 w-5">{item.icon}</span>
                                                    <span className="text-sm font-semibold">
                                                        {item.label}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Fan View + Sign out */}
                                <div className="mt-4 space-y-0.5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                    <Link
                                        href="/league/public"
                                        onClick={() => setDrawerOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-neutral-500 transition-colors hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    >
                                        <span className="h-5 w-5">
                                            <NavIcons.Public />
                                        </span>
                                        <span className="text-sm font-semibold">Fan View</span>
                                    </Link>
                                    <button
                                        onClick={async () => {
                                            await signOut();
                                            router.push('/');
                                        }}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                                    >
                                        <span className="h-5 w-5">
                                            <NavIcons.Logout />
                                        </span>
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
