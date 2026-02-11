/**
 * Demo Data Constants - PLYAZ League Manager
 * Extracted mock data for development and testing
 */

export interface DemoTeam {
    id: string;
    name: string;
    shortName: string;
}

export interface DemoMatch {
    id: string;
    homeTeam: DemoTeam;
    awayTeam: DemoTeam;
    homeScore?: number;
    awayScore?: number;
    status: 'live' | 'upcoming' | 'completed';
    matchTime: string;
    date?: string;
    venue?: string;
}

export interface DemoActivity {
    id: string;
    action: string;
    detail: string;
    time: string;
}

export interface DemoCompetition {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'draft';
}

// Fallback demo data for competitions
export const DEFAULT_COMPETITIONS: DemoCompetition[] = [
    {
        id: '1',
        name: 'Premier League 2024',
        description: 'Elite professional football league',
        status: 'active',
    },
    {
        id: '2',
        name: 'Championship 2024',
        description: 'Secondary professional football league',
        status: 'active',
    },
];

// Fallback demo data for teams
export const DEFAULT_TEAMS: DemoTeam[] = [
    { id: '1', name: 'FC United', shortName: 'FCU' },
    { id: '2', name: 'City Rangers', shortName: 'CRG' },
    { id: '3', name: 'Phoenix FC', shortName: 'PHX' },
    { id: '4', name: 'Eagles', shortName: 'EGL' },
    { id: '5', name: 'Rovers', shortName: 'ROV' },
    { id: '6', name: 'Athletic', shortName: 'ATH' },
    { id: '7', name: 'West Ham Juniors', shortName: 'WHJ' },
    { id: '8', name: 'London Lions', shortName: 'LLN' },
];

// Fallback demo data for live matches
export const DEFAULT_LIVE_MATCHES: DemoMatch[] = [
    {
        id: '1',
        homeTeam: DEFAULT_TEAMS[0],
        awayTeam: DEFAULT_TEAMS[1],
        homeScore: 2,
        awayScore: 1,
        status: 'live',
        matchTime: "67'",
    },
    {
        id: '2',
        homeTeam: DEFAULT_TEAMS[2],
        awayTeam: DEFAULT_TEAMS[3],
        homeScore: 0,
        awayScore: 0,
        status: 'live',
        matchTime: "23'",
    },
];

// Fallback demo data for upcoming matches
export const DEFAULT_UPCOMING_MATCHES: DemoMatch[] = [
    {
        id: '3',
        homeTeam: DEFAULT_TEAMS[4],
        awayTeam: DEFAULT_TEAMS[5],
        status: 'upcoming',
        matchTime: '3:00 PM',
        date: 'Today',
        venue: 'Main Stadium',
    },
];

// Fallback demo data for all matches
export const DEFAULT_MATCHES: DemoMatch[] = [
    ...DEFAULT_LIVE_MATCHES,
    ...DEFAULT_UPCOMING_MATCHES,
    {
        id: '4',
        homeTeam: DEFAULT_TEAMS[6],
        awayTeam: DEFAULT_TEAMS[7],
        homeScore: 1,
        awayScore: 3,
        status: 'completed',
        matchTime: 'FT',
        date: 'Yesterday',
        venue: 'Park Arena',
    }
];

// Fallback demo data for recent activity
export const DEFAULT_RECENT_ACTIVITY: DemoActivity[] = [
    { id: '1', action: 'Goal scored', detail: 'J. Smith (FC United)', time: '2 min ago' },
    { id: '2', action: 'Yellow card', detail: 'M. Johnson (City Rangers)', time: '5 min ago' },
    { id: '3', action: 'Match started', detail: 'Phoenix FC vs Eagles', time: '23 min ago' },
    { id: '4', action: 'Team created', detail: 'West Ham Juniors', time: '1 hour ago' },
];

// Admin navigation items
export const ADMIN_NAV_ITEMS = [
    { label: 'Dashboard', href: '/league' },
    { label: 'Matches', href: '/league/matches' },
    { label: 'Teams', href: '/league/teams' },
    { label: 'Standings', href: '/league/standings' },
    { label: 'Settings', href: '/league/settings' },
];

// Public navigation items
export const PUBLIC_NAV_ITEMS = [
    { label: 'Scoreboard', href: '/league/public/scoreboard' },
    { label: 'Standings', href: '/league/public/standings' },
    { label: 'Fixtures', href: '/league/public/fixtures' },
];
