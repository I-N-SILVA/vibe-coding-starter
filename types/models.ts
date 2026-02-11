/**
 * Core Type Definitions - PLYAZ League Manager
 * Shared TypeScript interfaces for the application
 */

// ============================================
// TEAM & PLAYER MODELS
// ============================================

export interface Team {
    id: string;
    name: string;
    shortName: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    stats?: TeamStats;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface TeamStats {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
}

export interface Player {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    avatarUrl?: string;
    position: PlayerPosition;
    number: number;
    teamId: string;
    stats?: PlayerStats;
    createdAt?: Date;
    updatedAt?: Date;
}

export type PlayerPosition =
    | 'goalkeeper'
    | 'defender'
    | 'midfielder'
    | 'forward';

export interface PlayerStats {
    appearances: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
}

// ============================================
// MATCH MODELS
// ============================================

export type MatchStatus =
    | 'scheduled'
    | 'live'
    | 'completed'
    | 'postponed'
    | 'cancelled';

export interface Match {
    id: string;
    competitionId: string;
    homeTeam: Team;
    awayTeam: Team;
    homeScore: number;
    awayScore: number;
    status: MatchStatus;
    matchTime?: string;      // "67'" for live, "3:00 PM" for scheduled
    scheduledDate: Date;
    venue?: string;
    events?: MatchEvent[];
    createdAt?: Date;
    updatedAt?: Date;
}

export type MatchEventType =
    | 'goal'
    | 'own_goal'
    | 'penalty'
    | 'yellow_card'
    | 'red_card'
    | 'substitution';

export interface MatchEvent {
    id: string;
    matchId: string;
    type: MatchEventType;
    minute: number;
    playerId: string;
    playerName: string;
    teamId: string;
    assistPlayerId?: string;
    assistPlayerName?: string;
    createdAt: Date;
}

// ============================================
// COMPETITION MODELS
// ============================================

export type CompetitionFormat =
    | 'league'
    | 'cup'
    | 'group';

export interface Competition {
    id: string;
    name: string;
    format: CompetitionFormat;
    seasonYear: string;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    teams?: Team[];
    standings?: StandingsEntry[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface StandingsEntry {
    position: number;
    teamId: string;
    team: Team;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    form?: ('W' | 'D' | 'L')[];
}

// ============================================
// ACTIVITY & NOTIFICATIONS
// ============================================

export interface Activity {
    id: string;
    action: string;
    detail: string;
    entityType: 'match' | 'team' | 'player' | 'competition';
    entityId: string;
    timestamp: Date;
    userId?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

// ============================================
// DTO TYPES (Data Transfer Objects)
// ============================================

export interface CreateCompetitionDto {
    name: string;
    format: CompetitionFormat;
    startDate: Date;
    endDate?: Date;
}

export interface CreateTeamDto {
    name: string;
    shortName: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
}

export interface CreateMatchDto {
    competitionId: string;
    homeTeamId: string;
    awayTeamId: string;
    scheduledDate: Date;
    venue?: string;
}

export interface UpdateScoreDto {
    matchId: string;
    homeScore: number;
    awayScore: number;
}

export interface AddMatchEventDto {
    matchId: string;
    type: MatchEventType;
    minute: number;
    playerId: string;
    teamId: string;
    assistPlayerId?: string;
}
