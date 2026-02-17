// lib/supabase/client.ts
/**
 * Mock Supabase Client
 * Returns a NO-OP client to prevent errors when backend is removed.
 */
export const createClient = () => {
    return {
        from: (table: string) => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({ data: null, error: null }),
                    order: () => Promise.resolve({ data: [], error: null }),
                    limit: () => Promise.resolve({ data: [], error: null }),
                }),
                order: () => Promise.resolve({ data: [], error: null }),
                limit: () => Promise.resolve({ data: [], error: null }),
                single: () => Promise.resolve({ data: null, error: null }),
            }),
            insert: () => ({
                select: () => ({
                    single: () => Promise.resolve({ data: null, error: null }),
                })
            }),
            update: () => ({
                eq: () => Promise.resolve({ data: null, error: null }),
            }),
            delete: () => ({
                eq: () => Promise.resolve({ data: null, error: null }),
            }),
        }),
        auth: {
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
            signUp: () => Promise.resolve({ data: { user: null }, error: null }),
            signOut: () => Promise.resolve({ data: null, error: null }),
        }
    } as any;
};

// Singleton instance for browser use
export const supabase = typeof window !== 'undefined' ? createClient() : null;
