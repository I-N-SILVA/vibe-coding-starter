/**
 * API Request Validation Schemas - PLYAZ League Manager
 * Server-side Zod schemas for API route input validation.
 * These use snake_case to match database column names.
 */

import { z } from 'zod';

// ============================================
// TEAMS
// ============================================

export const createTeamApiSchema = z.object({
    name: z.string().min(1, 'Team name is required').max(100),
    short_name: z.string().max(10).optional(),
    competition_id: z.string().uuid('Invalid competition ID').optional().nullable(),
    primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional().nullable(),
    secondary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional().nullable(),
    logo_url: z.string().url().optional().nullable(),
    manager_id: z.string().uuid().optional().nullable(),
});

export const updateTeamApiSchema = createTeamApiSchema.partial();

// ============================================
// COMPETITIONS
// ============================================

export const createCompetitionApiSchema = z.object({
    name: z.string().min(1, 'Competition name is required').max(200),
    description: z.string().max(1000).optional().nullable(),
    type: z.enum(['league', 'knockout', 'group_knockout']),
    season: z.string().max(50).optional().nullable(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    max_teams: z.number().int().min(2).max(128).optional().nullable(),
    rules: z.record(z.string(), z.unknown()).optional().nullable(),
    status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
});

export const updateCompetitionApiSchema = createCompetitionApiSchema.partial();

// ============================================
// PLAYERS
// ============================================

export const createPlayerApiSchema = z.object({
    name: z.string().min(1, 'Player name is required').max(100),
    team_id: z.string().uuid('Invalid team ID').optional().nullable(),
    position: z.enum(['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF']).optional().nullable(),
    jersey_number: z.number().int().min(1).max(99).optional().nullable(),
    date_of_birth: z.string().optional().nullable(),
    nationality: z.string().max(100).optional().nullable(),
    bio: z.string().max(500).optional().nullable(),
    status: z.enum(['active', 'injured', 'suspended', 'transferred']).optional(),
    stats: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const updatePlayerApiSchema = createPlayerApiSchema.partial();

// ============================================
// MATCHES
// ============================================

export const createMatchApiSchema = z.object({
    competition_id: z.string().uuid('Invalid competition ID'),
    home_team_id: z.string().uuid('Invalid home team ID'),
    away_team_id: z.string().uuid('Invalid away team ID'),
    matchday: z.number().int().optional().nullable(),
    round: z.string().max(50).optional().nullable(),
    venue: z.string().max(200).optional().nullable(),
    scheduled_at: z.string().optional().nullable(),
    referee_id: z.string().uuid().optional().nullable(),
    status: z.enum(['upcoming', 'live', 'completed', 'postponed', 'cancelled']).optional(),
    home_score: z.number().int().min(0).max(99).optional(),
    away_score: z.number().int().min(0).max(99).optional(),
}).refine((data) => data.home_team_id !== data.away_team_id, {
    message: 'Home and away teams must be different',
    path: ['away_team_id'],
});

export const updateMatchApiSchema = z.object({
    status: z.enum(['upcoming', 'live', 'completed', 'postponed', 'cancelled']).optional(),
    venue: z.string().max(200).optional().nullable(),
    scheduled_at: z.string().optional().nullable(),
    referee_id: z.string().uuid().optional().nullable(),
    matchday: z.number().int().optional().nullable(),
    round: z.string().max(50).optional().nullable(),
});

export const updateScoreApiSchema = z.object({
    homeScore: z.number().int().min(0, 'Score cannot be negative').max(99),
    awayScore: z.number().int().min(0, 'Score cannot be negative').max(99),
});

// ============================================
// MATCH EVENTS
// ============================================

export const createMatchEventApiSchema = z.object({
    type: z.enum(['goal', 'own_goal', 'penalty', 'yellow_card', 'red_card', 'substitution', 'injury', 'var_review']),
    team_id: z.string().uuid().optional().nullable(),
    player_id: z.string().uuid().optional().nullable(),
    player_name: z.string().max(100).optional().nullable(),
    minute: z.number().int().min(0).max(200).optional().nullable(),
    half: z.enum(['1st', '2nd', 'ET1', 'ET2', 'penalties']).optional().nullable(),
    details: z.record(z.string(), z.unknown()).optional().nullable(),
});

// ============================================
// ORGANIZATIONS
// ============================================

export const createOrganizationApiSchema = z.object({
    name: z.string().min(1, 'Organization name is required').max(200),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
    logo_url: z.string().url().optional().nullable(),
});

// ============================================
// INVITES
// ============================================

export const createInviteApiSchema = z.object({
    type: z.enum(['team_join', 'player_join', 'referee_invite', 'admin_invite']),
    competition_id: z.string().uuid().optional().nullable(),
    team_id: z.string().uuid().optional().nullable(),
    email: z.string().email('Invalid email address').optional().nullable(),
    role: z.enum(['admin', 'organizer', 'referee', 'manager', 'player', 'fan']).optional().nullable(),
});

// ============================================
// INVITE ACCEPTANCE
// ============================================

export const acceptInviteApiSchema = z.object({
    token: z.string().min(1, 'Invite token is required.'),
});

// ============================================
// USER ROLE UPDATE
// ============================================

export const updateUserRoleApiSchema = z.object({
    role: z.enum(['admin', 'referee', 'manager', 'player', 'fan'], {
        error: 'Invalid role provided.',
    }),
});

