import { ReactNode } from 'react';
import { DynamicDashboardShell } from '@/components/plyaz/navigation/DynamicDashboardShell';

export default function PublicLeagueLayout({ children }: { children: ReactNode }) {
    return (
        <DynamicDashboardShell>
            {children}
        </DynamicDashboardShell>
    );
}
