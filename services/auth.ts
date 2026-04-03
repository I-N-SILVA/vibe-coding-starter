import { LocalStore } from '@/lib/mock/store';
import { repositories } from '@/lib/repositories';
import type { Profile } from '@/lib/supabase/types';

const isSupabaseConfigured = () =>
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type MockUser = { id: string; email: string; isActive: boolean };

/**
 * Authentication Service
 * Single source of truth for all auth I/O (Supabase or mock).
 * AuthProvider calls these methods and manages React state/routing from the results.
 */
export const authService = {
    /**
     * Validates JWT server-side and returns the current user + profile.
     * Always prefer this over getSession() for security.
     */
    async getCurrentUser(): Promise<{ user: { id: string; email?: string } | null; profile: Profile | null }> {
        if (isSupabaseConfigured()) {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) return { user: null, profile: null };

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            return { user, profile: profile as Profile | null };
        }

        const user = LocalStore.findOne<MockUser>('auth', u => u.isActive);
        if (!user) return { user: null, profile: null };

        const profile = await repositories.profile.findById(user.id);
        return { user, profile };
    },

    /**
     * Subscribe to auth state changes. Returns an unsubscribe function.
     * Only meaningful in Supabase mode; returns a no-op in mock mode.
     */
    async onAuthStateChange(
        callback: (userId: string | null) => Promise<void>
    ): Promise<{ unsubscribe: () => void }> {
        if (isSupabaseConfigured()) {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
                await callback(session?.user?.id ?? null);
            });
            return data.subscription;
        }
        return { unsubscribe: () => {} };
    },

    async signIn(email: string, password: string): Promise<{ error: string | null }> {
        if (isSupabaseConfigured()) {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            return { error: error?.message ?? null };
        }

        const user = LocalStore.findOne<MockUser>('auth', u => u.email === email);
        if (!user) return { error: 'Invalid credentials' };
        LocalStore.updateItem<MockUser>('auth', user.id, { isActive: true });
        return { error: null };
    },

    async signUp(
        email: string,
        password: string,
        fullName: string,
        role: Profile['role'] = 'organizer',
        inviteToken?: string
    ): Promise<{ error: string | null }> {
        if (isSupabaseConfigured()) {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
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
            return { error: error?.message ?? null };
        }

        const existing = LocalStore.findOne<MockUser>('auth', u => u.email === email);
        if (existing) return { error: 'Email already exists' };

        const newUser = LocalStore.addItem<Pick<MockUser, 'email' | 'isActive'>>('auth', { email, isActive: true });
        await repositories.profile.create({ id: newUser.id, full_name: fullName, role });
        return { error: null };
    },

    async signOut(): Promise<void> {
        if (isSupabaseConfigured()) {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            await supabase.auth.signOut();
            return;
        }

        const user = LocalStore.findOne<MockUser>('auth', u => u.isActive);
        if (user) LocalStore.updateItem<MockUser>('auth', user.id, { isActive: false });
    },

    async forgotPassword(email: string): Promise<{ error: string | null }> {
        if (isSupabaseConfigured()) {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });
            return { error: error?.message ?? null };
        }
        return { error: null };
    },

    async updatePassword(password: string): Promise<{ error: string | null }> {
        if (isSupabaseConfigured()) {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password });
            return { error: error?.message ?? null };
        }
        return { error: null };
    },

    async updateProfile(
        userId: string,
        updates: Partial<Profile>
    ): Promise<{ profile: Profile | null; error: string | null }> {
        if (isSupabaseConfigured()) {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();
            return { profile: data as Profile | null, error: error?.message ?? null };
        }

        const updated = LocalStore.updateItem<Profile>('profiles', userId, updates);
        return { profile: updated, error: null };
    },

    async getProfileById(userId: string): Promise<Profile | null> {
        if (isSupabaseConfigured()) {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
            return data as Profile | null;
        }
        return repositories.profile.findById(userId);
    },
};
