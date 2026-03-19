import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Returns a no-op mock client when Supabase is not configured.
function createMockClient(): SupabaseClient {
    const noData = { data: null, error: { message: 'Not configured' } };
    return {
        auth: {
            getUser: async () => ({ data: { user: null }, error: { message: 'Not configured' } }),
            getSession: async () => ({ data: { session: null }, error: { message: 'Not configured' } }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        },
        from: () => ({
            select: () => ({ eq: () => ({ single: async () => noData, order: async () => noData }) }),
            insert: () => ({ select: () => ({ single: async () => noData }) }),
            update: () => ({ eq: () => ({ select: () => ({ single: async () => noData }) }) }),
            delete: () => ({ eq: () => ({ error: null }) }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
}

export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return createMockClient();
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Singleton instance for browser use
export const supabase = typeof window !== 'undefined' ? createClient() : null;
