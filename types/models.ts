/**
 * UI-Facing Type Definitions — PLYAZ League Manager
 * 
 * This file re-exports all canonical entity types from `lib/supabase/types.ts`
 * (the single source of truth) and provides camelCase DTO interfaces for
 * backward compatibility with existing UI code.
 * 
 * When Supabase is connected, entities returned from queries are snake_case.
 * Use lib/mappers to convert at the data-access boundary.
 */

// ============================================
// RE-EXPORT CANONICAL DB ENTITY TYPES
// ============================================

export type {
    // Core entities
    Organization,
    Profile,
    Competition,
    Team,
    Player,
    PlayerPosition,
    PlayerStats,
    Match,
    MatchEvent,
    StandingsEntry,
    Invite,
    AuditLog,
    // Championship system
    Venue,
    Category,
    ChampionshipConfig,
    Group,
    GroupTeam,
    CompetitionRegistration,
    CompetitionRegistrationField,
    PlayerCompetitionStats,
    // Derived aliases
    MatchStatus,
    MatchEventType,
    CompetitionFormat,
    // Database wrapper
    Database,
} from '@/lib/supabase/types';

// Backward-compatible alias
export type { CompetitionFormat as CompetitionType } from '@/lib/supabase/types';

// ============================================
// DTOs (camelCase for UI forms/mutations)
// ============================================
// These accept camelCase field names used throughout the existing codebase.
// When the repository layer sends to Supabase, it converts to snake_case via mappers.

export interface CreateOrganizationDto {
    name: string;
    slug: string;
}

export interface CreateCompetitionDto {
    name: string;
    description?: string;
    type: 'league' | 'knockout' | 'group_knockout';
    season?: string;
    seasonYear?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    start_date?: string;
    end_date?: string;
    max_teams?: number;
    year?: number;
    categoryId?: string;
    category_id?: string;
    rules?: Record<string, unknown>;
}

export interface CreateTeamDto {
    name: string;
    shortName?: string;
    short_name?: string;
    competitionId?: string;
    competition_id?: string;
    logoUrl?: string;
    primaryColor?: string;
    primary_color?: string;
    secondaryColor?: string;
    secondary_color?: string;
}

export interface CreatePlayerDto {
    name: string;
    teamId?: string;
    team_id?: string;
    position?: 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM' | 'LW' | 'RW' | 'ST' | 'CF' | 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
    jerseyNumber?: number;
    jersey_number?: number;
    dateOfBirth?: string;
    date_of_birth?: string;
    nationality?: string;
    bio?: string;
    socialLinks?: {
        instagram?: string;
        twitter?: string;
        linkedin?: string;
    };
}

export interface CreateMatchDto {
    competitionId?: string;
    competition_id?: string;
    homeTeamId?: string;
    home_team_id?: string;
    awayTeamId?: string;
    away_team_id?: string;
    scheduledDate?: Date | string;
    scheduled_at?: string;
    venue?: string;
    venueId?: string;
    venue_id?: string;
    matchday?: number;
    round?: string;
    group_id?: string;
    groupId?: string;
    referee_id?: string;
    refereeId?: string;
}

export interface UpdateScoreDto {
    matchId: string;
    homeScore: number;
    awayScore: number;
    status?: string;
}

export interface CreateInviteDto {
    type: 'team_join' | 'player_join' | 'referee_invite' | 'admin_invite';
    competitionId?: string;
    competition_id?: string;
    teamId?: string;
    team_id?: string;
    email?: string;
    role?: 'admin' | 'organizer' | 'referee' | 'manager' | 'player' | 'fan';
}

export interface AddMatchEventDto {
    matchId?: string;
    match_id?: string;
    type: 'goal' | 'own_goal' | 'penalty' | 'yellow_card' | 'red_card' | 'substitution' | 'injury' | 'var_review';
    minute?: number;
    playerId?: string;
    player_id?: string;
    playerName?: string;
    player_name?: string;
    teamId?: string;
    team_id?: string;
    assistPlayerId?: string;
    half?: '1st' | '2nd' | 'ET1' | 'ET2' | 'penalties';
    details?: Record<string, unknown>;
}

export interface CreateVenueDto {
    name: string;
    address?: string;
    city?: string;
    capacity?: number;
    surfaceType?: 'grass' | 'artificial' | 'indoor' | 'hybrid';
    surface_type?: 'grass' | 'artificial' | 'indoor' | 'hybrid' | null;
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
    minAge?: number;
    min_age?: number;
    maxAge?: number;
    max_age?: number;
}

export type CreateChampionshipConfigDto = {
    competitionId?: string;
    competition_id?: string;
    format: 'round_robin' | 'knockout' | 'group_knockout';
    groupsCount?: number;
    groups_count?: number;
    teamsPerGroup?: number;
    teams_per_group?: number;
    advanceCount?: number;
    advance_count?: number;
    hasGoldFinal?: boolean;
    has_gold_final?: boolean;
    hasSilverFinal?: boolean;
    has_silver_final?: boolean;
    hasThirdPlace?: boolean;
    has_third_place?: boolean;
    pointsWin?: number;
    points_win?: number;
    pointsDraw?: number;
    points_draw?: number;
    pointsLoss?: number;
    points_loss?: number;
    matchDurationMinutes?: number;
    match_duration_minutes?: number;
    halfTimeMinutes?: number;
    half_time_minutes?: number;
    hasExtraTime?: boolean;
    has_extra_time?: boolean;
    extraTimeMinutes?: number;
    extra_time_minutes?: number;
    hasPenalties?: boolean;
    has_penalties?: boolean;
    maxSubstitutions?: number;
    max_substitutions?: number;
    customRules?: Record<string, unknown>;
    custom_rules?: Record<string, unknown>;
};

export interface CreateGroupDto {
    competitionId?: string;
    competition_id?: string;
    name: string;
    displayOrder?: number;
    display_order?: number;
}

export interface CreateRegistrationDto {
    competitionId?: string;
    competition_id?: string;
    playerId?: string;
    player_id?: string;
    teamId?: string;
    team_id?: string;
    idDocumentType?: 'passport' | 'national_id' | 'birth_certificate' | 'other';
    id_document_type?: 'passport' | 'national_id' | 'birth_certificate' | 'other';
    idDocumentNumber?: string;
    id_document_number?: string;
    fullName?: string;
    full_name?: string;
    dateOfBirth?: string;
    date_of_birth?: string;
    jerseyNumber?: number;
    jersey_number?: number;
    position?: string;
    customFields?: Record<string, unknown>;
    custom_fields?: Record<string, unknown>;
}

// ============================================
// UI-ONLY TYPES (not in database)
// ============================================

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

export interface Activity {
    id: string;
    action: string;
    detail: string;
    entityType: 'match' | 'team' | 'player' | 'competition';
    entityId: string;
    timestamp: Date | string;
    userId?: string;
}

export interface ActivityItem {
    id: string;
    action: string;
    detail: string;
    entity_type: 'match' | 'team' | 'player' | 'competition';
    entity_id: string;
    timestamp: string;
    user_id?: string;
}

// ============================================
// API RESPONSE WRAPPERS
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
