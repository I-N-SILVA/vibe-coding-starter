'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
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
        // Load mock auth state from localStorage
        const storedUser = LocalStore.findOne<MockAuthUser>('auth', (u) => u.isActive);

        if (storedUser) {
            setUser(storedUser as unknown as AuthUser);
            setSession({ user: storedUser } as unknown as Session);

            // Get profile
            const userProfile = LocalStore.findOne<Profile>('profiles', (p) => p.id === storedUser.id);
            setProfile(userProfile);
        }

        setIsLoading(false);
        setIsAuthInitialized(true);
    }, []);

    const signIn = async (email: string, _password: string) => {
        const mockUser = LocalStore.findOne<MockAuthUser>('auth', (u) => u.email === email);
        if (!mockUser) return { error: 'User not found' };

        LocalStore.updateItem<MockAuthUser>('auth', mockUser.id, { isActive: true });
        setUser(mockUser as unknown as AuthUser);
        setSession({ user: mockUser } as unknown as Session);
        const userProfile = LocalStore.findOne<Profile>('profiles', (p) => p.id === mockUser.id);
        setProfile(userProfile);

        return { error: null };
    };

    const signUp = async (email: string, _password: string, fullName: string, role: Profile['role'] = 'organizer') => {
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
        if (user) {
            LocalStore.updateItem<MockAuthUser>('auth', user.id, { isActive: false });
        }
        setUser(null);
        setProfile(null);
        setSession(null);
        router.push('/login');
    };

    const forgotPassword = async (_email: string) => {
        return { error: null };
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return { error: 'Not authenticated' };
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
