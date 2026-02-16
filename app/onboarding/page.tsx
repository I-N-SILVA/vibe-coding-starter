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
} from '@/components/plyaz';

export default function OnboardingPage() {
    const router = useRouter();
    const { user, profile, isLoading } = useAuth();
    const [leagueName, setLeagueName] = useState('');
    const [leagueType, setLeagueType] = useState('league');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Role Enforcement
    React.useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
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

            const orgData = await orgRes.json();
            // Organization created successfully

            // 2. Create Initial League
            const leagueRes = await fetch('/api/league/competitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: leagueName,
                    type: leagueType,
                    status: 'draft'
                }),
            });

            if (!leagueRes.ok) {
                const data = await leagueRes.json();
                console.warn('Failed to create initial league:', data.error);
                // We still redirect because the org was created successfully
            }

            // Force a small delay to ensure profile is updated before redirect (from remote)
            await new Promise(resolve => setTimeout(resolve, 800));

            // Success! Redirect to dashboard
            router.push('/league');
            router.refresh();
        } catch (err) {
            console.warn('[Onboarding] Error:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile || profile.role !== 'organizer') {
        return null; // or a minimal loading/redirecting state
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
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
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
                                    <label className="text-xs font-bold uppercase tracking-widest text-secondary-main/40">Competition Type</label>
                                    <select
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 transition-all appearance-none"
                                        value={leagueType}
                                        onChange={(e) => setLeagueType(e.target.value)}
                                    >
                                        <option value="league">League (Round Robin)</option>
                                        <option value="knockout">Cup (Knockout)</option>
                                        <option value="group_knockout">Group Stage + Knockout</option>
                                    </select>
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

                <p className="text-center mt-8 text-[10px] font-bold tracking-[0.2em] uppercase text-secondary-main/30">
                    Propelling Talent Forward • PLYAZ
                </p>
            </motion.div>
        </div>
    );
}
