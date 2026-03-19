import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

// Returns a no-op mock client when Supabase is not configured.
// auth.getUser() returns null, so API routes correctly return 401.
function createMockClient(): SupabaseClient {
    const noData = { data: null, error: { message: 'Not configured' } };
    return {
        auth: {
            getUser: async () => ({ data: { user: null }, error: { message: 'Not configured' } }),
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

export async function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return createMockClient();
    }

    const cookieStore = await cookies();

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
            },
        },
    });
}

/**
 * Creates a Supabase client with the service role key.
 * This should ONLY be used in server-side contexts that require bypassing RLS.
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Missing Supabase admin configuration');
    }

    return createServerClient(supabaseUrl, supabaseServiceRoleKey, {
        cookies: {
            getAll: () => [],
            setAll: () => {},
        },
    });
}
