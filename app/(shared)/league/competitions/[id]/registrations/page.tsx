'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    PageHeader,
    EmptyState,
    NavIcons,
} from '@/components/plyaz';
import { PageLayout } from '@/components/plyaz/navigation/PageLayout';
import { adminNavItems } from '@/lib/constants/navigation';
import { useToast } from '@/components/providers';
import { stagger, fadeUp } from '@/lib/animations';
import { useRegistrations } from '@/lib/hooks';

type ApiRegistration = {
    id: string;
    full_name: string;
    date_of_birth: string;
    id_document_type: string;
    jersey_number: number | null;
    position: string | null;
    status: string;
    registered_at: string;
    team_id: string;
    player_id: string;
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-500',
};

export default function RegistrationsPage() {
    const { id: competitionId } = useParams<{ id: string }>();
    const toast = useToast();
    const { data: registrations = [], isLoading, error } = useRegistrations(competitionId);
    const [filter, setFilter] = useState<string>('all');

    const regList: ApiRegistration[] = Array.isArray(registrations) ? (registrations as unknown as ApiRegistration[]) : [];
    const filtered = regList.filter((r) => filter === 'all' || r.status === filter);

    const handleStatusChange = async (regId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/league/competitions/${competitionId}/registrations/${regId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update');
            toast.success(`Registration ${newStatus}`);
            window.location.reload();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to update registration');
        }
    };

    return (
        <PageLayout navItems={adminNavItems} title="Registrations">
            <div className="space-y-6">
                <PageHeader
                    label="Championship"
                    title="Player Registrations"
                    description={`${regList.length} registration${regList.length !== 1 ? 's' : ''}`}
                />

                {/* Filter Pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
                    {['all', 'pending', 'approved', 'rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${
                                filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {isLoading && (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-4">
                                    <div className="animate-pulse flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                                            <div className="h-2 bg-gray-100 rounded w-1/4" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
                        Failed to load registrations.
                    </div>
                )}

                {!isLoading && (
                    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
                        {filtered.map((reg) => (
                            <motion.div key={reg.id} variants={fadeUp}>
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-3 md:p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-gray-500">
                                                    {reg.jersey_number || '#'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{reg.full_name}</p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    {reg.position && (
                                                        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                                                            {reg.position}
                                                        </span>
                                                    )}
                                                    <span className="text-gray-200">·</span>
                                                    <span className="text-[10px] text-gray-400">
                                                        DOB: {new Date(reg.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-gray-200">·</span>
                                                    <span className="text-[10px] text-gray-400 capitalize">
                                                        {reg.id_document_type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                            {reg.status === 'pending' && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleStatusChange(reg.id, 'approved')}
                                                        className="text-[10px] font-bold text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(reg.id, 'rejected')}
                                                        className="text-[10px] font-bold text-red-500 hover:text-red-700 px-2 py-1 bg-red-50 rounded transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full flex-shrink-0 ${statusColors[reg.status] || 'bg-gray-100 text-gray-500'}`}>
                                                {reg.status}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        {filtered.length === 0 && !isLoading && (
                            <EmptyState
                                icon={<NavIcons.Statistics />}
                                title="No Registrations"
                                description={filter === 'all' ? 'No players have registered yet.' : `No ${filter} registrations found.`}
                            />
                        )}
                    </motion.div>
                )}
            </div>
        </PageLayout>
    );
}
