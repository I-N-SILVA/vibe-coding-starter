'use client';

import React from 'react';
import { DashboardShell } from './DashboardShell';
import { adminNavGroups, adminNavItems, playerNavItems, refereeNavItems, coachNavItems } from '@/lib/constants/navigation';
import { useRole } from '@/lib/hooks/useRole';
import { NavGroup } from './types';

interface DynamicDashboardShellProps {
    children: React.ReactNode;
}

export function DynamicDashboardShell({ children }: DynamicDashboardShellProps) {
    const { role } = useRole();

    let navItems = adminNavItems;
    let navGroups: NavGroup[] | undefined = adminNavGroups;

    if (role === 'player') {
        navItems = playerNavItems;
        navGroups = undefined;
    } else if (role === 'referee') {
        navItems = refereeNavItems;
        navGroups = undefined;
    } else if (role === 'coach') {
        navItems = coachNavItems;
        navGroups = undefined;
    }

    return (
        <DashboardShell navItems={navItems} navGroups={navGroups}>
            {children}
        </DashboardShell>
    );
}
