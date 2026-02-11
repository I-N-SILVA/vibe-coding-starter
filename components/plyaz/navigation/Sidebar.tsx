'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavItem } from './types';
import { NavIcons } from './NavIcons';
import { PlyazLogo } from './PlyazLogo';

/**
 * Sidebar Component - PLYAZ Design System
 * Desktop side navigation
 */

interface SidebarProps {
    items: NavItem[];
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, className }) => {
    const pathname = usePathname();
    const router = useRouter();

    // Intelligent logo redirection for sidebar
    const getLogoHref = () => {
        if (pathname.includes('/league/public')) return '/league/public';
        if (pathname.includes('/league')) return '/league';
        return '/';
    };

    return (
        <aside
            className={cn(
                'hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 font-sans',
                'fixed left-0 top-0',
                className
            )}
        >
            {/* Sidebar Logo Area */}
            <div className="h-14 px-6 flex items-center border-b border-gray-100">
                <Link href={getLogoHref()} className="group">
                    <PlyazLogo />
                </Link>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-1">
                {items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                isActive
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-orange-500'
                            )}
                        >
                            <span className="w-5 h-5">{item.icon}</span>
                            <span className="text-xs font-medium tracking-wider uppercase">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-2">
                {pathname.includes('/league') && !pathname.includes('/public') && (
                    <Link
                        href="/league/public"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-orange-500 transition-all"
                    >
                        <span className="w-5 h-5">
                            <NavIcons.Public />
                        </span>
                        <span className="text-xs font-bold tracking-widest uppercase">Fan View</span>
                    </Link>
                )}
                <button
                    onClick={() => router.push('/')}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
                >
                    <span className="w-5 h-5">
                        <NavIcons.Logout />
                    </span>
                    <span className="text-xs font-bold tracking-widest uppercase text-left">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
