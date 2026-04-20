'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/hooks/query-keys';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Organization } from '@/lib/supabase/types';

interface OrgContextType {
    orgId: string | null;
    slug: string | null;
    name: string | null;
    isLoading: boolean;
    isError: boolean;
    organization: Organization | null;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const { data: organization, isLoading, isError } = useQuery({
        queryKey: queryKeys.organization,
        queryFn: () => apiClient.get<Organization | null>('/api/league/organizations'),
        enabled: isAuthenticated,
        staleTime: 60_000,
    });

    const value: OrgContextType = {
        orgId: organization?.id || null,
        slug: organization?.slug || null,
        name: organization?.name || null,
        isLoading,
        isError,
        organization: organization || null,
    };

    return (
        <OrgContext.Provider value={value}>
            {children}
        </OrgContext.Provider>
    );
}

export function useOrg() {
    const context = useContext(OrgContext);
    if (context === undefined) {
        throw new Error('useOrg must be used within an OrgProvider');
    }
    return context;
}
