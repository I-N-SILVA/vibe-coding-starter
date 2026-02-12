'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    const isSupabaseError = error.message?.includes('Supabase') ||
        error.message?.includes('NEXT_PUBLIC_SUPABASE');

    return (
        <div className="min-h-screen bg-primary-main flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-secondary-main mb-2">
                        {isSupabaseError ? 'Database Connection Error' : 'Something went wrong'}
                    </h2>
                    <p className="text-sm text-secondary-main/60">
                        {isSupabaseError
                            ? 'Unable to connect to Supabase. Please check that your environment variables are set correctly in .env.local.'
                            : error.message || 'An unexpected error occurred. Please try again.'}
                    </p>
                </div>

                <button
                    onClick={reset}
                    className="px-6 py-2.5 bg-accent-main text-primary-main text-sm font-medium rounded-lg hover:bg-accent-main/90 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
