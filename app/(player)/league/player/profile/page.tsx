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
} from '@/components/plyaz';
import { useToast } from '@/components/providers/ToastProvider';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useLanguage } from '@/components/providers';
import { uploadImage } from '@/lib/supabase/storage';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

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
    const [whatsappOptedIn, setWhatsappOptedIn] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        position: profile?.position || '',
        jersey_number: profile?.jersey_number?.toString() || '',
        bio: profile?.bio || '',
        nationality: profile?.nationality || '',
        avatar_url: profile?.avatar_url || '',
        phone: profile?.phone || '',
    });

    // Load whatsapp_opted_in from user_metadata on mount
    useEffect(() => {
        const loadMeta = async () => {
            try {
                const supabase = createClient();
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (user?.user_metadata?.whatsapp_opted_in) {
                    setWhatsappOptedIn(true);
                }
            } catch {
                // ignore
            }
        };
        loadMeta();
    }, []);

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
            });

            if (error) {
                const message =
                    typeof error === 'string' ? error : (error as { message?: string }).message;
                toast.error(message || 'Failed to update profile');
                return;
            }

            // Save whatsapp_opted_in to user_metadata
            try {
                const supabase = createClient();
                await supabase.auth.updateUser({
                    data: { whatsapp_opted_in: whatsappOptedIn },
                });
            } catch {
                // Non-critical: don't fail the whole save if metadata update fails
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

                            {/* WhatsApp section */}
                            <div className="mt-2 border-t border-gray-100 pt-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="text-lg">💬</span>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                        {t('profile.whatsappSection')}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Input
                                            label={t('profile.whatsappNumber')}
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({ ...formData, phone: e.target.value })
                                            }
                                            placeholder={t('profile.whatsappPh')}
                                        />
                                        <p className="mt-1.5 text-[11px] text-gray-400">
                                            {t('profile.whatsappHint')}
                                        </p>
                                    </div>

                                    <label className="group flex cursor-pointer items-start gap-3">
                                        <div className="relative mt-0.5 flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={whatsappOptedIn}
                                                onChange={(e) =>
                                                    setWhatsappOptedIn(e.target.checked)
                                                }
                                                className="sr-only"
                                                disabled={!formData.phone}
                                            />
                                            <div
                                                onClick={() => {
                                                    if (formData.phone)
                                                        setWhatsappOptedIn((v) => !v);
                                                }}
                                                className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded border-2 transition-all ${
                                                    whatsappOptedIn && formData.phone
                                                        ? 'border-green-500 bg-green-500'
                                                        : 'border-gray-300 bg-white group-hover:border-green-400'
                                                } ${!formData.phone ? 'cursor-not-allowed opacity-40' : ''}`}
                                            >
                                                {whatsappOptedIn && formData.phone && (
                                                    <svg
                                                        className="h-3 w-3 text-white"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={3}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">
                                                {t('profile.whatsappOptin')}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-gray-400">
                                                {t('profile.whatsappOptinDesc')}
                                            </p>
                                        </div>
                                    </label>
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

                <div className="flex items-center justify-between rounded-2xl bg-gray-900 p-6 text-white">
                    <div>
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-orange-500">
                            {t('profile.scoutingStatus')}
                        </p>
                        <p className="text-sm font-bold">{t('profile.publicProfile')}</p>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="border-0 bg-white/10 hover:bg-white/20"
                    >
                        {t('profile.managePrivacy')}
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
}
