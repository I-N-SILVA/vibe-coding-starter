'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NavItem, NavGroup } from './types';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { SimulationBanner } from '../SimulationBanner';
import { CommandPalette } from '@/components/app/CommandPalette';

interface PageLayoutProps {
    children: React.ReactNode;
    navItems: NavItem[];
    navGroups?: NavGroup[];
    title?: string;
    showBackButton?: boolean;
    onBackClick?: () => void;
    rightAction?: React.ReactNode;
    fullWidth?: boolean;
    className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    navItems,
    navGroups,
    title,
    showBackButton,
    onBackClick,
    rightAction,
    fullWidth = false,
    className,
}) => {
    const router = useRouter();
    const [cmdOpen, setCmdOpen] = useState(false);

    // Wire global ⌘K / Ctrl+K
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCmdOpen((v) => !v);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const allNavItems = navGroups ? navGroups.flatMap((g) => g.items) : navItems;

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <Navbar
                title={title}
                showBackButton={showBackButton}
                onBackClick={onBackClick || (() => router.back())}
                rightAction={rightAction}
                onSearchOpen={() => setCmdOpen(true)}
            />

            <Sidebar items={navItems} navGroups={navGroups} />

            <motion.main
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className={cn(
                    'md:ml-56 pb-20 md:pb-8',
                    fullWidth ? 'px-0' : 'px-4 md:px-8 py-6 md:py-8 max-w-5xl',
                    className
                )}
            >
                {children}
            </motion.main>

            <MobileNav items={navItems} navGroups={navGroups} />
            <SimulationBanner />

            <CommandPalette
                open={cmdOpen}
                onClose={() => setCmdOpen(false)}
                items={allNavItems}
            />
        </div>
    );
};

export default PageLayout;
