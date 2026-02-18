'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

/**
 * Player Digital Passport - Registration Flow
 * A premium, multi-step onboarding experience for players.
 */

const POSITIONS = [
    { value: 'GK', label: 'Goalkeeper' },
    { value: 'CB', label: 'Centre Back' },
    { value: 'CDM', label: 'Defensive Mid' },
    { value: 'CM', label: 'Central Mid' },
    { value: 'CAM', label: 'Attacking Mid' },
    { value: 'LW', label: 'Left Wing' },
    { value: 'RW', label: 'Right Wing' },
    { value: 'ST', label: 'Striker' },
];

export default function PlayerRegistration() {
    const { profile, updateProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        dob: '',
        id_number: '',
        position: profile?.position || '',
        jersey_number: profile?.jersey_number?.toString() || '',
        preferred_foot: 'Right',
        bio: profile?.bio || '',
        nationality: profile?.nationality || '',
    });

    const totalSteps = 3;

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            await updateProfile({
                ...formData,
                jersey_number: parseInt(formData.jersey_number) || null,
            });
            window.location.href = '/league/player/profile';
        } catch (err) {
            console.error('Registration failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <h3 className="text-xl font-black">Personal Basics</h3>
                            <p className="text-sm text-gray-400">Let's verify your identity for the league records.</p>
                        </div>
                        <Input
                            label="Full Identity Name"
                            placeholder="e.g. Marcus Rashford"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Date of Birth"
                                type="date"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            />
                            <Input
                                label="ID/Passport Number"
                                placeholder="ABC-123456"
                                value={formData.id_number}
                                onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                            />
                        </div>
                        <div className="p-4 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-between">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Identity Document Upload</div>
                            <Button variant="secondary" size="sm" className="bg-gray-50 border-0 h-8">Select File</Button>
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <h3 className="text-xl font-black">Sporting Bio</h3>
                            <p className="text-sm text-gray-400">Your profile on the pitch. Choose your weapons.</p>
                        </div>
                        <Select
                            label="Primary Position"
                            options={POSITIONS}
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Jersey Number"
                                type="number"
                                placeholder="10"
                                value={formData.jersey_number}
                                onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                            />
                            <Select
                                label="Preferred Foot"
                                options={[
                                    { value: 'Right', label: 'Right' },
                                    { value: 'Left', label: 'Left' },
                                    { value: 'Ambidextrous', label: 'Both' }
                                ]}
                                value={formData.preferred_foot}
                                onChange={(e) => setFormData({ ...formData, preferred_foot: e.target.value })}
                            />
                        </div>
                        {/* Mini Pitch Visual Position Selector would go here */}
                        <div className="aspect-[4/3] bg-gray-900 rounded-3xl relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-4 border border-white/10 rounded-xl" />
                            <div className="absolute left-1/2 top-4 -translate-x-1/2 w-24 h-12 border border-white/10" />
                            <div className="absolute left-1/2 bottom-4 -translate-x-1/2 w-24 h-12 border border-white/10" />
                            <div className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Pitch Map Selector</div>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <h3 className="text-xl font-black">Social & Identity</h3>
                            <p className="text-sm text-gray-400">The human element. Tell the league who you are.</p>
                        </div>
                        <Input
                            label="Nationality"
                            placeholder="e.g. English"
                            value={formData.nationality}
                            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        />
                        <div className="space-y-2">
                            <label className="text-xs font-bold tracking-widest uppercase text-gray-400">Short Bio</label>
                            <textarea
                                className="w-full h-32 p-4 rounded-2xl bg-gray-50 border-0 focus:ring-2 focus:ring-orange-500 text-sm"
                                placeholder="I play for the badge, I live for the game..."
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-6 p-6 rounded-3xl bg-gray-900 text-white">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">👤</div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Passport Photo</p>
                                <p className="text-[10px] text-gray-400">High-res, clear face, no sunglasses.</p>
                            </div>
                            <Button variant="secondary" size="sm" className="bg-white/10 border-0 hover:bg-white/20 h-8">Upload</Button>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <PageLayout navItems={playerNavItems} title="REGISTRATION">
            <PageHeader
                label={`Step ${step} of ${totalSteps}`}
                title="Player Passport"
                description="Initialize your digital player ID for the upcoming season."
            />

            <div className="max-w-xl mx-auto pb-24">
                {/* Progress Bar */}
                <div className="h-1 bg-gray-100 rounded-full mb-12 overflow-hidden">
                    <motion.div
                        className="h-full bg-orange-600"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>

                <Card elevated className="border-0 rounded-3xl">
                    <CardContent className="p-8">
                        <AnimatePresence mode="wait">
                            {renderStep()}
                        </AnimatePresence>

                        <div className="flex items-center justify-between pt-12">
                            {step > 1 ? (
                                <Button variant="secondary" onClick={prevStep} className="h-12 border-0 bg-gray-50">
                                    Previous
                                </Button>
                            ) : <div />}

                            {step < totalSteps ? (
                                <Button onClick={nextStep} className="h-12 px-12 bg-black text-white hover:bg-orange-600">
                                    Next Intelligence
                                </Button>
                            ) : (
                                <Button onClick={handleComplete} isLoading={isLoading} className="h-12 px-12 bg-orange-600 text-white">
                                    Finish & Finalize
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 p-6 rounded-2xl bg-orange-50 border border-orange-100 flex gap-4">
                    <span className="text-xl">⚠️</span>
                    <p className="text-[10px] text-orange-900 font-bold uppercase leading-relaxed tracking-wide">
                        All information must match your official ID. Providing false data may lead to disqualification from the competition.
                    </p>
                </div>
            </div>
        </PageLayout>
    );
}
