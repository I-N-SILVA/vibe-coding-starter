'use client';
import React from 'react';
import { DashboardShell } from './DashboardShell';
import { playerNavItems, coachNavItems } from '@/lib/constants/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

export function PlayerShell({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth();
    const navItems = profile?.role === 'coach' ? coachNavItems : playerNavItems;
    return <DashboardShell navItems={navItems}>{children}</DashboardShell>;
}
