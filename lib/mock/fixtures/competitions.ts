/**
 * Competition & Standings Mock Fixtures - PLYAZ League Manager
 */

import type { BracketRound } from '@/components/plyaz/KnockoutBracket';

export const MOCK_BRACKET: BracketRound[] = [
    {
        round: 1,
        name: 'Quarter-Finals',
        matchups: [
            {
                id: 'm1',
                round: 1,
                position: 0,
                homeTeamName: 'Phoenix FC',
                awayTeamName: 'Eagles',
                homeScore: 3,
                awayScore: 1,
                winnerId: 'home',
                status: 'completed',
            },
            {
                id: 'm2',
                round: 1,
                position: 1,
                homeTeamName: 'City Rangers',
                awayTeamName: 'Rovers',
                homeScore: 0,
                awayScore: 2,
                winnerId: 'away',
                status: 'completed',
            },
            {
                id: 'm3',
                round: 1,
                position: 2,
                homeTeamName: 'FC United',
                awayTeamName: 'Strikers',
                homeScore: 2,
                awayScore: 2,
                status: 'live',
            },
            {
                id: 'm4',
                round: 1,
                position: 3,
                homeTeamName: 'Titans',
                awayTeamName: 'Falcons',
                homeScore: 0,
                awayScore: 0,
                status: 'upcoming',
            },
        ],
    },
    {
        round: 2,
        name: 'Semi-Finals',
        matchups: [
            {
                id: 'm5',
                round: 2,
                position: 0,
                homeTeamName: 'Phoenix FC',
                awayTeamName: 'Rovers',
                status: 'upcoming',
            },
            {
                id: 'm6',
                round: 2,
                position: 1,
                homeTeamName: 'TBD',
                awayTeamName: 'TBD',
                status: 'upcoming',
            },
        ],
    },
    {
        round: 3,
        name: 'Final',
        matchups: [
            {
                id: 'm7',
                round: 3,
                position: 0,
                homeTeamName: 'TBD',
                awayTeamName: 'TBD',
                status: 'upcoming',
            },
        ],
    },
];
