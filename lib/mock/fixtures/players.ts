/**
 * Player Mock Fixtures - PLYAZ League Manager
 */

export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export interface RosterPlayer {
    id: string;
    name: string;
    number: number;
    position: Position;
    age: number;
    status: 'fit' | 'injured' | 'suspended';
    appearances: number;
    goals: number;
}

export const MOCK_SQUAD: RosterPlayer[] = [
    { id: '1', name: 'Leo Martins', number: 1, position: 'GK', age: 28, status: 'fit', appearances: 18, goals: 0 },
    { id: '2', name: 'James Okonkwo', number: 13, position: 'GK', age: 22, status: 'fit', appearances: 4, goals: 0 },
    { id: '3', name: 'Daniel Osei', number: 4, position: 'DF', age: 26, status: 'fit', appearances: 20, goals: 2 },
    { id: '4', name: 'Carlos Mendes', number: 5, position: 'DF', age: 24, status: 'injured', appearances: 14, goals: 1 },
    { id: '5', name: 'Tom Bradley', number: 2, position: 'DF', age: 27, status: 'fit', appearances: 19, goals: 0 },
    { id: '6', name: 'Ahmed Hassan', number: 6, position: 'DF', age: 23, status: 'fit', appearances: 16, goals: 0 },
    { id: '7', name: 'Erik Svensson', number: 3, position: 'DF', age: 25, status: 'fit', appearances: 17, goals: 1 },
    { id: '8', name: 'Kai Nakamura', number: 8, position: 'MF', age: 25, status: 'fit', appearances: 21, goals: 4 },
    { id: '9', name: 'Pierre Dubois', number: 10, position: 'MF', age: 29, status: 'fit', appearances: 18, goals: 6 },
    { id: '10', name: 'Ryan Mitchell', number: 7, position: 'MF', age: 22, status: 'suspended', appearances: 15, goals: 3 },
    { id: '11', name: 'Kofi Asante', number: 14, position: 'MF', age: 21, status: 'fit', appearances: 12, goals: 1 },
    { id: '12', name: 'Luca Romano', number: 16, position: 'MF', age: 24, status: 'fit', appearances: 10, goals: 0 },
    { id: '13', name: 'Marcus Rivera', number: 9, position: 'FW', age: 26, status: 'fit', appearances: 21, goals: 12 },
    { id: '14', name: 'Yuki Tanaka', number: 11, position: 'FW', age: 23, status: 'fit', appearances: 19, goals: 8 },
    { id: '15', name: 'Jordan Blake', number: 17, position: 'FW', age: 20, status: 'fit', appearances: 8, goals: 2 },
];

export const MOCK_PLAYER_PROFILE = {
    id: 'p1',
    name: 'Marcus Rivera',
    position: 'FW' as Position,
    jerseyNumber: 9,
    nationality: 'English',
    age: 24,
    team: 'Phoenix FC',
    overallRating: 86,
    avatar: null,
    stats: {
        pace: 78,
        shooting: 85,
        passing: 72,
        dribbling: 80,
        defense: 45,
        physical: 70,
    },
    seasonStats: {
        goals: 12,
        assists: 4,
        appearances: 18,
        yellowCards: 2,
        redCards: 0,
        minutesPlayed: 1420,
        cleanSheets: 0,
        motm: 3,
    },
    competitions: [
        { name: 'Premier League 2026', goals: 9, assists: 3, apps: 14, rating: '8.2' },
        { name: 'Champions Cup', goals: 3, assists: 1, apps: 4, rating: '7.8' },
    ],
};

export const FORMATION_POSITIONS = [
    { x: 50, y: 88, role: 'GK', player: 'D. Silva', number: 1 },
    { x: 20, y: 70, role: 'LB', player: 'A. Cole', number: 3 },
    { x: 40, y: 72, role: 'CB', player: 'R. Keane', number: 4 },
    { x: 60, y: 72, role: 'CB', player: 'J. Stones', number: 5 },
    { x: 80, y: 70, role: 'RB', player: 'T. Walker', number: 2 },
    { x: 30, y: 50, role: 'CM', player: 'L. Modric', number: 8 },
    { x: 50, y: 45, role: 'CM', player: 'K. De Bruyne', number: 10 },
    { x: 70, y: 50, role: 'CM', player: 'N. Kanté', number: 7 },
    { x: 20, y: 25, role: 'LW', player: 'S. Mané', number: 11 },
    { x: 50, y: 18, role: 'ST', player: 'M. Rivera', number: 9, isCurrentPlayer: true },
    { x: 80, y: 25, role: 'RW', player: 'M. Salah', number: 6 },
];

export const BENCH_PLAYERS = [
    { name: 'C. Peres', position: 'GK', number: 12 },
    { name: 'H. Maguire', position: 'CB', number: 15 },
    { name: 'F. Henderson', position: 'CM', number: 14 },
    { name: 'J. Lingard', position: 'RW', number: 17 },
    { name: 'D. Calvert', position: 'ST', number: 20 },
];
