'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavItem, NavGroup } from './types';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { SimulationBanner } from '../SimulationBanner';
import { CommandPalette } from '@/components/app/CommandPalette';

interface DashboardShellProps {
    children: React.ReactNode;
    navItems: NavItem[];
    navGroups?: NavGroup[];
}

export function DashboardShell({
    children,
    navItems,
    navGroups,
}: DashboardShellProps) {
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
                onSearchOpen={() => setCmdOpen(true)}
            />

            <Sidebar items={navItems} navGroups={navGroups} />

            <div className="md:ml-56">
                {children}
            </div>

            <MobileNav items={navItems} navGroups={navGroups} />
            <SimulationBanner />

            <CommandPalette
                open={cmdOpen}
                onClose={() => setCmdOpen(false)}
                items={allNavItems}
            />
        </div>
    );
}
