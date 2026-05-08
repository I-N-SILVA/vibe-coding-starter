'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useLanguage } from '@/components/providers';
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
    } catch {
        /* ignore */
    }
}

export const Sidebar: React.FC<SidebarProps> = ({ items = [], navGroups, className }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();
    const { locale, setLocale } = useLanguage();
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
        const isActive =
            pathname === item.href ||
            (item.href !== '/league' && pathname.startsWith(item.href + '/'));
        return (
            <Link
                key={item.href}
                href={item.href}
                data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-150',
                    isActive
                        ? 'bg-neutral-900 text-white dark:bg-white/10'
                        : 'text-neutral-500 hover:bg-neutral-50 hover:text-orange-500 dark:text-neutral-400 dark:hover:bg-neutral-800',
                )}
            >
                <span className="h-4 w-4 flex-shrink-0">{item.icon}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wide">
                    {item.label}
                </span>
            </Link>
        );
    };

    return (
        <aside
            className={cn(
                'hidden min-h-screen w-56 flex-col border-r border-neutral-100 bg-white font-sans dark:border-neutral-800 dark:bg-neutral-900 md:flex',
                'fixed left-0 top-0 z-30',
                className,
            )}
            data-testid="sidebar"
        >
            {/* Logo */}
            <div className="flex h-14 items-center border-b border-neutral-100 px-4 dark:border-neutral-800">
                <Link href={getLogoHref()} className="group">
                    <PlyazLogo />
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4" data-testid="sidebar-nav">
                {navGroups ? (
                    navGroups.map((group) => {
                        const isCollapsed = collapsed.has(group.label);
                        const hasActive = group.items.some(
                            (item) =>
                                pathname === item.href ||
                                (item.href !== '/league' && pathname.startsWith(item.href + '/')),
                        );
                        return (
                            <div key={group.label} className="mb-1">
                                <button
                                    onClick={() => toggleGroup(group.label)}
                                    className={cn(
                                        'flex w-full items-center justify-between rounded-lg px-3 py-1.5 transition-colors',
                                        hasActive
                                            ? 'text-neutral-900 dark:text-white'
                                            : 'text-neutral-400 dark:text-neutral-500',
                                        'hover:text-neutral-700 dark:hover:text-neutral-300',
                                    )}
                                >
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">
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
                                            <div className="space-y-0.5 pb-1 pt-0.5">
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
            <div className="space-y-0.5 border-t border-neutral-100 p-2 dark:border-neutral-800">
                {/* Language quick-toggle */}
                <button
                    onClick={() => setLocale(locale === 'pt' ? 'en' : 'pt')}
                    title={locale === 'pt' ? 'Switch to English' : 'Mudar para Português'}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-neutral-400 transition-all hover:bg-neutral-50 hover:text-orange-500 dark:text-neutral-500 dark:hover:bg-neutral-800"
                >
                    <span className="flex h-4 w-4 items-center justify-center text-base leading-none">
                        {locale === 'pt' ? '🇬🇧' : '🇧🇷'}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide">
                        {locale === 'pt' ? 'English' : 'Português'}
                    </span>
                </button>

                {pathname.includes('/league') && !pathname.includes('/public') && (
                    <Link
                        href="/league/public"
                        data-testid="sidebar-fan-view"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-neutral-400 transition-all hover:bg-neutral-50 hover:text-orange-500 dark:text-neutral-500 dark:hover:bg-neutral-800"
                    >
                        <span className="h-4 w-4">
                            <NavIcons.Public />
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-wide">
                            Fan View
                        </span>
                    </Link>
                )}
                {pathname.includes('/public') ? (
                    <Link
                        href="/login"
                        data-testid="sidebar-admin-login"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-neutral-400 transition-all hover:bg-neutral-50 hover:text-orange-500 dark:text-neutral-500 dark:hover:bg-neutral-800"
                    >
                        <span className="h-4 w-4">
                            <NavIcons.Settings />
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-wide">
                            Admin Login
                        </span>
                    </Link>
                ) : (
                    <button
                        onClick={async () => {
                            await signOut();
                            router.push('/');
                        }}
                        data-testid="sidebar-signout"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-neutral-400 transition-all hover:bg-red-50 hover:text-red-500 dark:text-neutral-500 dark:hover:bg-red-500/10"
                    >
                        <span className="h-4 w-4">
                            <NavIcons.Logout />
                        </span>
                        <span className="text-left text-[11px] font-semibold uppercase tracking-wide">
                            Sign Out
                        </span>
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
