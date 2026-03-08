import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables are missing');
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Singleton instance for browser use
export const supabase = typeof window !== 'undefined' ? createClient() : null;
