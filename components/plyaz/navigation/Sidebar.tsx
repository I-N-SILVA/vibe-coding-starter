'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthProvider';
import { NavItem } from './types';
import { NavIcons } from './NavIcons';
import { PlyazLogo } from './PlyazLogo';

interface SidebarProps {
    items: NavItem[];
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, className }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();

    const getLogoHref = () => {
        if (pathname.includes('/league/public')) return '/league/public';
        if (pathname.includes('/league')) return '/league';
        return '/';
    };

    return (
        <aside
            className={cn(
                'hidden md:flex flex-col w-64 min-h-screen bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 font-sans',
                'fixed left-0 top-0 z-30',
                className
            )}
            data-testid="sidebar"
        >
            <div className="h-14 px-6 flex items-center border-b border-neutral-100 dark:border-neutral-800">
                <Link href={getLogoHref()} className="group">
                    <PlyazLogo />
                </Link>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1" data-testid="sidebar-nav">
                {items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                            className={cn(
                                'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200',
                                isActive
                                    ? 'bg-neutral-900 dark:bg-white/10 text-white'
                                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-orange-500'
                            )}
                        >
                            <span className="w-5 h-5">{item.icon}</span>
                            <span className="text-[11px] font-semibold tracking-wider uppercase">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
                {pathname.includes('/league') && !pathname.includes('/public') && (
                    <Link
                        href="/league/public"
                        data-testid="sidebar-fan-view"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-orange-500 transition-all"
                    >
                        <span className="w-5 h-5"><NavIcons.Public /></span>
                        <span className="text-[11px] font-semibold tracking-wider uppercase">Fan View</span>
                    </Link>
                )}
                {pathname.includes('/public') ? (
                    <Link
                        href="/login"
                        data-testid="sidebar-admin-login"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-orange-500 transition-all"
                    >
                        <span className="w-5 h-5"><NavIcons.Settings /></span>
                        <span className="text-[11px] font-semibold tracking-wider uppercase">Admin Login</span>
                    </Link>
                ) : (
                    <button
                        onClick={async () => { await signOut(); router.push('/'); }}
                        data-testid="sidebar-signout"
                        className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-neutral-400 dark:text-neutral-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                        <span className="w-5 h-5"><NavIcons.Logout /></span>
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-left">Sign Out</span>
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
