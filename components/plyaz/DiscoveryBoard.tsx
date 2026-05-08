'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, Button, Input } from '@/components/plyaz';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/providers/ToastProvider';

interface DiscoveryItem {
    id: string;
    name: string;
    organization: { name: string; logo_url: string | null } | null;
    recruitment_message: string | null;
    needed_positions?: string[]; // Teams only
}

interface DiscoveryBoardProps {
    type: 'team' | 'competition';
    userRole: 'player' | 'referee';
}

export function DiscoveryBoard({ type, userRole }: DiscoveryBoardProps) {
    const [selectedItem, setSelectedItem] = useState<DiscoveryItem | null>(null);
    const [message, setMessage] = useState('');
    const toast = useToast();

    const endpoint = type === 'team' ? '/api/discover/teams' : '/api/discover/competitions';

    const { data: items, isLoading } = useQuery({
        queryKey: ['discovery', type],
        queryFn: async () => {
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error('Failed to fetch discovery items');
            const data = await res.json();
            return data.data as DiscoveryItem[];
        },
    });

    const applyMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetId: selectedItem!.id,
                    targetType: type,
                    role: userRole,
                    message: message.trim(),
                }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to apply');
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success('Application sent successfully!');
            setSelectedItem(null);
            setMessage('');
            // could optionally refetch sent applications if displayed here
        },
        onError: (err: Error) => {
            toast.error(err.message);
        },
    });

    if (isLoading) return <div className="h-32 animate-pulse rounded-2xl bg-secondary-main/5" />;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-black text-primary-main">
                {type === 'team' ? 'Find a Team' : 'Find a Tournament'}
            </h2>

            {!items?.length ? (
                <Card className="border-dashed bg-secondary-main/5">
                    <CardContent className="p-8 text-center text-secondary-main/50">
                        <p className="mb-1 font-bold">
                            {type === 'team'
                                ? 'No teams are currently recruiting.'
                                : 'No tournaments are currently looking for referees.'}
                        </p>
                        <p className="mt-2 text-xs">
                            {type === 'team'
                                ? 'Coaches can enable recruiting from their dashboard to appear here.'
                                : 'Organizers can enable referee recruitment from their competition settings.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <Card
                            key={item.id}
                            className="transition-colors hover:border-primary-main/20"
                        >
                            <CardContent className="p-6">
                                <div className="mb-4 flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold leading-tight">
                                            {item.name}
                                        </h3>
                                        <p className="text-xs text-secondary-main/60">
                                            {item.organization?.name ?? ''}
                                        </p>
                                    </div>
                                    {item.organization?.logo_url && (
                                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-secondary-main/5">
                                            <Image
                                                src={item.organization.logo_url}
                                                alt={`${item.organization.name} logo`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                </div>

                                {item.needed_positions && item.needed_positions.length > 0 && (
                                    <div className="mb-4 flex flex-wrap gap-1">
                                        {item.needed_positions.map((pos) => (
                                            <span
                                                key={pos}
                                                className="rounded bg-primary-main/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-main"
                                            >
                                                {pos}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {item.recruitment_message && (
                                    <p className="mb-6 line-clamp-3 text-sm italic text-secondary-main/80">
                                        &quot;{item.recruitment_message}&quot;
                                    </p>
                                )}

                                <Button fullWidth size="sm" onClick={() => setSelectedItem(item)}>
                                    Apply to Join
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Application Modal Overlay - Using simple conditional rendering for MVP */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-md shadow-2xl duration-200 animate-in fade-in zoom-in">
                        <CardContent className="p-6">
                            <h3 className="mb-1 text-lg font-black">
                                Apply to {selectedItem.name}
                            </h3>
                            <p className="mb-6 text-sm text-secondary-main/60">
                                Sending an application to this {type}.
                            </p>

                            <div className="space-y-4">
                                <Input
                                    label="Message (Optional)"
                                    placeholder="Tell them why you'd be a great fit..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        onClick={() => {
                                            setSelectedItem(null);
                                            setMessage('');
                                        }}
                                        disabled={applyMutation.isPending}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        fullWidth
                                        onClick={() => applyMutation.mutate()}
                                        isLoading={applyMutation.isPending}
                                    >
                                        Send Application
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
