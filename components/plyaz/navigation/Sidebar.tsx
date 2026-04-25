'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthProvider';
import { NavItem, NavGroup } from './types';
import { NavIcons } from './NavIcons';
import { PlyazLogo } from './PlyazLogo';

interface SidebarProps {
    items?: NavItem[];
    navGroups?: NavGroup[];
    className?: string;
}

const STORAGE_KEY = 'plyaz_sidebar_collapsed';

function loadCollapsed(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
        return new Set();
    }
}

function saveCollapsed(collapsed: Set<string>) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...collapsed]));
    } catch { /* ignore */ }
}

export const Sidebar: React.FC<SidebarProps> = ({ items = [], navGroups, className }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    useEffect(() => {
        setCollapsed(loadCollapsed());
    }, []);

    const toggleGroup = (label: string) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(label)) next.delete(label);
            else next.add(label);
            saveCollapsed(next);
            return next;
        });
    };

    const getLogoHref = () => {
        if (pathname.includes('/league/public')) return '/league/public';
        if (pathname.includes('/league')) return '/league';
        return '/';
    };

    const renderItem = (item: NavItem) => {
        const isActive = pathname === item.href || (item.href !== '/league' && pathname.startsWith(item.href + '/'));
        return (
            <Link
                key={item.href}
                href={item.href}
                data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150',
                    isActive
                        ? 'bg-neutral-900 dark:bg-white/10 text-white'
                        : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-orange-500'
                )}
            >
                <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
                <span className="text-[11px] font-semibold tracking-wide uppercase">{item.label}</span>
            </Link>
        );
    };

    return (
        <aside
            className={cn(
                'hidden md:flex flex-col w-56 min-h-screen bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 font-sans',
                'fixed left-0 top-0 z-30',
                className
            )}
            data-testid="sidebar"
        >
            {/* Logo */}
            <div className="h-14 px-4 flex items-center border-b border-neutral-100 dark:border-neutral-800">
                <Link href={getLogoHref()} className="group">
                    <PlyazLogo />
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-1" data-testid="sidebar-nav">
                {navGroups ? (
                    navGroups.map((group) => {
                        const isCollapsed = collapsed.has(group.label);
                        const hasActive = group.items.some(
                            (item) => pathname === item.href || (item.href !== '/league' && pathname.startsWith(item.href + '/'))
                        );
                        return (
                            <div key={group.label} className="mb-1">
                                <button
                                    onClick={() => toggleGroup(group.label)}
                                    className={cn(
                                        'w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors',
                                        hasActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500',
                                        'hover:text-neutral-700 dark:hover:text-neutral-300'
                                    )}
                                >
                                    <span className="text-[9px] font-black tracking-[0.2em] uppercase">
                                        {group.label}
                                    </span>
                                    <motion.span
                                        animate={{ rotate: isCollapsed ? -90 : 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="text-[10px] opacity-50"
                                    >
                                        ▾
                                    </motion.span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {!isCollapsed && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.18, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-0.5 pb-1 space-y-0.5">
                                                {group.items.map(renderItem)}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                ) : (
                    <div className="space-y-0.5">{items.map(renderItem)}</div>
                )}
            </nav>

            {/* Footer */}
            <div className="p-2 border-t border-neutral-100 dark:border-neutral-800 space-y-0.5">
                {pathname.includes('/league') && !pathname.includes('/public') && (
                    <Link
                        href="/league/public"
                        data-testid="sidebar-fan-view"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-orange-500 transition-all"
                    >
                        <span className="w-4 h-4"><NavIcons.Public /></span>
                        <span className="text-[11px] font-semibold tracking-wide uppercase">Fan View</span>
                    </Link>
                )}
                {pathname.includes('/public') ? (
                    <Link
                        href="/login"
                        data-testid="sidebar-admin-login"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-orange-500 transition-all"
                    >
                        <span className="w-4 h-4"><NavIcons.Settings /></span>
                        <span className="text-[11px] font-semibold tracking-wide uppercase">Admin Login</span>
                    </Link>
                ) : (
                    <button
                        onClick={async () => { await signOut(); router.push('/'); }}
                        data-testid="sidebar-signout"
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-neutral-400 dark:text-neutral-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                        <span className="w-4 h-4"><NavIcons.Logout /></span>
                        <span className="text-[11px] font-semibold tracking-wide uppercase text-left">Sign Out</span>
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
