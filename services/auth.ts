import { LocalStore } from '@/lib/mock/store';
import type { Profile } from '@/lib/supabase/types';

/**
 * Authentication Service (Mock)
 * Simulates authentication logic using localStorage.
 */
export const authService = {
    /**
     * Get current session
     */
    async getSession() {
        const user = LocalStore.findOne<any>('auth', u => u.isActive);
        if (!user) return { data: { session: null }, error: null };
        return {
            data: {
                session: { user, access_token: 'mock-token', refresh_token: 'mock-token' } as any
            },
            error: null
        };
    },

    /**
     * Get current user and their profile
     */
    async getCurrentUser() {
        const user = LocalStore.findOne<any>('auth', u => u.isActive);
        if (!user) return { user: null, profile: null };

        const profile = LocalStore.findOne<Profile>('profiles', p => p.id === user.id);
        return { user, profile };
    },

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string) {
        const user = LocalStore.findOne<any>('auth', u => u.email === email);
        if (!user) return { data: { user: null }, error: { message: 'Invalid credentials' } as any };

        LocalStore.updateItem<any>('auth', user.id, { isActive: true });
        return { data: { user, session: { user } as any }, error: null };
    },

    /**
     * Sign up with custom metadata
     */
    async signUp(email: string, password: string, fullName: string, role: string = 'organizer') {
        const existing = LocalStore.findOne<any>('auth', u => u.email === email);
        if (existing) return { data: { user: null }, error: { message: 'User already exists' } as any };

        const newUser = LocalStore.addItem<any>('auth', {
            email,
            isActive: true,
        });

        LocalStore.addItem<Profile>('profiles', {
            id: newUser.id,
            full_name: fullName,
            role: role as any,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as any);

        return { data: { user: newUser, session: { user: newUser } as any }, error: null };
    },

    /**
     * Sign out
     */
    async signOut() {
        const user = LocalStore.findOne<any>('auth', u => u.isActive);
        if (user) {
            LocalStore.updateItem<any>('auth', user.id, { isActive: false });
        }
        return { error: null };
    }
};
