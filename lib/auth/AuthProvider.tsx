'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { Profile } from '@/lib/supabase/types';
import { LocalStore } from '@/lib/mock/store';
import { useRouter } from 'next/navigation';

// ============================================
// TYPES
// ============================================

interface MockAuthUser {
    id: string;
    email: string;
    isActive: boolean;
    created_at?: string;
    updated_at?: string;
}

interface AuthUser extends Partial<User> {
    id: string;
    email: string;
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

const isSupabaseConfigured = () =>
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthInitialized, setIsAuthInitialized] = useState(false);
    const router = useRouter();
    // Cache the Supabase client so it's not recreated on every auth call
    const supabaseRef = useRef<SupabaseClient | null>(null);

    const getSupabase = async (): Promise<SupabaseClient> => {
        if (!supabaseRef.current) {
            const { createClient } = await import('@/lib/supabase/client');
            supabaseRef.current = createClient();
        }
        return supabaseRef.current;
    };

    useEffect(() => {
        let subscription: { unsubscribe: () => void } | null = null;

        const initAuth = async () => {
            if (isSupabaseConfigured()) {
                const supabase = await getSupabase();

                // Use getUser() — validates JWT with the server (secure).
                // getSession() reads from localStorage without server validation.
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (authUser) {
                    setUser(authUser as AuthUser);

                    const { data: { session: currentSession } } = await supabase.auth.getSession();
                    setSession(currentSession);

                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', authUser.id)
                        .single();

                    setProfile(profileData as Profile);
                }

                // Listen for changes
                const { data } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
                    setSession(currentSession);
                    setUser((currentSession?.user as AuthUser) || null);

                    if (currentSession?.user) {
                        const { data: profileData } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', currentSession.user.id)
                            .single();
                        setProfile(profileData as Profile);
                    } else {
                        setProfile(null);
                    }
                });

                subscription = data.subscription;
            } else {
                // Mock logic
                const storedUser = LocalStore.findOne<MockAuthUser>('auth', (u) => u.isActive);

                if (storedUser) {
                    setUser(storedUser as unknown as AuthUser);
                    setSession({ user: storedUser } as unknown as Session);

                    const userProfile = LocalStore.findOne<Profile>('profiles', (p) => p.id === storedUser.id);
                    setProfile(userProfile);
                }
            }

            setIsLoading(false);
            setIsAuthInitialized(true);
        };

        initAuth();

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signIn = async (email: string, password: string) => {
        if (isSupabaseConfigured()) {
            const supabase = await getSupabase();
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            return { error: error?.message || null };
        }

        const mockUser = LocalStore.findOne<MockAuthUser>('auth', (u) => u.email === email);
        if (!mockUser) return { error: 'User not found' };

        LocalStore.updateItem<MockAuthUser>('auth', mockUser.id, { isActive: true });
        setUser(mockUser as unknown as AuthUser);
        setSession({ user: mockUser } as unknown as Session);
        const userProfile = LocalStore.findOne<Profile>('profiles', (p) => p.id === mockUser.id);
        setProfile(userProfile);

        return { error: null };
    };

    const signUp = async (email: string, password: string, fullName: string, role: Profile['role'] = 'organizer', inviteToken?: string) => {
        if (isSupabaseConfigured()) {
            const supabase = await getSupabase();
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role,
                        ...(inviteToken ? { invite_token: inviteToken } : {}),
                    },
                },
            });
            return { error: error?.message || null };
        }

        // Check if exists
        const existing = LocalStore.findOne<MockAuthUser>('auth', (u) => u.email === email);
        if (existing) return { error: 'Email already exists' };

        const newUser = LocalStore.addItem<{ email: string; isActive: boolean }>('auth', {
            email,
            isActive: true,
        });

        const newProfile = LocalStore.addItem<{ id: string; full_name: string; role: Profile['role']; created_at: string; updated_at: string }>('profiles', {
            id: newUser.id,
            full_name: fullName,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        setUser(newUser as unknown as AuthUser);
        setProfile(newProfile as unknown as Profile);
        setSession({ user: newUser } as unknown as Session);

        return { error: null };
    };

    const signOut = async () => {
        if (isSupabaseConfigured()) {
            const supabase = await getSupabase();
            await supabase.auth.signOut();
        } else {
            if (user) {
                LocalStore.updateItem<MockAuthUser>('auth', user.id, { isActive: false });
            }
            setUser(null);
            setProfile(null);
            setSession(null);
        }
        router.push('/login');
    };

    const forgotPassword = async (email: string) => {
        if (isSupabaseConfigured()) {
            const supabase = await getSupabase();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            });
            return { error: error?.message || null };
        }
        return { error: null };
    };

    const updatePassword = async (password: string) => {
        if (isSupabaseConfigured()) {
            const supabase = await getSupabase();
            const { error } = await supabase.auth.updateUser({ password });
            return { error: error?.message || null };
        }
        return { error: null };
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return { error: 'Not authenticated' };

        if (isSupabaseConfigured()) {
            const supabase = await getSupabase();
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) return { error: error.message };
            if (data) setProfile(data as Profile);
            return { error: null };
        }

        const updated = LocalStore.updateItem<Profile>('profiles', user.id, updates);
        if (updated) setProfile(updated);
        return { error: null };
    };

    const role = profile?.role || 'fan';

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
