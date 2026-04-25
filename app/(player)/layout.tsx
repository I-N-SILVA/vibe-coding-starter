import { ReactNode, Suspense } from 'react';
import { Skeleton } from '@/components/plyaz/Skeleton';
import { AuthGuard } from '@/lib/auth/AuthGuard';
import { DashboardShell } from '@/components/plyaz/navigation/DashboardShell';
import { playerNavItems } from '@/lib/constants/navigation';

export default function PlayerLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full flex-col items-center justify-center p-8 space-y-4">
                <Skeleton className="h-12 w-1/3 rounded-xl" />
                <Skeleton className="h-[60vh] w-full max-w-5xl rounded-2xl" />
            </div>
        }>
            <AuthGuard roles={['player', 'coach', 'manager']}>
                <DashboardShell navItems={playerNavItems}>
                    {children}
                </DashboardShell>
            </AuthGuard>
        </Suspense>
    );
}
