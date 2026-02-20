'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Input,
    Select,
    PageHeader,
    EmptyState,
    Modal,
    NavIcons,
} from '@/components/plyaz';
import { PageLayout } from '@/components/plyaz/navigation/PageLayout';
import { adminNavItems } from '@/lib/constants/navigation';
import { useToast } from '@/components/providers';
import { stagger, fadeUp } from '@/lib/animations';
import { useVenues, useCreateVenue, useDeleteVenue } from '@/lib/hooks';

type ApiVenue = {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    capacity: number | null;
    surface_type: string | null;
    created_at: string;
};

const SURFACE_OPTIONS = [
    { value: 'grass', label: 'Natural Grass' },
    { value: 'artificial', label: 'Artificial Turf' },
    { value: 'indoor', label: 'Indoor' },
    { value: 'hybrid', label: 'Hybrid' },
];

export default function VenuesPage() {
    const { data: venues = [], isLoading, error } = useVenues();
    const createVenue = useCreateVenue();
    const deleteVenue = useDeleteVenue();
    const toast = useToast();
    const [showCreate, setShowCreate] = useState(false);
    const [newVenue, setNewVenue] = useState({
        name: '',
        address: '',
        city: '',
        capacity: '',
        surface_type: 'grass',
    });

    const venueList: ApiVenue[] = Array.isArray(venues) ? (venues as unknown as ApiVenue[]) : [];

    const handleCreate = async () => {
        if (!newVenue.name.trim()) return;
        try {
            await createVenue.mutateAsync({
                name: newVenue.name,
                address: newVenue.address || undefined,
                city: newVenue.city || undefined,
                capacity: newVenue.capacity ? parseInt(newVenue.capacity) : undefined,
                surfaceType: newVenue.surface_type as 'grass' | 'artificial' | 'indoor' | 'hybrid',
            });
            toast.success('Venue created successfully');
            setShowCreate(false);
            setNewVenue({ name: '', address: '', city: '', capacity: '', surface_type: 'grass' });
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to create venue');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteVenue.mutateAsync(id);
            toast.success('Venue deleted');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete venue');
        }
    };

    return (
        <PageLayout navItems={adminNavItems} title="Venues">
            <div className="space-y-6">
                <PageHeader
                    label="Management"
                    title="Venues"
                    description={`${venueList.length} venue${venueList.length !== 1 ? 's' : ''}`}
                    rightAction={
                        <Button onClick={() => setShowCreate(true)} className="h-10 md:h-9 text-xs">
                            + Add Venue
                        </Button>
                    }
                />

                {/* Create Modal */}
                <Modal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    title="Add Venue"
                    description="Add a new match location"
                >
                    <div className="space-y-4">
                        <Input
                            label="Venue Name"
                            placeholder="e.g., Main Stadium"
                            value={newVenue.name}
                            onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                        />
                        <Input
                            label="Address"
                            placeholder="123 Sports Lane"
                            value={newVenue.address}
                            onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="City"
                                placeholder="London"
                                value={newVenue.city}
                                onChange={(e) => setNewVenue({ ...newVenue, city: e.target.value })}
                            />
                            <Input
                                label="Capacity"
                                type="number"
                                placeholder="5000"
                                value={newVenue.capacity}
                                onChange={(e) => setNewVenue({ ...newVenue, capacity: e.target.value })}
                            />
                        </div>
                        <Select
                            label="Surface Type"
                            options={SURFACE_OPTIONS}
                            value={newVenue.surface_type}
                            onChange={(e) => setNewVenue({ ...newVenue, surface_type: e.target.value })}
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="secondary" onClick={() => setShowCreate(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={!newVenue.name.trim() || createVenue.isPending}
                                isLoading={createVenue.isPending}
                            >
                                Add Venue
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Loading */}
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
                        Failed to load venues. Please try again.
                    </div>
                )}

                {/* Venue list */}
                {!isLoading && (
                    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
                        {venueList.map((venue) => (
                            <motion.div key={venue.id} variants={fadeUp}>
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-3 md:p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <NavIcons.Public className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{venue.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    {venue.city && (
                                                        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                                                            {venue.city}
                                                        </span>
                                                    )}
                                                    {venue.capacity && (
                                                        <>
                                                            <span className="text-gray-200">·</span>
                                                            <span className="text-[10px] text-gray-400">
                                                                {venue.capacity.toLocaleString()} capacity
                                                            </span>
                                                        </>
                                                    )}
                                                    {venue.surface_type && (
                                                        <>
                                                            <span className="text-gray-200">·</span>
                                                            <span className="text-[10px] text-gray-400 capitalize">
                                                                {venue.surface_type}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(venue.id)}
                                                className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors px-2 py-1"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        {venueList.length === 0 && !isLoading && (
                            <EmptyState
                                icon={<NavIcons.Public />}
                                title="No Venues"
                                description="Add your first venue to manage match locations."
                            />
                        )}
                    </motion.div>
                )}
            </div>
        </PageLayout>
    );
}
