/**
 * Match Status Utilities - PLYAZ League Manager
 * Centralized styling and formatting for match statuses
 */

export type MatchStatus = 'live' | 'upcoming' | 'completed' | 'postponed' | 'cancelled';

interface MatchStatusStyles {
    bgColor: string;
    textColor: string;
    dotColor: string;
    label: string;
}

/**
 * Get consistent styling for match status badges
 */
export function getMatchStatusStyles(status: MatchStatus): MatchStatusStyles {
    switch (status) {
        case 'live':
            return {
                bgColor: 'bg-red-50',
                textColor: 'text-red-600',
                dotColor: 'bg-red-500',
                label: 'LIVE',
            };
        case 'upcoming':
            return {
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-600',
                dotColor: 'bg-blue-500',
                label: 'UPCOMING',
            };
        case 'completed':
            return {
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-600',
                dotColor: 'bg-gray-400',
                label: 'FINAL',
            };
        case 'postponed':
            return {
                bgColor: 'bg-yellow-50',
                textColor: 'text-yellow-700',
                dotColor: 'bg-yellow-500',
                label: 'POSTPONED',
            };
        case 'cancelled':
            return {
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-500',
                dotColor: 'bg-gray-400',
                label: 'CANCELLED',
            };
        default: {
            const _exhaustive: never = status;
            return {
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-600',
                dotColor: 'bg-gray-400',
                label: String(_exhaustive).toUpperCase(),
            };
        }
    }
}

/**
 * Format match time for display
 */
export function formatMatchTime(time: string, status: MatchStatus): string {
    if (status === 'live') {
        return time; // Already formatted as "67'"
    }
    return time;
}

/**
 * Format match date for display
 */
export function formatMatchDate(date: string | Date): string {
    if (typeof date === 'string') {
        return date; // Return as-is if already formatted
    }

    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
}
