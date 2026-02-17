'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthProvider';
import {
    Card,
    CardContent,
    Button,
    Input,
    Select,
} from '@/components/plyaz';

export default function OnboardingPage() {
    const router = useRouter();
    const { user, profile, isLoading } = useAuth();
    const [leagueName, setLeagueName] = useState('');
    const [leagueType, setLeagueType] = useState('league');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Role Enforcement & Redirects
    React.useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
                return;
            }
            // If user already has an organization, they shouldn't be here
            if (profile?.organization_id) {
                router.push('/league');
                return;
            }
            if (profile && profile.role !== 'organizer') {
                router.push('/league/public/matches');
            }
        }
    }, [user, profile, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leagueName.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // Derive organization name and slug from league name
            const orgName = leagueName;
            const orgSlug = leagueName.toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            // 1. Create Organization
            const orgRes = await fetch('/api/league/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: orgName, slug: orgSlug }),
            });

            if (!orgRes.ok) {
                const data = await orgRes.json();
                throw new Error(data.error || 'Failed to create organization');
            }

            await orgRes.json();
            // Organization created successfully
            setIsSuccess(true);

            // 2. Create Initial League (Fire and forget, don't block success screen)
            fetch('/api/league/competitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: leagueName,
                    type: leagueType,
                    status: 'draft'
                }),
            }).catch(err => console.warn('Background league creation failed:', err));

            // Redirect after celebration delay
            setTimeout(() => {
                router.push('/league');
                router.refresh();
            }, 2500);
        } catch (err) {
            console.warn('[Onboarding] Error:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setIsSubmitting(false);
        }
    };

    const [initTimedOut, setInitTimedOut] = useState(false);

    // Profile Initialization Timeout
    React.useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (user && !profile && !isLoading) {
            timeout = setTimeout(() => {
                setInitTimedOut(true);
            }, 10000); // 10 seconds timeout for profile initialization
        }
        return () => clearTimeout(timeout);
    }, [user, profile, isLoading]);

    if (isLoading || (user && !profile && !initTimedOut)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold tracking-widest uppercase text-secondary-main/40 animate-pulse">
                    Initializing your profile...
                </p>
                <p className="text-[10px] text-secondary-main/20 uppercase tracking-tighter">
                    Waiting for database sync...
                </p>
            </div>
        );
    }

    if (user && !profile && initTimedOut) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 space-y-6 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                </div>
                <div>
                    <h2 className="text-xl font-black text-primary-main mb-2">Sync Connection Issues</h2>
                    <p className="text-secondary-main/50 text-sm max-w-xs mx-auto">
                        Your account was created, but we couldn&apos;t sync your profile settings yet. This usually happens if the database setup is incomplete.
                    </p>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Button
                        size="lg"
                        onClick={() => window.location.reload()}
                        className="h-14 font-bold tracking-widest"
                    >
                        RETRY SYNC
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => router.push('/login')}
                        className="h-14 font-bold tracking-widest"
                    >
                        BACK TO LOGIN
                    </Button>
                </div>
                <p className="text-[10px] text-secondary-main/30 uppercase max-w-xs leading-relaxed">
                    Check if you have run the <code className="bg-secondary-main/5 px-1 rounded">complete_fix.sql</code> in your Supabase Dashboard.
                </p>
            </div>
        );
    }

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
                <AnimatePresence mode="wait">
                    {isSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="bg-white rounded-3xl p-10 text-center shadow-2xl border border-secondary-main/5"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                                className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8"
                            >
                                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                            <h2 className="text-2xl font-black text-primary-main mb-2">Welcome to your dashboard!</h2>
                            <p className="text-secondary-main/50 text-sm mb-0">
                                Your league is being prepared. Propelling talent forward...
                            </p>
                            <div className="mt-8 flex justify-center">
                                <div className="w-12 h-1 bg-green-500/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '100%' }}
                                        transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                                        className="w-full h-full bg-green-500"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <Card key="onboarding-form" className="border-secondary-main/10 shadow-xl overflow-hidden">
                            <CardContent className="p-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div className="flex items-center gap-1 mb-8">
                                        <div className="flex-1 h-1 rounded-full bg-black" />
                                        <div className="flex-1 h-1 rounded-full bg-secondary-main/10" />
                                        <div className="flex-1 h-1 rounded-full bg-secondary-main/10" />
                                    </div>

                                    <h1 className="text-2xl font-black text-primary-main mb-2">Create Your First League</h1>
                                    <p className="text-secondary-main/50 text-sm mb-8">
                                        Welcome to PLYAZ! Let&apos;s get your first competition set up and launch your organization.
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <Input
                                            label="League Name"
                                            placeholder="e.g., Sunday Premier League"
                                            value={leagueName}
                                            onChange={(e) => setLeagueName(e.target.value)}
                                            autoFocus
                                            required
                                        />

                                        <div className="space-y-2">
                                            <Select
                                                label="Competition Type"
                                                value={leagueType}
                                                onChange={(e) => setLeagueType(e.target.value)}
                                                options={[
                                                    { value: 'league', label: 'League (Round Robin)' },
                                                    { value: 'knockout', label: 'Cup (Knockout)' },
                                                    { value: 'group_knockout', label: 'Group Stage + Knockout' },
                                                ]}
                                            />
                                            <p className="text-[10px] text-secondary-main/40 uppercase font-medium tracking-wider">
                                                💡 Recommended: League for season-long points
                                            </p>
                                        </div>

                                        {error && (
                                            <p className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 italic">
                                                {error}
                                            </p>
                                        )}

                                        <Button
                                            type="submit"
                                            fullWidth
                                            size="lg"
                                            disabled={!leagueName.trim() || isSubmitting}
                                            isLoading={isSubmitting}
                                            className="h-14 text-sm font-bold tracking-widest"
                                        >
                                            LAUNCH DASHBOARD
                                        </Button>
                                    </form>
                                </motion.div>
                            </CardContent>
                        </Card>
                    )}
                </AnimatePresence>

                <p className="text-center mt-8 text-[10px] font-bold tracking-[0.2em] uppercase text-secondary-main/30">
                    Propelling Talent Forward • PLYAZ
                </p>
            </motion.div>
        </div>
    );
}
