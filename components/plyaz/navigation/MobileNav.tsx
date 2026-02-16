'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthProvider';
import { NavItem } from './types';
import { NavIcons } from './NavIcons';

/**
 * MobileNav Component - PLYAZ Design System
 * Bottom navigation bar for mobile devices
 */

interface MobileNavProps {
    items: NavItem[];
    className?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({ items, className }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();

    return (
        <nav
            className={cn(
                'fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100',
                'pb-safe md:hidden', // Only show on mobile
                className
            )}
        >
            <div className="h-16 flex items-center justify-around px-2">
                {items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[64px]',
                                isActive
                                    ? 'text-gray-900'
                                    : 'text-gray-400 hover:text-orange-500'
                            )}
                        >
                            <span className={cn('w-6 h-6', isActive && 'text-orange-500')}>
                                {item.icon}
                            </span>
                            <span className="text-[9px] font-medium tracking-wider uppercase">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* Logout for mobile if in admin/referee area */}
                {pathname.includes('/league') && !pathname.includes('/public') && (
                    <button
                        onClick={async () => { await signOut(); router.push('/'); }}
                        className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[64px] text-gray-400 hover:text-red-500"
                    >
                        <span className="w-6 h-6">
                            <NavIcons.Logout />
                        </span>
                        <span className="text-[9px] font-medium tracking-wider uppercase">
                            Exit
                        </span>
                    </button>
                )}
            </div>
        </nav>
    );
};

export default MobileNav;
