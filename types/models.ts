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
    venueId?: string;
    groupId?: string;
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
    | 'knockout'
    | 'group_knockout'
    | 'round_robin';

export interface Competition {
    id: string;
    name: string;
    format: CompetitionFormat;
    seasonYear: string;
    year?: number;
    categoryId?: string;
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

// ============================================
// CHAMPIONSHIP SYSTEM MODELS
// ============================================

export interface Venue {
    id: string;
    organizationId: string;
    name: string;
    address?: string;
    city?: string;
    capacity?: number;
    surfaceType?: 'grass' | 'artificial' | 'indoor' | 'hybrid';
    createdAt?: string;
    updatedAt?: string;
}

export interface Category {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    minAge?: number;
    maxAge?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ChampionshipConfig {
    id: string;
    competitionId: string;
    format: 'round_robin' | 'knockout' | 'group_knockout';
    groupsCount: number;
    teamsPerGroup: number;
    advanceCount: number;
    hasGoldFinal: boolean;
    hasSilverFinal: boolean;
    hasThirdPlace: boolean;
    pointsWin: number;
    pointsDraw: number;
    pointsLoss: number;
    matchDurationMinutes: number;
    halfTimeMinutes: number;
    hasExtraTime: boolean;
    extraTimeMinutes: number;
    hasPenalties: boolean;
    maxSubstitutions: number;
    customRules: Record<string, unknown>;
}

export interface CompetitionGroup {
    id: string;
    competitionId: string;
    name: string;
    displayOrder: number;
    teams?: Team[];
}

export interface CompetitionRegistration {
    id: string;
    competitionId: string;
    playerId: string;
    teamId: string;
    idDocumentType: 'passport' | 'national_id' | 'birth_certificate' | 'other';
    idDocumentNumber: string;
    fullName: string;
    dateOfBirth: string;
    jerseyNumber?: number;
    position?: string;
    photoUrl?: string;
    customFields: Record<string, unknown>;
    status: 'pending' | 'approved' | 'rejected';
    registeredAt: string;
}

export interface RegistrationFieldConfig {
    id: string;
    competitionId: string;
    fieldName: string;
    fieldType: 'text' | 'number' | 'date' | 'select' | 'file';
    isRequired: boolean;
    options: unknown[];
    displayOrder: number;
}

export interface PlayerCompetitionStats {
    id: string;
    competitionId: string;
    playerId: string;
    teamId: string;
    gamesPlayed: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    // Goalkeeper specific
    cleanSheets: number;
    saves: number;
    goalsConceded: number;
    penaltiesSaved: number;
}

// Championship DTOs
export interface CreateVenueDto {
    name: string;
    address?: string;
    city?: string;
    capacity?: number;
    surfaceType?: Venue['surfaceType'];
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
    minAge?: number;
    maxAge?: number;
}

export interface CreateChampionshipConfigDto {
    competitionId: string;
    format: ChampionshipConfig['format'];
    groupsCount?: number;
    teamsPerGroup?: number;
    advanceCount?: number;
    hasGoldFinal?: boolean;
    hasSilverFinal?: boolean;
    hasThirdPlace?: boolean;
    pointsWin?: number;
    pointsDraw?: number;
    pointsLoss?: number;
    matchDurationMinutes?: number;
    halfTimeMinutes?: number;
    hasExtraTime?: boolean;
    extraTimeMinutes?: number;
    hasPenalties?: boolean;
    maxSubstitutions?: number;
    customRules?: Record<string, unknown>;
}

export interface CreateGroupDto {
    competitionId: string;
    name: string;
    displayOrder?: number;
}

export interface CreateRegistrationDto {
    competitionId: string;
    playerId: string;
    teamId: string;
    idDocumentType: CompetitionRegistration['idDocumentType'];
    idDocumentNumber: string;
    fullName: string;
    dateOfBirth: string;
    jerseyNumber?: number;
    position?: string;
    customFields?: Record<string, unknown>;
}
