/**
 * Competition & Standings Mock Fixtures - PLYAZ League Manager
 */

import type { BracketRound } from '@/components/plyaz/KnockoutBracket';

export const MOCK_STANDINGS = [
    { rank: 1, team: 'FC United', shortName: 'FCU', played: 12, won: 9, drawn: 2, lost: 1, gf: 28, ga: 10, gd: 18, points: 29, form: ['W', 'W', 'D', 'W', 'L'], change: 0 },
    { rank: 2, team: 'Phoenix FC', shortName: 'PHX', played: 12, won: 8, drawn: 3, lost: 1, gf: 24, ga: 12, gd: 12, points: 27, form: ['W', 'D', 'W', 'W', 'W'], change: 1 },
    { rank: 3, team: 'City Rangers', shortName: 'CRG', played: 12, won: 7, drawn: 2, lost: 3, gf: 20, ga: 15, gd: 5, points: 23, form: ['L', 'W', 'W', 'D', 'W'], change: -1 },
    { rank: 4, team: 'Eagles', shortName: 'EGL', played: 12, won: 6, drawn: 3, lost: 3, gf: 18, ga: 16, gd: 2, points: 21, form: ['D', 'W', 'L', 'W', 'D'], change: 0 },
];

export const MOCK_BRACKET: BracketRound[] = [
    {
        round: 1,
        name: 'Quarter-Finals',
        matchups: [
            { id: 'm1', round: 1, position: 0, homeTeamName: 'Phoenix FC', awayTeamName: 'Eagles', homeScore: 3, awayScore: 1, winnerId: 'home', status: 'completed' },
            { id: 'm2', round: 1, position: 1, homeTeamName: 'City Rangers', awayTeamName: 'Rovers', homeScore: 0, awayScore: 2, winnerId: 'away', status: 'completed' },
            { id: 'm3', round: 1, position: 2, homeTeamName: 'FC United', awayTeamName: 'Strikers', homeScore: 2, awayScore: 2, status: 'live' },
            { id: 'm4', round: 1, position: 3, homeTeamName: 'Titans', awayTeamName: 'Falcons', homeScore: 0, awayScore: 0, status: 'upcoming' },
        ]
    },
    {
        round: 2,
        name: 'Semi-Finals',
        matchups: [
            { id: 'm5', round: 2, position: 0, homeTeamName: 'Phoenix FC', awayTeamName: 'Rovers', status: 'upcoming' },
            { id: 'm6', round: 2, position: 1, homeTeamName: 'TBD', awayTeamName: 'TBD', status: 'upcoming' },
        ]
    },
    {
        round: 3,
        name: 'Final',
        matchups: [
            { id: 'm7', round: 3, position: 0, homeTeamName: 'TBD', awayTeamName: 'TBD', status: 'upcoming' },
        ]
    }
];

export const MOCK_COMPETITION = {
    id: 'comp-premier',
    name: 'Premier Division',
    year: 2025,
    type: 'league',
    category: 'Elite'
};
