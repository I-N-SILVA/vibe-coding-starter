import {
    SkeletonStatCard,
    SkeletonMatchCard,
    Skeleton,
} from '@/components/plyaz';

export default function LeagueLoading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header Skeleton */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 h-14" />

            <div className="md:ml-64 px-4 md:px-8 py-6 md:py-8 max-w-5xl">
                {/* Page Header Skeleton */}
                <div className="mb-8">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-7 w-48" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="mb-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <SkeletonStatCard key={i} />
                        ))}
                    </div>
                </div>

                {/* Match Cards Skeleton */}
                <div className="mb-10">
                    <Skeleton className="h-3 w-24 mb-4" />
                    <div className="space-y-4">
                        <SkeletonMatchCard />
                        <SkeletonMatchCard />
                    </div>
                </div>

                {/* Quick Actions Skeleton */}
                <div className="mb-10">
                    <Skeleton className="h-3 w-28 mb-4" />
                    <div className="flex gap-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-10 w-28 rounded-full" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
