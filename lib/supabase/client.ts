import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        // During build/prerender, env vars may not be available.
        // Return a client with dummy values — it won't be used for real requests during static generation.
        if (typeof window === 'undefined') {
            return createBrowserClient(
                'https://placeholder.supabase.co',
                'placeholder-key'
            );
        }
        throw new Error(
            'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
        );
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
