'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PageLayout } from '@/components/plyaz';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

type SelectionStatus = 'starting' | 'bench' | 'not_called';

const STATUS_CONFIG: Record<
    SelectionStatus,
    { label: string; color: string; bg: string; border: string; emoji: string }
> = {
    starting: {
        label: 'STARTING XI',
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        emoji: '🟢',
    },
    bench: {
        label: 'ON THE BENCH',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        emoji: '🟡',
    },
    not_called: {
        label: 'NOT CALLED UP',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        emoji: '🔴',
    },
};

void STATUS_CONFIG;

export default function ConvocationPage() {
    const router = useRouter();

    return (
        <PageLayout title="MATCH DAY">
            <div className="mx-auto max-w-md pb-24">
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-orange-500"
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl bg-gray-950 p-12 text-center text-white"
                >
                    <div className="mb-6 text-5xl">📋</div>
                    <h2 className="mb-3 text-xl font-black tracking-tight">
                        No Upcoming Convocation
                    </h2>
                    <p className="text-sm font-medium leading-relaxed text-white/40">
                        Your coach hasn&apos;t published a match convocation yet. Check back closer
                        to match day.
                    </p>
                </motion.div>
            </div>
        </PageLayout>
    );
}
