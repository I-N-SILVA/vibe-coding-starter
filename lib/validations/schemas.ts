/**
 * Form Validation Schemas - PLYAZ League Manager
 * Zod schemas for form validation
 */

import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================
// COMPETITION SCHEMAS
// ============================================

export const createCompetitionSchema = z.object({
    name: z
        .string()
        .min(1, 'Competition name is required')
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name must be less than 50 characters'),
    format: z.enum(['league', 'cup', 'group']).describe('Please select a format'),
    startDate: z
        .string()
        .min(1, 'Start date is required'),
    endDate: z.string().optional(),
});

export type CreateCompetitionFormData = z.infer<typeof createCompetitionSchema>;

// ============================================
// TEAM SCHEMAS
// ============================================

export const createTeamSchema = z.object({
    name: z
        .string()
        .min(1, 'Team name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(30, 'Name must be less than 30 characters'),
    shortName: z
        .string()
        .min(1, 'Short name is required')
        .max(5, 'Short name must be 5 characters or less'),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
});

export type CreateTeamFormData = z.infer<typeof createTeamSchema>;

// ============================================
// MATCH SCHEMAS
// ============================================

export const scheduleMatchSchema = z.object({
    homeTeamId: z.string().min(1, 'Please select a home team'),
    awayTeamId: z.string().min(1, 'Please select an away team'),
    scheduledDate: z.string().min(1, 'Match date is required'),
    scheduledTime: z.string().min(1, 'Match time is required'),
    venue: z.string().optional(),
}).refine((data) => data.homeTeamId !== data.awayTeamId, {
    message: 'Home and away teams must be different',
    path: ['awayTeamId'],
});

export const scheduleMatchAtSchema = z.object({
    competition_id: z.string().min(1, 'Please select a competition'),
    home_team_id: z.string().min(1, 'Please select a home team'),
    away_team_id: z.string().min(1, 'Please select an away team'),
    scheduled_at: z.string().min(1, 'Match date and time is required'),
    venue: z.string().optional(),
}).refine((data) => data.home_team_id !== data.away_team_id, {
    message: 'Home and away teams must be different',
    path: ['away_team_id'],
});

export type ScheduleMatchFormData = z.infer<typeof scheduleMatchSchema>;
export type ScheduleMatchAtFormData = z.infer<typeof scheduleMatchAtSchema>;

// ============================================
// PLAYER SCHEMAS
// ============================================

export const addPlayerSchema = z.object({
    firstName: z
        .string()
        .min(1, 'First name is required')
        .max(30, 'First name must be less than 30 characters'),
    lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(30, 'Last name must be less than 30 characters'),
    number: z
        .number()
        .min(1, 'Jersey number must be at least 1')
        .max(99, 'Jersey number must be 99 or less'),
    position: z.enum(['goalkeeper', 'defender', 'midfielder', 'forward']).describe('Please select a position'),
});

export type AddPlayerFormData = z.infer<typeof addPlayerSchema>;

// ============================================
// VALIDATION HELPER
// ============================================

/**
 * Validates form data against a schema and returns errors
 */
export function validateForm<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) {
            errors[path] = issue.message;
        }
    });

    return { success: false, errors };
}
