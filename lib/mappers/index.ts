/**
 * Entity Mappers — PLYAZ League Manager
 * Converts between snake_case (DB/API) and camelCase (UI) representations.
 * 
 * Usage:
 *   const uiMatch = mapMatchToUI(dbMatch);
 *   const dbMatch = mapMatchToDB(uiMatch);
 * 
 * When Supabase is connected, all queries return snake_case. These mappers
 * provide a clean boundary so UI components never deal with snake_case.
 */

// ============================================
// GENERIC CASE CONVERTER
// ============================================

type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
    ? `${P}${Capitalize<CamelCase<Q>>}`
    : S;

type SnakeCase<S extends string> = S extends `${infer P}${infer R}`
    ? P extends Uppercase<P>
    ? `_${Lowercase<P>}${SnakeCase<R>}`
    : `${P}${SnakeCase<R>}`
    : S;

export type CamelCaseKeys<T> = {
    [K in keyof T as K extends string ? CamelCase<K> : K]: T[K];
};

export type SnakeCaseKeys<T> = {
    [K in keyof T as K extends string ? SnakeCase<K> : K]: T[K];
};

/**
 * Convert a snake_case object to camelCase.
 * Handles flat objects only (no deep nesting) — which is what Supabase returns.
 */
export function toCamelCase<T extends Record<string, unknown>>(obj: T): CamelCaseKeys<T> {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = obj[key];
    }
    return result as CamelCaseKeys<T>;
}

/**
 * Convert a camelCase object to snake_case.
 */
export function toSnakeCase<T extends Record<string, unknown>>(obj: T): SnakeCaseKeys<T> {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        result[snakeKey] = obj[key];
    }
    return result as SnakeCaseKeys<T>;
}

/**
 * Convert an array of snake_case objects to camelCase.
 */
export function mapArrayToUI<T extends Record<string, unknown>>(arr: T[]): CamelCaseKeys<T>[] {
    return arr.map(toCamelCase);
}

// ============================================
// ENTITY-SPECIFIC MAPPERS
// ============================================
// These handle edge cases like joined relations (home_team, away_team, etc.)

import type {
    Match as DBMatch,
    Team as DBTeam,
    StandingsEntry as DBStandingsEntry,
} from '@/lib/supabase/types';

/**
 * Map a DB match (with optional joined teams) to UI representation.
 */
export function mapMatchToUI(match: DBMatch) {
    return {
        ...toCamelCase(match),
        // Preserve joined entities as camelCase too
        homeTeam: match.home_team ? toCamelCase(match.home_team) : undefined,
        awayTeam: match.away_team ? toCamelCase(match.away_team) : undefined,
        referee: match.referee ? toCamelCase(match.referee) : undefined,
    };
}

/**
 * Map a DB standings entry (with optional joined team) to UI representation.
 */
export function mapStandingsToUI(entry: DBStandingsEntry) {
    return {
        ...toCamelCase(entry),
        team: entry.team ? toCamelCase(entry.team) : undefined,
    };
}

/**
 * Map a DB team to UI representation.
 */
export function mapTeamToUI(team: DBTeam) {
    return toCamelCase(team);
}
