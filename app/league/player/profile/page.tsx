'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Button,
    Input,
    Select,
    Badge,
} from '@/components/plyaz';
import { playerNavItems } from '@/lib/constants/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

const POSITIONS = [
    { value: 'GK', label: 'Goalkeeper' },
    { value: 'CB', label: 'Centre Back' },
    { value: 'LB', label: 'Left Back' },
    { value: 'RB', label: 'Right Back' },
    { value: 'CDM', label: 'Defensive Mid' },
    { value: 'CM', label: 'Central Mid' },
    { value: 'CAM', label: 'Attacking Mid' },
    { value: 'LM', label: 'Left Mid' },
    { value: 'RM', label: 'Right Mid' },
    { value: 'LW', label: 'Left Wing' },
    { value: 'RW', label: 'Right Wing' },
    { value: 'ST', label: 'Striker' },
    { value: 'CF', label: 'Centre Forward' },
];

export default function PlayerProfilePage() {
    const { profile, updateProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        position: profile?.position || '',
        jersey_number: profile?.jersey_number?.toString() || '',
        bio: profile?.bio || '',
        nationality: profile?.nationality || '',
    });

    const handleSave = async () => {
        setIsLoading(true);
        setSaved(false);
        try {
            const { error } = await updateProfile({
                full_name: formData.full_name,
                position: formData.position,
                jersey_number: parseInt(formData.jersey_number) || null,
                bio: formData.bio,
                nationality: formData.nationality,
            });

            if (!error) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageLayout navItems={playerNavItems} title="MY PROFILE">
            <PageHeader
                label="Identity"
                title="Personal Profile"
                description="Manage your player details and squad registration info."
            />

            <div className="max-w-2xl space-y-8 pb-12">
                <Card elevated>
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-3xl bg-gray-900 flex items-center justify-center text-3xl font-black text-white shadow-xl group-hover:scale-105 transition-transform">
                                    {formData.jersey_number || '#'}
                                </div>
                                <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg hover:bg-orange-700 transition-colors border-2 border-white">
                                    <span className="text-[10px]">📷</span>
                                </button>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-2">Registration Status</h3>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="success">Verified Player</Badge>
                                    <Badge variant="secondary">S24 Registered</Badge>
                                    <Badge variant="secondary">Plyaz Stars • ST</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <Input
                                label="Full Display Name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="e.g. Marcus Johnson"
                            />

                            <div className="grid md:grid-cols-2 gap-6">
                                <Select
                                    label="Primary Position"
                                    options={POSITIONS}
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                />
                                <Input
                                    label="Jersey Number"
                                    type="number"
                                    value={formData.jersey_number}
                                    onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                                    placeholder="e.g. 10"
                                />
                            </div>

                            <Input
                                label="Nationality"
                                value={formData.nationality}
                                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                placeholder="e.g. English"
                            />

                            <div>
                                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Personal Bio</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px] resize-none"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="The pitch is where I belong..."
                                />
                            </div>

                            <div className="pt-6 flex items-center gap-4">
                                <Button
                                    className="h-14 px-12 text-base font-bold"
                                    onClick={handleSave}
                                    isLoading={isLoading}
                                >
                                    Save Changes
                                </Button>
                                {saved && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-green-600 text-sm font-bold flex items-center gap-2"
                                    >
                                        ✓ Profile Updated Successfully
                                    </motion.span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-6 rounded-2xl bg-gray-900 text-white flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Scouting Status</p>
                        <p className="text-sm font-bold">Public Profile Visibility</p>
                    </div>
                    <Button variant="secondary" size="sm" className="bg-white/10 border-0 hover:bg-white/20">
                        Manage Privacy
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
}
