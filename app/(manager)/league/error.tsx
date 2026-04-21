'use client';

import React, { useEffect } from 'react';
import { Button, PageLayout, EmptyState, NavIcons } from '@/components/plyaz';
import { motion } from 'framer-motion';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Route Error:', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md"
            >
                <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <NavIcons.Matches className="w-10 h-10 text-red-500" />
                </div>
                
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-4">
                    Component Protocol Failure
                </h2>
                
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10 leading-relaxed font-medium">
                    We encountered an unexpected error while rendering this section of the league. Your data remains secure.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => reset()}
                        className="h-12 px-8 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-bold tracking-widest uppercase rounded-full"
                    >
                        Retry Protocol
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => window.location.href = '/'}
                        className="h-12 px-8 text-[10px] font-bold tracking-widest uppercase rounded-full"
                    >
                        Return Home
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
