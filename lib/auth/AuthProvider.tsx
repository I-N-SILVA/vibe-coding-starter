'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
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

    const supabase = createClient();

    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
            const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            // Supabase config check - visible in dev tools only
            if (!hasUrl || !hasKey) console.warn('[Auth] Missing Supabase env vars:', { hasUrl, hasKey });
        }
    }, []);

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
                    // 406 Not Acceptable or 404/PGRST116 means it's likely not created yet
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
                const { data: { user: authUser } } = await Promise.race([
                    supabase.auth.getUser(),
                    new Promise<{ data: { user: null } }>((_, reject) => setTimeout(() => reject(new Error('Auth init timed out')), 45000))
                ]);
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
            }
        };

        initAuth();

        // Listen for auth changes
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
        });

        return () => subscription.unsubscribe();
    }, [supabase, fetchProfile]);

    const signIn = async (email: string, password: string) => {
        try {
            console.log('[Auth] Attempting sign-in for:', email);
            const { error, data } = await Promise.race([
                supabase.auth.signInWithPassword({ email, password }),
                new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Sign in timed out')), 45000))
            ]);

            if (error) {
                console.warn('[Auth] Sign-in error:', error.message);
                return { error: error.message };
            }

            console.log('[Auth] Sign-in successful:', data.user?.id);
            return { error: null };
        } catch (err: unknown) {
            return { error: err instanceof Error ? err.message : 'An unexpected error occurred' };
        }
    };

    // Sign Up
    const signUp = async (email: string, password: string, fullName: string, role: Profile['role'] = 'organizer', inviteToken?: string) => {
        try {
            let options: { data: any } = { data: { full_name: fullName, role, approval_status: 'pending' } };

            if (inviteToken) {
                const response = await fetch('/api/league/invites/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: inviteToken }),
                });

                if (response.ok) {
                    const { invited_role, organization_id } = await response.json();
                    options.data = {
                        ...options.data,
                        role: invited_role,
                        organization_id,
                        approval_status: 'approved',
                    };
                } else {
                    const { error } = await response.json();
                    return { error: `Invalid invite token: ${error}` };
                }
            }

            console.log('[Auth] Attempting sign-up for:', email);
            const { error, data } = await Promise.race([
                supabase.auth.signUp({
                    email,
                    password,
                    options,
                }),
                new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Sign up timed out')), 45000))
            ]);

            if (error) {
                console.warn('[Auth] Sign-up error:', error.message);
                return { error: error.message };
            }

            console.log('[Auth] Sign-up successful:', data.user?.id);
            return { error: null };
        } catch (err: unknown) {
            return { error: err instanceof Error ? err.message : 'An unexpected error occurred' };
        }
    };

    // Sign Out
    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    // Forgot Password
    const forgotPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        return { error: error?.message || null };
    };

    // Update Profile
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

// ============================================
// HOOK
// ============================================

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthProvider;
