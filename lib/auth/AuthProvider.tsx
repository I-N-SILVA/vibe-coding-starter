'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Profile } from '@/lib/supabase/types';
import { authService } from '@/services/auth';
import { useRouter } from 'next/navigation';

// ============================================
// TYPES
// ============================================

interface AuthUser {
    id: string;
    email?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    profile: Profile | null;
    session: Session | null;
    isLoading: boolean;
    isAuthInitialized: boolean;
    isAuthenticated: boolean;
    role: Profile['role'];
    isAdmin: boolean;
    isReferee: boolean;
    isManager: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string, fullName: string, role?: Profile['role'], inviteToken?: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    forgotPassword: (email: string) => Promise<{ error: string | null }>;
    updatePassword: (password: string) => Promise<{ error: string | null }>;
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthInitialized, setIsAuthInitialized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let unsubscribeFn: (() => void) | null = null;

        const init = async () => {
            // Load initial user state
            const { user: authUser, profile: authProfile } = await authService.getCurrentUser();
            setUser(authUser);
            setProfile(authProfile);
            setIsLoading(false);
            setIsAuthInitialized(true);

            // Subscribe to auth state changes (Supabase only; no-op in mock)
            const subscription = await authService.onAuthStateChange(async (userId) => {
                if (userId) {
                    const p = await authService.getProfileById(userId);
                    setUser({ id: userId });
                    setProfile(p);
                } else {
                    setUser(null);
                    setProfile(null);
                    setSession(null);
                }
            });
            unsubscribeFn = subscription.unsubscribe;
        };

        init();

        return () => {
            unsubscribeFn?.();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const result = await authService.signIn(email, password);
        if (!result.error) {
            // Reload user + profile after sign-in
            const { user: authUser, profile: authProfile } = await authService.getCurrentUser();
            setUser(authUser);
            setProfile(authProfile);
        }
        return result;
    };

    const signUp = async (
        email: string,
        password: string,
        fullName: string,
        role: Profile['role'] = 'organizer',
        inviteToken?: string
    ) => {
        const result = await authService.signUp(email, password, fullName, role, inviteToken);
        if (!result.error) {
            const { user: authUser, profile: authProfile } = await authService.getCurrentUser();
            setUser(authUser);
            setProfile(authProfile);
        }
        return result;
    };

    const signOut = async () => {
        await authService.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
        router.push('/login');
    };

    const forgotPassword = (email: string) => authService.forgotPassword(email);

    const updatePassword = (password: string) => authService.updatePassword(password);

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return { error: 'Not authenticated' };
        const { profile: updated, error } = await authService.updateProfile(user.id, updates);
        if (updated) setProfile(updated);
        return { error };
    };

    const role = profile?.role ?? 'fan';

    const value: AuthContextType = {
        user,
        profile,
        session,
        isLoading,
        isAuthInitialized,
        isAuthenticated: !!user,
        role,
        isAdmin: role === 'admin',
        isReferee: role === 'referee',
        isManager: role === 'manager',
        signIn,
        signUp,
        signOut,
        forgotPassword,
        updatePassword,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthProvider;
