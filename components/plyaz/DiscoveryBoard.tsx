'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, Button, Input } from '@/components/plyaz';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/providers/ToastProvider';

interface DiscoveryItem {
    id: string;
    name: string;
    organization: { name: string, logo_url: string | null };
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

    const { data: items, isLoading, refetch } = useQuery({
        queryKey: ['discovery', type],
        queryFn: async () => {
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error('Failed to fetch discovery items');
            const data = await res.json();
            return data.data as DiscoveryItem[];
        }
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
                    message: message.trim()
                })
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
        }
    });

    if (isLoading) return <div className="animate-pulse h-32 bg-secondary-main/5 rounded-2xl" />;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-black text-primary-main">
                {type === 'team' ? 'Find a Team' : 'Find a Tournament'}
            </h2>

            {!items?.length ? (
                <Card className="bg-secondary-main/5 border-dashed">
                    <CardContent className="p-8 text-center text-secondary-main/50">
                        No {type}s are currently recruiting. Check back later!
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <Card key={item.id} className="hover:border-primary-main/20 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                                        <p className="text-xs text-secondary-main/60">{item.organization.name}</p>
                                    </div>
                                    {item.organization.logo_url && (
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-secondary-main/5">
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
                                            <span key={pos} className="px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold bg-primary-main/10 text-primary-main">
                                                {pos}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {item.recruitment_message && (
                                    <p className="text-sm text-secondary-main/80 mb-6 italic line-clamp-3">
                                        &quot;{item.recruitment_message}&quot;
                                    </p>
                                )}

                                <Button
                                    fullWidth
                                    size="sm"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    Apply to Join
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Application Modal Overlay - Using simple conditional rendering for MVP */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-black mb-1">Apply to {selectedItem.name}</h3>
                            <p className="text-sm text-secondary-main/60 mb-6">
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
