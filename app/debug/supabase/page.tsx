'use client';

import React, { useEffect, useState } from 'react';
import type { Session, PostgrestError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

/**
 * DEBUG SCREEN: Supabase Healthcheck
 * 
 * This screen is for development only to verify:
 * 1. SUPABASE_URL & ANON_KEY are working.
 * 2. Current auth session status.
 * 3. Database connectivity (fetching public profiles).
 * 
 * IMPORTANT: This route should be removed or protected in production.
 */
interface DebugStatus {
    loading: boolean;
    session: Session | null;
    dbData: Record<string, unknown>[] | null;
    authError: Error | null;
    dbError: PostgrestError | null;
    error: unknown;
    env: {
        url: string;
        key: string;
    };
}

export default function SupabaseDebugPage() {
    const [status, setStatus] = useState<DebugStatus>({
        loading: true,
        session: null,
        dbData: null,
        authError: null,
        dbError: null,
        error: null,
        env: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ LOADED' : '❌ MISSING',
            key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ LOADED' : '❌ MISSING',
        }
    });

    useEffect(() => {
        const supabase = createClient();
        async function runCheck() {
            try {
                // 1. Check Session
                const { data: { session }, error: authError } = await supabase.auth.getSession();

                // 2. Check Database Connectivity
                // Using 'profiles' as it's a core table
                const { data: dbData, error: dbError } = await supabase
                    .from('profiles')
                    .select('id, full_name, role')
                    .limit(3);

                setStatus(prev => ({
                    ...prev,
                    loading: false,
                    session,
                    dbData,
                    authError,
                    dbError,
                }));
            } catch (err) {
                setStatus(prev => ({
                    ...prev,
                    loading: false,
                    error: err,
                }));
            }
        }

        runCheck();
    }, []);

    if (status.loading) {
        return <div className="p-10 font-mono">Running Supabase diagnostics...</div>;
    }

    return (
        <div className="p-8 font-mono bg-black text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-8 border-b border-white/20 pb-4">🛠️ Supabase Debugger</h1>

            <section className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
                <h2 className="text-lg font-bold mb-4 text-accent-main">Environment Vars</h2>
                <pre className="text-sm">{JSON.stringify(status.env, null, 2)}</pre>
            </section>

            <section className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
                <h2 className="text-lg font-bold mb-4 text-green-400">Auth Session</h2>
                {status.authError ? (
                    <div className="text-red-400">Error: {status.authError.message}</div>
                ) : (
                    <pre className="text-xs overflow-auto max-h-60 bg-black/50 p-2 rounded">
                        {JSON.stringify(status.session, null, 2)}
                    </pre>
                )}
            </section>

            <section className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
                <h2 className="text-lg font-bold mb-4 text-blue-400">Database Connection (Profiles)</h2>
                {status.dbError ? (
                    <div className="text-red-400">Error: {status.dbError.message}</div>
                ) : (
                    <div>
                        <div className="mb-2 text-xs text-secondary-main/60">Showing top 3 profiles:</div>
                        <pre className="text-xs overflow-auto max-h-60 bg-black/50 p-2 rounded">
                            {JSON.stringify(status.dbData, null, 2)}
                        </pre>
                    </div>
                )}
            </section>

            {status.error ? (
                <section className="mb-8 p-4 bg-red-900/20 rounded-lg border border-red-500/50">
                    <h2 className="text-lg font-bold mb-4 text-red-500">Unhandled Exception</h2>
                    <pre className="text-xs">{JSON.stringify(status.error, null, 2)}</pre>
                </section>
            ) : null}

            <div className="mt-12 text-[10px] text-white/30 tracking-widest uppercase">
                PLYAZ Debug Tool • Dev Context Only
            </div>
        </div>
    );
}
