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
    competitionId?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    managerId?: string;
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
    | 'upcoming'
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

// ============================================
// ORGANIZATION & INVITE MODELS
// ============================================

export interface Organization {
    id: string;
    name: string;
    slug: string;
    ownerId: string;
    logoUrl: string | null;
    plan: 'free' | 'pro' | 'elite';
    createdAt?: string;
    updatedAt?: string;
}

export interface Invite {
    id: string;
    organizationId: string;
    competitionId: string | null;
    teamId: string | null;
    type: 'team_join' | 'player_join' | 'referee_invite' | 'admin_invite';
    email: string | null;
    token: string;
    status: 'pending' | 'accepted' | 'expired' | 'revoked';
    expiresAt: string;
    acceptedBy: string | null;
    createdAt?: string;
}

export interface CreateOrganizationDto {
    name: string;
    slug: string;
}

export interface CreateInviteDto {
    type: Invite['type'];
    competitionId?: string;
    teamId?: string;
    email?: string;
    role?: 'admin' | 'organizer' | 'referee' | 'manager' | 'player' | 'fan';
}

export interface CreatePlayerDto {
    name: string;
    teamId?: string;
    position?: PlayerPosition;
    jerseyNumber?: number;
    dateOfBirth?: string;
    nationality?: string;
    bio?: string;
}
