'use client';

import React from 'react';
import { Card, CardContent, Button, Badge } from '@/components/plyaz';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/providers/ToastProvider';

interface ApplicationItem {
    id: string;
    applicant_id: string;
    applicant_role: string;
    target_id: string;
    target_type: string;
    status: 'pending' | 'accepted' | 'rejected';
    message: string | null;
    created_at: string;
    applicant?: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
        role: string;
    };
}

interface ApplicationsInboxProps {
    targetType: 'team' | 'competition';
}

export function ApplicationsInbox({ targetType }: ApplicationsInboxProps) {
    const toast = useToast();
    const queryClient = useQueryClient();

    const { data: applications, isLoading } = useQuery({
        queryKey: ['applications', 'received', targetType],
        queryFn: async () => {
            const res = await fetch(`/api/applications?type=received&targetType=${targetType}`);
            if (!res.ok) throw new Error('Failed to fetch applications');
            const data = await res.json();
            return data.data as ApplicationItem[];
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await fetch(`/api/applications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to update application');
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success('Application updated!');
            queryClient.invalidateQueries({ queryKey: ['applications', 'received', targetType] });
        },
        onError: (err: Error) => {
            toast.error(err.message);
        }
    });

    if (isLoading) return <div className="animate-pulse h-24 bg-secondary-main/5 rounded-2xl" />;

    const pendingApps = applications?.filter(a => a.status === 'pending') || [];
    const resolvedApps = applications?.filter(a => a.status !== 'pending') || [];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-black text-primary-main flex items-center gap-3">
                Applications Inbox
                {pendingApps.length > 0 && (
                    <Badge variant="primary" size="sm">{pendingApps.length} new</Badge>
                )}
            </h2>

            {!pendingApps.length && !resolvedApps.length ? (
                <Card className="bg-secondary-main/5 border-dashed">
                    <CardContent className="p-8 text-center text-secondary-main/50">
                        No applications received yet.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {pendingApps.map((app) => (
                        <Card key={app.id} className="border-orange-200 bg-orange-50/30">
                            <CardContent className="p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-sm shrink-0">
                                            {app.applicant?.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm truncate">{app.applicant?.full_name || 'Unknown'}</p>
                                            <p className="text-[10px] text-secondary-main/50 uppercase tracking-widest font-bold">
                                                {app.applicant_role} • {new Date(app.created_at).toLocaleDateString()}
                                            </p>
                                            {app.message && (
                                                <p className="text-xs text-secondary-main/70 mt-1 italic line-clamp-2">&quot;{app.message}&quot;</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => updateMutation.mutate({ id: app.id, status: 'accepted' })}
                                            disabled={updateMutation.isPending}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => updateMutation.mutate({ id: app.id, status: 'rejected' })}
                                            disabled={updateMutation.isPending}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {resolvedApps.length > 0 && (
                        <details className="mt-4">
                            <summary className="text-xs font-bold text-secondary-main/40 uppercase tracking-widest cursor-pointer hover:text-secondary-main/60 transition-colors">
                                Resolved ({resolvedApps.length})
                            </summary>
                            <div className="space-y-2 mt-3">
                                {resolvedApps.map((app) => (
                                    <Card key={app.id} className="opacity-60">
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary-main/10 flex items-center justify-center text-secondary-main/40 font-bold text-xs shrink-0">
                                                {app.applicant?.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">{app.applicant?.full_name || 'Unknown'}</p>
                                            </div>
                                            <Badge variant={app.status === 'accepted' ? 'success' : 'error'} size="sm">
                                                {app.status}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </details>
                    )}
                </div>
            )}
        </div>
    );
}
