import React from 'react';
import { NavIcons } from '@/components/plyaz/navigation/NavIcons';
import type { NavItem, NavGroup } from '@/components/plyaz/navigation/types';

export const adminNavGroups: NavGroup[] = [
    {
        label: 'Competition',
        items: [
            { label: 'Dashboard', href: '/league', icon: <NavIcons.Dashboard /> },
            { label: 'Fixtures', href: '/league/fixtures', icon: <NavIcons.Calendar /> },
            { label: 'Standings', href: '/league/standings', icon: <NavIcons.Standings /> },
        ],
    },
    {
        label: 'People',
        items: [
            { label: 'Teams', href: '/league/teams', icon: <NavIcons.Teams /> },
            { label: 'Players', href: '/league/players', icon: <NavIcons.Statistics /> },
            { label: 'Invites', href: '/league/invites', icon: <NavIcons.Public /> },
        ],
    },
    {
        label: 'Operations',
        items: [
            { label: 'Matches', href: '/league/matches', icon: <NavIcons.Matches /> },
            { label: 'Venues', href: '/league/venues', icon: <NavIcons.Public /> },
            { label: 'Referee', href: '/league/referee', icon: <NavIcons.Whistle /> },
        ],
    },
    {
        label: 'Growth',
        items: [
            { label: 'Analytics', href: '/league/analytics', icon: <NavIcons.Analytics /> },
            { label: 'Discovery', href: '/discover', icon: <NavIcons.Public /> },
        ],
    },
    {
        label: 'Config',
        items: [
            { label: 'Categories', href: '/league/categories', icon: <NavIcons.Trophy /> },
            { label: 'Settings', href: '/league/settings', icon: <NavIcons.Settings /> },
        ],
    },
];

// Flat list derived from groups — backward-compatible for pages that only need navItems
export const adminNavItems: NavItem[] = adminNavGroups.flatMap((g) => g.items);

export const publicNavItems: NavItem[] = [
    { label: 'Scoreboard', href: '/league/public/scoreboard', icon: <NavIcons.Matches /> },
    { label: 'Matches', href: '/league/public/matches', icon: <NavIcons.Matches /> },
    { label: 'Teams', href: '/league/public/teams', icon: <NavIcons.Teams /> },
    { label: 'Standings', href: '/league/public/standings', icon: <NavIcons.Standings /> },
    { label: 'Statistics', href: '/league/statistics', icon: <NavIcons.Statistics /> },
];

export const playerNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/league/player/dashboard', icon: <NavIcons.Dashboard /> },
    { label: 'My Card', href: '/league/player/card', icon: <NavIcons.Statistics /> },
    { label: 'Matchday', href: '/league/player/convocation', icon: <NavIcons.Calendar /> },
    { label: 'My Team', href: '/league/player/dashboard#team', icon: <NavIcons.Teams /> },
    { label: 'Discovery', href: '/discover', icon: <NavIcons.Public /> },
    { label: 'Profile', href: '/league/player/profile', icon: <NavIcons.Settings /> },
];

export const refereeNavItems: NavItem[] = [
    { label: 'My Matches', href: '/league/referee', icon: <NavIcons.Whistle /> },
    { label: 'Schedule', href: '/league/matches', icon: <NavIcons.Calendar /> },
    { label: 'Earnings', href: '/league/referee/payouts', icon: <NavIcons.Dashboard /> },
    { label: 'Analytics', href: '/league/analytics', icon: <NavIcons.Analytics /> },
    { label: 'Discovery', href: '/discover', icon: <NavIcons.Public /> },
    { label: 'Settings', href: '/league/settings', icon: <NavIcons.Settings /> },
];

export const coachNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/league/coach/dashboard', icon: <NavIcons.Dashboard /> },
    { label: 'Roster', href: '/league/coach/roster', icon: <NavIcons.Teams /> },
    { label: 'Schedule', href: '/league/matches', icon: <NavIcons.Calendar /> },
    { label: 'Standings', href: '/league/standings', icon: <NavIcons.Standings /> },
    { label: 'Settings', href: '/league/settings', icon: <NavIcons.Settings /> },
];
