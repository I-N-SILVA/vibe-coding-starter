'use client';

import { useEffect } from 'react';
import { Button } from '@/components/plyaz';

/**
 * Error Page - League Section
 * Displays when an error occurs in the league routes
 */

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function LeagueError({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        // Log error to monitoring service
        console.error('League error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-8 h-8 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Something went wrong
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    We couldn't load your league data. This might be a temporary issue.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button onClick={reset}>
                        Try Again
                    </Button>
                    <Button variant="secondary" onClick={() => window.location.href = '/'}>
                        Go Home
                    </Button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <pre className="mt-6 p-4 bg-gray-100 rounded-lg text-left text-xs text-red-600 overflow-auto">
                        {error.message}
                    </pre>
                )}
            </div>
        </div>
    );
}
