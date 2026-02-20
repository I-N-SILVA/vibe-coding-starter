/**
 * Match Mock Fixtures - PLYAZ League Manager
 */

export const MOCK_MATCHES = [
    {
        id: 'match-1',
        opponent: 'Riverside FC',
        result: 'W',
        score: '3-1',
        date: '2025-02-15',
        competition: 'Premier Division'
    },
    {
        id: 'match-2',
        opponent: 'North City',
        result: 'D',
        score: '1-1',
        date: '2025-02-10',
        competition: 'Premier Division'
    },
    {
        id: 'match-3',
        opponent: 'Blue Hawks',
        result: 'W',
        score: '2-0',
        date: '2025-02-05',
        competition: 'Premier Division'
    }
];

export const MOCK_NEXT_MATCH = {
    opponent: 'CRG Rovers',
    date: 'Sat, Feb 22',
    time: '15:00',
    venue: 'Unity Stadium',
    competition: 'Premier Division',
};

export const MOCK_MATCH_HUB = {
    id: 'm1',
    homeTeam: 'Phoenix FC',
    awayTeam: 'City Rangers',
    date: 'Saturday, 22 Feb 2026',
    time: '15:00',
    venue: 'Central Park Stadium',
    reportTime: '13:30',
    competition: 'Premier League 2026',
};

export const MOCK_CONVOCATION = {
    status: 'starting' as const,
    position: 'ST',
    jerseyNumber: 9,
    playerName: 'Marcus Rivera',
};
