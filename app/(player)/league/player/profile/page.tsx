'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Button,
    Input,
    Select,
    Badge,
    Toggle,
} from '@/components/plyaz';
import { useToast } from '@/components/providers/ToastProvider';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useLanguage } from '@/components/providers';
import { uploadImage } from '@/lib/supabase/storage';
import { Loader2, Smartphone } from 'lucide-react';
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
    const { t } = useLanguage();
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
        phone: profile?.phone || '',
        scouting_status: (profile?.scouting_status || 'hidden') as 'open' | 'hidden',
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
                setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
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
            // Save profile fields (includes phone)
            const { error } = await updateProfile({
                full_name: formData.full_name,
                position: formData.position,
                jersey_number: parseInt(formData.jersey_number) || null,
                bio: formData.bio,
                nationality: formData.nationality,
                phone: formData.phone || null,
                scouting_status: formData.scouting_status,
            });

            if (error) {
                const message =
                    typeof error === 'string' ? error : (error as { message?: string }).message;
                toast.error(message || 'Failed to update profile');
                return;
            }

            toast.success('Profile updated successfully! ✨');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageLayout title={t('profile.title')}>
            <PageHeader
                label={t('profile.identityLabel')}
                title={t('profile.subtitle')}
                description={t('profile.description')}
            />

            <div className="max-w-2xl space-y-8 pb-12">
                <Card elevated>
                    <CardContent className="p-8">
                        <div className="mb-10 flex flex-col items-start gap-8 md:flex-row">
                            <div className="group relative">
                                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-neutral-900 text-3xl font-black text-white shadow-xl transition-transform group-hover:scale-105">
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
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-orange-600 text-white shadow-lg transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                                <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-gray-400">
                                    Registration Status
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="success">Verified Player</Badge>
                                    <Badge variant="secondary">S24 Registered</Badge>
                                    <Badge variant="secondary">Plyaz Stars • ST</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <Input
                                label={t('profile.fullName')}
                                value={formData.full_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, full_name: e.target.value })
                                }
                                placeholder={t('profile.namePh')}
                            />

                            <div className="grid gap-6 md:grid-cols-2">
                                <Select
                                    label={t('profile.position')}
                                    options={POSITIONS}
                                    value={formData.position}
                                    onChange={(e) =>
                                        setFormData({ ...formData, position: e.target.value })
                                    }
                                />
                                <Input
                                    label={t('profile.jersey')}
                                    type="number"
                                    value={formData.jersey_number}
                                    onChange={(e) =>
                                        setFormData({ ...formData, jersey_number: e.target.value })
                                    }
                                    placeholder={t('profile.jerseyPh')}
                                />
                            </div>

                            <Input
                                label={t('profile.nationality')}
                                value={formData.nationality}
                                onChange={(e) =>
                                    setFormData({ ...formData, nationality: e.target.value })
                                }
                                placeholder={t('profile.nationalityPh')}
                            />

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">
                                    {t('profile.bio')}
                                </label>
                                <textarea
                                    className="min-h-[100px] w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-orange-500"
                                    value={formData.bio}
                                    onChange={(e) =>
                                        setFormData({ ...formData, bio: e.target.value })
                                    }
                                    placeholder={t('profile.bioPh')}
                                />
                            </div>

                            {/* WhatsApp Alerts — Coming Soon */}
                            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                        <Smartphone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="text-sm font-black uppercase tracking-widest text-neutral-900 dark:text-white">
                                                {t('profile.whatsappSection')}
                                            </span>
                                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                                                Coming Soon
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Get notified when your match starts, goals are scored,
                                            and at the final whistle. WhatsApp alerts will be
                                            available in the next update.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-6">
                                <Button
                                    className="h-14 px-12 text-base font-bold"
                                    onClick={handleSave}
                                    isLoading={isLoading}
                                >
                                    {t('profile.saveChanges')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    <div className="text-xs font-black uppercase tracking-widest text-neutral-500">
                        {t('profile.scoutingStatus')}
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
                        <div>
                            <div className="text-sm font-bold text-neutral-900 dark:text-white">
                                {t('profile.publicProfile')}
                            </div>
                            <div className="mt-0.5 text-xs text-neutral-500">
                                Allow scouts to discover your profile on the public player directory
                            </div>
                        </div>
                        <Toggle
                            checked={formData.scouting_status === 'open'}
                            onChange={(val) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    scouting_status: val ? 'open' : 'hidden',
                                }))
                            }
                        />
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
