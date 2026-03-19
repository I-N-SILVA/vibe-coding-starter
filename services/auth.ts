import { LocalStore } from '@/lib/mock/store';
import { repositories } from '@/lib/repositories';
import type { Profile } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';

const isSupabaseConfigured = () => {
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

/**
 * Authentication Service
 * Uses Supabase Auth if configured, otherwise falls back to mock localStorage.
 */
export const authService = {
    async getSession() {
        if (isSupabaseConfigured()) {
            const supabase = createClient();
            return supabase.auth.getSession();
        }

        const user = LocalStore.findOne<any>('auth', u => u.isActive);
        if (!user) return { data: { session: null }, error: null };
        return {
            data: {
                session: { user, access_token: 'mock-token', refresh_token: 'mock-token' } as any
            },
            error: null
        };
    },

    async getCurrentUser() {
        if (isSupabaseConfigured()) {
            const supabase = createClient();
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) return { user: null, profile: null };

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            return { user, profile };
        }

        const user = LocalStore.findOne<any>('auth', u => u.isActive);
        if (!user) return { user: null, profile: null };

        const profile = await repositories.profile.findById(user.id);
        return { user, profile };
    },

    async signIn(email: string, password: string) {
        if (isSupabaseConfigured()) {
            const supabase = createClient();
            return supabase.auth.signInWithPassword({ email, password });
        }

        const user = LocalStore.findOne<any>('auth', u => u.email === email);
        if (!user) return { data: { user: null }, error: { message: 'Invalid credentials' } as any };

        LocalStore.updateItem<any>('auth', user.id, { isActive: true });
        return { data: { user, session: { user } as any }, error: null };
    },

    async signUp(email: string, password: string, fullName: string, role: string = 'organizer') {
        if (isSupabaseConfigured()) {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role
                    }
                }
            });
            return { data, error };
        }

        const existing = LocalStore.findOne<any>('auth', u => u.email === email);
        if (existing) return { data: { user: null }, error: { message: 'User already exists' } as any };

        const newUser = LocalStore.addItem<any>('auth', {
            email,
            isActive: true,
        });

        await repositories.profile.create({
            id: newUser.id,
            full_name: fullName,
            role: role as any,
        });

        return { data: { user: newUser, session: { user: newUser } as any }, error: null };
    },

    async signOut() {
        if (isSupabaseConfigured()) {
            const supabase = createClient();
            return supabase.auth.signOut();
        }

        const user = LocalStore.findOne<any>('auth', u => u.isActive);
        if (user) {
            LocalStore.updateItem<any>('auth', user.id, { isActive: false });
        }
        return { error: null };
    }
};
