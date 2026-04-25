import { ReactNode, Suspense } from 'react';
import { Skeleton } from '@/components/plyaz/Skeleton';
import { AuthGuard } from '@/lib/auth/AuthGuard';
import { DashboardShell } from '@/components/plyaz/navigation/DashboardShell';
import { adminNavGroups, adminNavItems } from '@/lib/constants/navigation';

export default function ManagerLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full flex-col items-center justify-center p-8 space-y-4">
                <Skeleton className="h-12 w-1/3 rounded-xl" />
                <Skeleton className="h-[60vh] w-full max-w-5xl rounded-2xl" />
            </div>
        }>
            <AuthGuard roles={['manager', 'organizer', 'admin']}>
                <DashboardShell navItems={adminNavItems} navGroups={adminNavGroups}>
                    {children}
                </DashboardShell>
            </AuthGuard>
        </Suspense>
    );
}
