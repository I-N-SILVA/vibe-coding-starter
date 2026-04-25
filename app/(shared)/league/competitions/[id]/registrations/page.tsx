'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
    Card,
    CardContent,
    PageHeader,
    EmptyState,
    NavIcons,
    TabPills,
} from '@/components/plyaz';
import { PageLayout } from '@/components/plyaz/navigation/PageLayout';
import { useToast } from '@/components/providers';
import { stagger, fadeUp } from '@/lib/animations';
import { useRegistrations } from '@/lib/hooks';
import { queryKeys } from '@/lib/hooks/query-keys';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ApiRegistration = {
    id: string;
    full_name: string;
    date_of_birth: string;
    id_document_type: string;
    jersey_number: number | null;
    position: string | null;
    status: 'pending' | 'approved' | 'rejected';
    registered_at: string;
    team_id: string;
    player_id: string;
    team?: { name: string } | null;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-500',
};

const FILTER_TABS = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RegistrationsPage() {
    const { id: competitionId } = useParams<{ id: string }>();
    const toast = useToast();
    const queryClient = useQueryClient();
    const { data: registrations = [], isLoading, error } = useRegistrations(competitionId);

    const [filter, setFilter] = useState<string>('all');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [bulkLoading, setBulkLoading] = useState(false);

    const regList: ApiRegistration[] = useMemo(
        () => (Array.isArray(registrations) ? (registrations as unknown as ApiRegistration[]) : []),
        [registrations],
    );

    const filtered = useMemo(
        () => regList.filter((r) => filter === 'all' || r.status === filter),
        [regList, filter],
    );

    // Only pending items can be selected
    const pendingFiltered = useMemo(
        () => filtered.filter((r) => r.status === 'pending'),
        [filtered],
    );

    const allPendingSelected =
        pendingFiltered.length > 0 && pendingFiltered.every((r) => selected.has(r.id));

    // ---------- Helpers ----------

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (allPendingSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(pendingFiltered.map((r) => r.id)));
        }
    };

    const patchRegistration = async (regId: string, newStatus: 'approved' | 'rejected') => {
        const res = await fetch(
            `/api/league/competitions/${competitionId}/registrations/${regId}`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            },
        );
        if (!res.ok) throw new Error('Failed to update');
    };

    // ---------- Single action ----------

    const handleStatusChange = async (regId: string, newStatus: 'approved' | 'rejected') => {
        setActionLoading(regId);
        try {
            await patchRegistration(regId, newStatus);
            toast.success(`Registration ${newStatus}`);
            selected.delete(regId);
            setSelected(new Set(selected));
            await queryClient.invalidateQueries({ queryKey: queryKeys.registrations(competitionId) });
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to update registration');
        } finally {
            setActionLoading(null);
        }
    };

    // ---------- Bulk approve ----------

    const handleBulkApprove = async () => {
        if (selected.size === 0) return;
        setBulkLoading(true);
        try {
            await Promise.all([...selected].map((id) => patchRegistration(id, 'approved')));
            toast.success(`${selected.size} registration${selected.size > 1 ? 's' : ''} approved`);
            setSelected(new Set());
            await queryClient.invalidateQueries({ queryKey: queryKeys.registrations(competitionId) });
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Some updates failed');
        } finally {
            setBulkLoading(false);
        }
    };

    // ---------- Counts ----------

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: regList.length, pending: 0, approved: 0, rejected: 0 };
        regList.forEach((r) => {
            if (c[r.status] !== undefined) c[r.status]++;
        });
        return c;
    }, [regList]);

    const tabsWithCounts = FILTER_TABS.map((t) => ({
        ...t,
        label: `${t.label} (${counts[t.value] ?? 0})`,
    }));

    // ---------- Render ----------

    return (
        <PageLayout title="Registrations">
            <div className="space-y-6">
                <PageHeader
                    label="Championship"
                    title="Player Registrations"
                    description={`${regList.length} registration${regList.length !== 1 ? 's' : ''}`}
                />

                {/* ---- Filter Tabs ---- */}
                <TabPills tabs={tabsWithCounts} activeTab={filter} onChange={setFilter} />

                {/* ---- Bulk actions bar ---- */}
                <AnimatePresence>
                    {selected.size > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-3"
                        >
                            <span className="text-sm font-bold text-gray-900">
                                {selected.size} selected
                            </span>
                            <button
                                onClick={handleBulkApprove}
                                disabled={bulkLoading}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                            >
                                {bulkLoading ? 'Approving…' : `Approve Selected (${selected.size})`}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ---- Loading skeleton ---- */}
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

                {/* ---- Error ---- */}
                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
                        Failed to load registrations.
                    </div>
                )}

                {/* ---- Select-all toggle (only when pending items exist) ---- */}
                {!isLoading && pendingFiltered.length > 0 && (
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={allPendingSelected}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 accent-orange-500"
                        />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Select all pending
                        </span>
                    </div>
                )}

                {/* ---- Registration list ---- */}
                {!isLoading && (
                    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
                        {filtered.map((reg) => {
                            const isPending = reg.status === 'pending';
                            const isSelected = selected.has(reg.id);
                            const isUpdating = actionLoading === reg.id;

                            return (
                                <motion.div key={reg.id} variants={fadeUp}>
                                    <Card
                                        className={`transition-shadow ${isSelected
                                                ? 'ring-2 ring-orange-400 shadow-md'
                                                : 'hover:shadow-md'
                                            }`}
                                    >
                                        <CardContent className="p-3 md:p-4">
                                            {/* Desktop row */}
                                            <div className="hidden md:flex items-center gap-3">
                                                {/* Checkbox */}
                                                {isPending && (
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelect(reg.id)}
                                                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 accent-orange-500 flex-shrink-0"
                                                    />
                                                )}
                                                {!isPending && <div className="w-4 flex-shrink-0" />}

                                                {/* Avatar / jersey */}
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-bold text-gray-500">
                                                        {reg.jersey_number ?? '#'}
                                                    </span>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate">
                                                        {reg.full_name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                        {reg.team?.name && (
                                                            <>
                                                                <span className="text-[10px] font-bold tracking-widest uppercase text-orange-500">
                                                                    {reg.team.name}
                                                                </span>
                                                                <span className="text-gray-200">·</span>
                                                            </>
                                                        )}
                                                        {reg.position && (
                                                            <>
                                                                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                                                                    {reg.position}
                                                                </span>
                                                                <span className="text-gray-200">·</span>
                                                            </>
                                                        )}
                                                        <span className="text-[10px] text-gray-400">
                                                            DOB:{' '}
                                                            {new Date(reg.date_of_birth).toLocaleDateString(
                                                                'en-GB',
                                                                { day: 'numeric', month: 'short', year: 'numeric' },
                                                            )}
                                                        </span>
                                                        <span className="text-gray-200">·</span>
                                                        <span className="text-[10px] text-gray-400 capitalize">
                                                            {reg.id_document_type.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {isPending && (
                                                    <div className="flex gap-1.5 flex-shrink-0">
                                                        <button
                                                            onClick={() => handleStatusChange(reg.id, 'approved')}
                                                            disabled={isUpdating}
                                                            className="text-[10px] font-bold text-green-600 hover:text-white hover:bg-green-600 px-3 py-1.5 bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(reg.id, 'rejected')}
                                                            disabled={isUpdating}
                                                            className="text-[10px] font-bold text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Status badge */}
                                                <span
                                                    className={`text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[reg.status] || 'bg-gray-100 text-gray-500'
                                                        }`}
                                                >
                                                    {reg.status}
                                                </span>
                                            </div>

                                            {/* Mobile card layout */}
                                            <div className="flex flex-col gap-3 md:hidden">
                                                <div className="flex items-start gap-3">
                                                    {/* Checkbox */}
                                                    {isPending && (
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelect(reg.id)}
                                                            className="w-4 h-4 mt-1 rounded border-gray-300 text-orange-500 focus:ring-orange-400 accent-orange-500 flex-shrink-0"
                                                        />
                                                    )}

                                                    {/* Avatar / Jersey */}
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-bold text-gray-500">
                                                            {reg.jersey_number ?? '#'}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-sm truncate">
                                                                {reg.full_name}
                                                            </p>
                                                            <span
                                                                className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[reg.status] ||
                                                                    'bg-gray-100 text-gray-500'
                                                                    }`}
                                                            >
                                                                {reg.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                            {reg.team?.name && (
                                                                <span className="text-[10px] font-bold tracking-widest uppercase text-orange-500">
                                                                    {reg.team.name}
                                                                </span>
                                                            )}
                                                            {reg.position && (
                                                                <>
                                                                    <span className="text-gray-200">·</span>
                                                                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                                                                        {reg.position}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                            <span className="text-[10px] text-gray-400">
                                                                DOB:{' '}
                                                                {new Date(
                                                                    reg.date_of_birth,
                                                                ).toLocaleDateString('en-GB', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                })}
                                                            </span>
                                                            <span className="text-gray-200">·</span>
                                                            <span className="text-[10px] text-gray-400 capitalize">
                                                                {reg.id_document_type.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Mobile action buttons */}
                                                {isPending && (
                                                    <div className="flex gap-2 ml-7">
                                                        <button
                                                            onClick={() =>
                                                                handleStatusChange(reg.id, 'approved')
                                                            }
                                                            disabled={isUpdating}
                                                            className="flex-1 text-xs font-bold text-green-600 hover:text-white hover:bg-green-600 py-2 bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleStatusChange(reg.id, 'rejected')
                                                            }
                                                            disabled={isUpdating}
                                                            className="flex-1 text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 py-2 bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}

                        {filtered.length === 0 && !isLoading && (
                            <EmptyState
                                icon={<NavIcons.Statistics />}
                                title="No Registrations"
                                description={
                                    filter === 'all'
                                        ? 'No players have registered yet.'
                                        : `No ${filter} registrations found.`
                                }
                            />
                        )}
                    </motion.div>
                )}
            </div>
        </PageLayout>
    );
}
