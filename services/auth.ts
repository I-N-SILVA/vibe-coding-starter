import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/types';

/**
 * Authentication Service
 * Centralizes all Supabase Auth interactions.
 */
export const authService = {
    /**
     * Get current session
     */
    async getSession() {
        const supabase = createClient();
        return await supabase.auth.getSession();
    },

    /**
     * Get current user and their profile
     */
    async getCurrentUser() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { user: null, profile: null };

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return { user, profile };
    },

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string) {
        const supabase = createClient();
        return await supabase.auth.signInWithPassword({ email, password });
    },

    /**
     * Sign up with custom metadata
     */
    async signUp(email: string, password: string, fullName: string, role: string = 'organizer') {
        const supabase = createClient();
        return await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, role }
            }
        });
    },

    /**
     * Sign out
     */
    async signOut() {
        const supabase = createClient();
        return await supabase.auth.signOut();
    }
};
