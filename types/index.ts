/**
 * Type Exports — PLYAZ League Manager
 * 
 * ARCHITECTURE:
 * - lib/supabase/types.ts  → Single source of truth (snake_case, matches DB exactly)
 * - types/models.ts        → Re-exports + backward-compatible camelCase aliases + DTOs
 * - lib/mappers/index.ts   → Runtime snake↔camel converters for data
 * 
 * Import from '@/types' in UI code. Import from '@/lib/supabase/types' only in
 * data-access layers (repositories, API routes).
 */

export * from './models';
