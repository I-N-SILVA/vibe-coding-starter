'use client';

import React, { useState, useRef } from 'react';
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
import { useToast } from '@/components/providers/ToastProvider';
import { useAuth } from '@/lib/auth/AuthProvider';
import { uploadImage } from '@/lib/supabase/storage';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

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
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        position: profile?.position || '',
        jersey_number: profile?.jersey_number?.toString() || '',
        bio: profile?.bio || '',
        nationality: profile?.nationality || '',
        avatar_url: profile?.avatar_url || '',
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile?.id) return;

        setIsUploading(true);
        try {
            const fileName = `${profile.id}-${Date.now()}.${file.name.split('.').pop()}`;
            const publicUrl = await uploadImage(file, 'avatars', `profiles/${fileName}`);
            
            // Immediately update profile in DB with new avatar URL
            const { error } = await updateProfile({ avatar_url: publicUrl });
            
            if (!error) {
                setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
                toast.success('Profile picture updated! 📸');
            } else {
                throw new Error('Failed to update profile record');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const { error } = await updateProfile({
                full_name: formData.full_name,
                position: formData.position,
                jersey_number: parseInt(formData.jersey_number) || null,
                bio: formData.bio,
                nationality: formData.nationality,
            });

            if (!error) {
                toast.success('Profile updated successfully! ✨');
            } else {
                const message = typeof error === 'string' ? error : (error as { message?: string }).message;
                toast.error(message || 'Failed to update profile');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageLayout title="MY PROFILE">
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
                                <div className="w-24 h-24 rounded-3xl bg-neutral-900 overflow-hidden flex items-center justify-center text-3xl font-black text-white shadow-xl group-hover:scale-105 transition-transform relative">
                                    {formData.avatar_url ? (
                                        <Image 
                                            src={formData.avatar_url} 
                                            alt={formData.full_name} 
                                            fill 
                                            className="object-cover"
                                        />
                                    ) : (
                                        formData.jersey_number || '#'
                                    )}

                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg hover:bg-orange-700 transition-colors border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-[10px]">📷</span>
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    accept="image/*" 
                                    className="hidden" 
                                />
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
