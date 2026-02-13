'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    Card,
    CardContent,
    Button,
    Input,
} from '@/components/plyaz';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNext = () => {
        if (step === 1 && name.trim()) {
            setStep(2);
            // Auto-generate slug from name if empty
            if (!slug) {
                setSlug(name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/league/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, slug }),
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to create organization');
            }

            console.log('[Onboarding] Organization created:', data);
            
            // Force a small delay to ensure profile is updated before redirect
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Success! Redirect to dashboard
            router.push('/league');
            router.refresh();
        } catch (err: any) {
            console.error('[Onboarding] Error:', err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-main/5 px-4">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent-main/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary-main/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md relative z-10"
            >
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/static/branding/logo-circle.png"
                            alt="PLYAZ"
                            width={40}
                            height={40}
                            className="rounded-xl"
                        />
                        <span className="text-2xl font-bold tracking-tight text-primary-main">PLYAZ</span>
                    </div>
                </div>

                <Card className="border-secondary-main/10 shadow-xl overflow-hidden">
                    <CardContent className="p-8">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h1 className="text-2xl font-bold text-primary-main mb-2">Welcome to PLYAZ</h1>
                                    <p className="text-secondary-main/50 text-sm mb-8">
                                        Let's start by setting up your organization. This will be the home for all your leagues and tournaments.
                                    </p>

                                    <div className="space-y-6">
                                        <Input
                                            label="Organization Name"
                                            placeholder="e.g., Gotham Soccer Association"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            autoFocus
                                        />
                                        <Button
                                            fullWidth
                                            size="lg"
                                            onClick={handleNext}
                                            disabled={!name.trim()}
                                        >
                                            Continue
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h1 className="text-2xl font-bold text-primary-main mb-2">Final Touches</h1>
                                    <p className="text-secondary-main/50 text-sm mb-8">
                                        Choose a unique slug for your organization's URL. You can change this later.
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <Input
                                            label="Organization Slug"
                                            placeholder="gotham-soccer"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                            helperText={`Your dashboard will be at plyaz.com/${slug || '...'}`}
                                        />

                                        {error && (
                                            <p className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100 italic">
                                                {error}
                                            </p>
                                        )}

                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => setStep(1)}
                                                disabled={isSubmitting}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                size="lg"
                                                disabled={!slug.trim() || isSubmitting}
                                                isLoading={isSubmitting}
                                            >
                                                Create Organization
                                            </Button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                <p className="text-center mt-8 text-xs text-secondary-main/30">
                    Step {step} of 2 • Create your legacy with PLYAZ
                </p>
            </motion.div>
        </div>
    );
}
