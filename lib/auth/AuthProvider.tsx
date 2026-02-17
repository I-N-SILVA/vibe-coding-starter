'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { authService } from '@/services/auth';
import type { Profile } from '@/lib/supabase/types';

// ============================================
// TYPES
// ============================================

interface AuthUser {
    id: string;
    email: string;
    profile: Profile | null;
}

interface AuthContextType {
    user: AuthUser | null;
    profile: Profile | null;
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
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthInitialized, setIsAuthInitialized] = useState(false);

    const supabase = createClient();

    // Fetch profile from Supabase with retry logic to handle trigger race conditions
    const fetchProfile = useCallback(async (userId: string, retries = 3, delay = 1000) => {
        for (let i = 0; i <= retries; i++) {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error) {
                    if (i < retries) {
                        console.log(`[Auth] Profile not found, retrying... (${i + 1}/${retries})`);
                        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                        continue;
                    }
                    throw error;
                }
                return data as Profile;
            } catch (err) {
                if (i === retries) {
                    console.warn('[Auth] Final profile fetch attempt failed:', err);
                    return null;
                }
            }
        }
        return null;
    }, [supabase]);

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await authService.getSession();
                const authUser = session?.user;
                if (authUser) {
                    const prof = await fetchProfile(authUser.id);
                    setUser({ id: authUser.id, email: authUser.email || '', profile: prof });
                    setProfile(prof);
                }
            } catch (err) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[Auth] Initialization error:', err);
                }
            } finally {
                setIsLoading(false);
                setIsAuthInitialized(true);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const prof = await fetchProfile(session.user.id);
                setUser({ id: session.user.id, email: session.user.email || '', profile: prof });
                setProfile(prof);
            } else {
                setUser(null);
                setProfile(null);
            }
            setIsLoading(false);
            setIsAuthInitialized(true);
        });

        return () => subscription.unsubscribe();
    }, [supabase, fetchProfile]);

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await authService.signIn(email, password);
            if (error) return { error: error.message };
            return { error: null };
        } catch (err: unknown) {
            return { error: err instanceof Error ? err.message : 'An unexpected error occurred' };
        }
    };

    const signUp = async (email: string, password: string, fullName: string, role: Profile['role'] = 'organizer', inviteToken?: string) => {
        try {
            if (inviteToken) {
                const response = await fetch('/api/league/invites/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: inviteToken }),
                });

                if (!response.ok) {
                    const { error } = await response.json();
                    return { error: `Invalid invite token: ${error}` };
                }
            }

            const { error } = await authService.signUp(email, password, fullName, role);
            if (error) return { error: error.message };
            return { error: null };
        } catch (err: unknown) {
            return { error: err instanceof Error ? err.message : 'An unexpected error occurred' };
        }
    };

    const signOut = async () => {
        await authService.signOut();
        setUser(null);
        setProfile(null);
    };

    const forgotPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        return { error: error?.message || null };
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return { error: 'Not authenticated' };

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (!error) {
            const updatedProfile = { ...profile, ...updates } as Profile;
            setProfile(updatedProfile);
            setUser({ ...user, profile: updatedProfile });
        }

        return { error: error?.message || null };
    };

    const role = profile?.role || 'fan';

    const value: AuthContextType = {
        user,
        profile,
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
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthProvider;
