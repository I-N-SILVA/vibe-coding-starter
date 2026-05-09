'use client';

import { useEffect } from 'react';
import { Button } from '@/components/plyaz';

export default function PublicLeagueError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Public league error:', error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="max-w-sm text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                    <svg
                        className="h-8 w-8 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                </div>
                <h2 className="mb-2 text-xl font-black">Something went wrong</h2>
                <p className="mb-6 text-sm text-gray-400">
                    An unexpected error occurred. Please try again.
                </p>
                <div className="flex justify-center gap-3">
                    <Button onClick={reset}>Try Again</Button>
                    <Button
                        variant="secondary"
                        onClick={() => (window.location.href = '/league/public')}
                    >
                        Back to League
                    </Button>
                </div>
            </div>
        </div>
    );
}
