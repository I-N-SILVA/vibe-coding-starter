'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * React Query Provider - PLYAZ League Manager
 * Provides React Query client to the application
 */

interface QueryProviderProps {
    children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    // Create QueryClient instance once per component lifecycle
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Stale time: 1 minute - data considered fresh for 1 min
                        staleTime: 60 * 1000,
                        // Cache time: 5 minutes - keep in cache for 5 min
                        gcTime: 5 * 60 * 1000,
                        // Retry failed requests up to 2 times
                        retry: 2,
                        // Refetch on window focus for live data
                        refetchOnWindowFocus: true,
                    },
                    mutations: {
                        // Retry mutations once on failure
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

export default QueryProvider;
