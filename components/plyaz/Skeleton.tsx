import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
    <div className={cn('animate-pulse bg-gray-100 rounded', className)} />
);

export const SkeletonStatCard: React.FC = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Skeleton className="h-3 w-16 mb-3" />
        <Skeleton className="h-8 w-12" />
    </div>
);

export const SkeletonMatchCard: React.FC = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-2 w-10" />
                </div>
            </div>
            <div className="text-center px-6">
                <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex items-center justify-end gap-3 flex-1">
                <div className="text-right">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-2 w-10 ml-auto" />
                </div>
                <Skeleton className="w-10 h-10 rounded-full" />
            </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
            <Skeleton className="h-2 w-16" />
            <Skeleton className="h-2 w-20" />
        </div>
    </div>
);

export const SkeletonTableRow: React.FC = () => (
    <tr className="border-b border-gray-50">
        <td className="px-4 py-5"><Skeleton className="h-4 w-6 mx-auto" /></td>
        <td className="px-4 py-5">
            <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-28" />
            </div>
        </td>
        <td className="px-4 py-5"><Skeleton className="h-4 w-6 mx-auto" /></td>
        <td className="px-4 py-5"><Skeleton className="h-4 w-6 mx-auto" /></td>
        <td className="px-4 py-5"><Skeleton className="h-4 w-6 mx-auto" /></td>
        <td className="px-4 py-5"><Skeleton className="h-4 w-6 mx-auto" /></td>
        <td className="px-4 py-5 hidden sm:table-cell"><Skeleton className="h-4 w-8 mx-auto" /></td>
        <td className="px-4 py-5"><Skeleton className="h-4 w-8 mx-auto" /></td>
    </tr>
);

export const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center">
            <Skeleton className="w-16 h-16 rounded-full mb-4" />
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-20 mb-6" />
            <div className="w-full pt-6 border-t border-gray-50 grid grid-cols-2 gap-2">
                <Skeleton className="h-8 rounded-full" />
                <Skeleton className="h-8 rounded-full" />
            </div>
        </div>
    </div>
);

export const SkeletonChartCard: React.FC = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-48 mb-6" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
);
