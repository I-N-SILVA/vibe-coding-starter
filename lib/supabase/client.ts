// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        // Fallback or warning instead of crash
        console.warn('[Supabase] Missing environment variables. Client initialization might fail.');
    }

    return createBrowserClient<Database>(supabaseUrl || '', supabaseAnonKey || '');
}

// Client-side singleton for easy use in hooks/components
export const supabase = typeof window !== 'undefined' ? createClient() : null;
