import React from 'react';
import { NavIcons } from '@/components/plyaz/navigation/NavIcons';
import type { NavItem } from '@/components/plyaz/navigation/types';

export const adminNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/league', icon: <NavIcons.Dashboard /> },
    { label: 'Matches', href: '/league/matches', icon: <NavIcons.Matches /> },
    { label: 'Teams', href: '/league/teams', icon: <NavIcons.Teams /> },
    { label: 'Players', href: '/league/players', icon: <NavIcons.Statistics /> },
    { label: 'Standings', href: '/league/standings', icon: <NavIcons.Standings /> },
    { label: 'Fixtures', href: '/league/fixtures', icon: <NavIcons.Calendar /> },
    { label: 'Venues', href: '/league/venues', icon: <NavIcons.Public /> },
    { label: 'Categories', href: '/league/categories', icon: <NavIcons.Trophy /> },
    { label: 'Invites', href: '/league/invites', icon: <NavIcons.Public /> },
    { label: 'Analytics', href: '/league/analytics', icon: <NavIcons.Analytics /> },
    { label: 'Referee', href: '/league/referee', icon: <NavIcons.Matches /> },
    { label: 'Settings', href: '/league/settings', icon: <NavIcons.Settings /> },
];

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
    { label: 'Profile', href: '/league/player/profile', icon: <NavIcons.Settings /> },
];
