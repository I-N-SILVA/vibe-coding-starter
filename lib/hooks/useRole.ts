'use client';

import { usePathname } from 'next/navigation';

/**
 * useRole Hook - PLYAZ League Manager
 * Abstracts role detection from path-based logic
 * Future-proofs for real Supabase Auth roles
 */

export type UserRole = 'admin' | 'referee' | 'fan' | 'guest';

interface UseRoleResult {
    role: UserRole;
    isAdmin: boolean;
    isReferee: boolean;
    isFan: boolean;
    isAuthenticated: boolean;
    canManageLeague: boolean;
    canScoreMatch: boolean;
}

export function useRole(): UseRoleResult {
    const pathname = usePathname();

    // Path-based role detection (to be replaced with Supabase Auth)
    const isAdminPath = pathname.includes('/league') && !pathname.includes('/public') && !pathname.includes('/referee');
    const isRefereePath = pathname.includes('/referee');
    const isFanPath = pathname.includes('/public');

    // Determine role from path
    let role: UserRole = 'guest';
    if (isAdminPath) role = 'admin';
    else if (isRefereePath) role = 'referee';
    else if (isFanPath) role = 'fan';

    return {
        role,
        isAdmin: role === 'admin',
        isReferee: role === 'referee',
        isFan: role === 'fan',
        isAuthenticated: role !== 'guest',
        canManageLeague: role === 'admin',
        canScoreMatch: role === 'admin' || role === 'referee',
    };
}

export default useRole;
