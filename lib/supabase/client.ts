import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables are missing. Using mock client.');
        // Return a mock-compatible interface or just the client if ssr handles it
        // For now, we return a client with dummy keys to avoid crash, 
        // but the calls will fail gracefully in the UI logic anyway.
        return createBrowserClient(
            'https://placeholder.supabase.co',
            'placeholder-key'
        );
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
