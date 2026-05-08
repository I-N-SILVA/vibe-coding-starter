'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardContent, Button, Input } from '@/components/plyaz';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type OnboardingRole = 'organizer' | 'player' | 'referee';

type Step = { id: 'role' } | { id: 'organizer' } | { id: 'player' } | { id: 'referee' };

// ─────────────────────────────────────────
// Step progress bar
// ─────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
    return (
        <div className="mb-8 flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                        i < current
                            ? 'flex-1 bg-orange-500'
                            : i === current
                              ? 'flex-[2] bg-orange-500'
                              : 'flex-1 bg-gray-200'
                    }`}
                />
            ))}
        </div>
    );
}

// ─────────────────────────────────────────
// Main page
// ─────────────────────────────────────────

export default function OnboardingPage() {
    const router = useRouter();
    const { user, profile, isLoading, updateProfile } = useAuth();
    const [step, setStep] = useState<Step>({ id: 'role' });
    const [selectedRole, setSelectedRole] = useState<OnboardingRole | null>(null);

    // Organizer state
    const [leagueName, setLeagueName] = useState('');
    const [leagueType, setLeagueType] = useState('league');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Player state
    const [inviteCode, setInviteCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);

    // Profile init timeout
    const [initTimedOut, setInitTimedOut] = useState(false);

    React.useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
                return;
            }
            if (profile?.organization_id) {
                router.push('/league');
                return;
            }
        }
    }, [user, profile, isLoading, router]);

    React.useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (user && !profile && !isLoading) {
            timeout = setTimeout(() => setInitTimedOut(true), 10000);
        }
        return () => clearTimeout(timeout);
    }, [user, profile, isLoading]);

    // ─── Loading states ───────────────────────────────────────────────

    if (isLoading || (user && !profile && !initTimedOut)) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
                <p className="animate-pulse text-xs font-bold uppercase tracking-widest text-gray-400">
                    Initializing your profile...
                </p>
                <p className="text-[10px] uppercase tracking-tighter text-gray-300">
                    Waiting for database sync...
                </p>
            </div>
        );
    }

    if (user && !profile && initTimedOut) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center space-y-6 bg-white px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                    <span className="text-2xl">⚠️</span>
                </div>
                <div>
                    <h2 className="mb-2 text-xl font-black text-gray-900">
                        Sync Connection Issues
                    </h2>
                    <p className="mx-auto max-w-xs text-sm text-gray-500">
                        Your account was created, but we couldn&apos;t sync your profile settings
                        yet.
                    </p>
                </div>
                <div className="flex w-full max-w-xs flex-col gap-3">
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
                <p className="max-w-xs text-[10px] uppercase leading-relaxed text-gray-300">
                    Check if you have run the{' '}
                    <code className="rounded bg-gray-50 px-1">complete_fix.sql</code> in your
                    Supabase Dashboard.
                </p>
            </div>
        );
    }

    const firstName = user?.email?.split('@')[0] ?? 'there';

    // ─── Handlers ────────────────────────────────────────────────────

    const handleRoleSelect = async (role: OnboardingRole) => {
        setSelectedRole(role);
        // Update role in profile
        await updateProfile({ role: role === 'player' ? 'player' : role });
        setStep({ id: role });
    };

    const handleOrganizerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leagueName.trim()) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const orgSlug = leagueName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            const orgRes = await fetch('/api/league/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: leagueName, slug: orgSlug }),
            });

            if (!orgRes.ok) {
                const errorData = (await orgRes.json()) as { error?: string };
                throw new Error(errorData.error || 'Failed to create organization');
            }

            await fetch('/api/league/competitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: leagueName, type: leagueType }),
            });

            setIsSuccess(true);
            setTimeout(() => {
                window.location.href = '/league';
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setIsSubmitting(false);
        }
    };

    const handleJoinWithCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;
        setIsJoining(true);
        setJoinError(null);

        try {
            const res = await fetch('/api/league/invites/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: inviteCode.trim().toUpperCase() }),
            });

            if (!res.ok) {
                const data = (await res.json()) as { error?: string };
                throw new Error(data.error || 'Invalid invite code');
            }

            setIsSuccess(true);
            setTimeout(() => {
                window.location.href = '/league/player/dashboard';
            }, 1500);
        } catch (err) {
            setJoinError(err instanceof Error ? err.message : 'Invalid code');
            setIsJoining(false);
        }
    };

    // ─── Success screen ───────────────────────────────────────────────

    if (isSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-2xl"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                        className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-50"
                    >
                        <svg
                            className="h-10 w-10 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </motion.div>
                    <h2 className="mb-2 text-2xl font-black text-gray-900">
                        You&apos;re all set, {firstName}!
                    </h2>
                    <p className="text-sm text-gray-500">
                        {selectedRole === 'organizer'
                            ? "Your league is ready. Let's build something great."
                            : selectedRole === 'referee'
                              ? 'Welcome, referee. Matches will be assigned to you soon.'
                              : 'Welcome to PLYAZ. Connect with your team.'}
                    </p>
                    <div className="mt-8 flex justify-center">
                        <div className="h-1 w-12 overflow-hidden rounded-full bg-orange-500/10">
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ duration: 1.5, ease: 'linear', repeat: Infinity }}
                                className="h-full w-full bg-orange-500"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ─── Main layout wrapper ──────────────────────────────────────────

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            {/* Background blobs */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="bg-orange-500/8 absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
                <div className="bg-gray-900/8 absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo wordmark */}
                <div className="mb-8 text-center">
                    <span className="text-2xl font-black uppercase tracking-[0.2em] text-gray-900">
                        PLYAZ
                    </span>
                    <div className="mx-auto mt-2 h-0.5 w-8 bg-orange-500" />
                </div>

                <AnimatePresence mode="wait">
                    {/* ── STEP 1: Role selection ───────────────────────────── */}
                    {step.id === 'role' && (
                        <motion.div
                            key="role"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="overflow-hidden border-gray-100 shadow-xl">
                                <CardContent className="p-8">
                                    <StepDots current={0} total={2} />
                                    <h1 className="mb-1 text-2xl font-black text-gray-900">
                                        Welcome to PLYAZ
                                    </h1>
                                    <p className="mb-8 text-sm text-gray-400">
                                        How will you use PLYAZ?
                                    </p>

                                    <div className="space-y-3">
                                        <RoleCard
                                            icon="🏆"
                                            label="I'm a League Organizer"
                                            description="Create leagues, manage seasons, track everything"
                                            onClick={() => handleRoleSelect('organizer')}
                                            accent="orange"
                                        />
                                        <RoleCard
                                            icon="⚽"
                                            label="I'm a Player or Coach"
                                            description="Join a team, track stats, confirm availability"
                                            onClick={() => handleRoleSelect('player')}
                                            accent="blue"
                                        />
                                        <RoleCard
                                            icon="🟡"
                                            label="I'm a Referee"
                                            description="Log match events live and submit official reports"
                                            onClick={() => handleRoleSelect('referee')}
                                            accent="yellow"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ── STEP 2a: Organizer ───────────────────────────────── */}
                    {step.id === 'organizer' && (
                        <motion.div
                            key="organizer"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="overflow-hidden border-gray-100 shadow-xl">
                                <CardContent className="p-8">
                                    <StepDots current={1} total={2} />

                                    <button
                                        onClick={() => setStep({ id: 'role' })}
                                        className="mb-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-orange-500"
                                    >
                                        ← Back
                                    </button>

                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
                                        <span className="text-2xl">🏆</span>
                                    </div>
                                    <h1 className="mb-1 text-2xl font-black text-gray-900">
                                        Create your league
                                    </h1>
                                    <p className="mb-8 text-sm text-gray-400">
                                        Set up your competition and invite teams to compete.
                                    </p>

                                    <form onSubmit={handleOrganizerSubmit} className="space-y-5">
                                        <Input
                                            label="League Name"
                                            placeholder="e.g., Sunday Premier League"
                                            value={leagueName}
                                            onChange={(e) => setLeagueName(e.target.value)}
                                            autoFocus
                                            required
                                        />

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                                Competition Format
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    {
                                                        value: 'league',
                                                        label: 'League',
                                                        sub: 'Round Robin',
                                                    },
                                                    {
                                                        value: 'knockout',
                                                        label: 'Cup',
                                                        sub: 'Knockout',
                                                    },
                                                    {
                                                        value: 'group_knockout',
                                                        label: 'Mixed',
                                                        sub: 'Groups + KO',
                                                    },
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setLeagueType(opt.value)}
                                                        className={`rounded-xl border-2 p-3 text-center transition-all ${
                                                            leagueType === opt.value
                                                                ? 'border-orange-500 bg-orange-50 text-gray-900'
                                                                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                                        }`}
                                                    >
                                                        <div className="text-xs font-black">
                                                            {opt.label}
                                                        </div>
                                                        <div className="mt-0.5 text-[9px] text-gray-400">
                                                            {opt.sub}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {error && (
                                            <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-500">
                                                {error}
                                            </p>
                                        )}

                                        <Button
                                            type="submit"
                                            fullWidth
                                            size="lg"
                                            disabled={!leagueName.trim() || isSubmitting}
                                            isLoading={isSubmitting}
                                            className="h-14 border-0 bg-orange-500 text-sm font-bold tracking-widest text-white hover:bg-orange-600"
                                        >
                                            LAUNCH MY LEAGUE
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ── STEP 2b: Player/Coach ────────────────────────────── */}
                    {step.id === 'player' && (
                        <motion.div
                            key="player"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="overflow-hidden border-gray-100 shadow-xl">
                                <CardContent className="p-8">
                                    <StepDots current={1} total={2} />

                                    <button
                                        onClick={() => setStep({ id: 'role' })}
                                        className="mb-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-orange-500"
                                    >
                                        ← Back
                                    </button>

                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                                        <span className="text-2xl">⚽</span>
                                    </div>
                                    <h1 className="mb-1 text-2xl font-black text-gray-900">
                                        Join a team
                                    </h1>
                                    <p className="mb-8 text-sm text-gray-400">
                                        Enter the invite code your league organizer sent you, or
                                        browse open teams.
                                    </p>

                                    <form onSubmit={handleJoinWithCode} className="space-y-4">
                                        <Input
                                            label="Team Invite Code"
                                            placeholder="e.g. PHXABC123"
                                            value={inviteCode}
                                            onChange={(e) =>
                                                setInviteCode(e.target.value.toUpperCase())
                                            }
                                            autoFocus
                                        />

                                        {joinError && (
                                            <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-500">
                                                {joinError}
                                            </p>
                                        )}

                                        <Button
                                            type="submit"
                                            fullWidth
                                            size="lg"
                                            disabled={!inviteCode.trim() || isJoining}
                                            isLoading={isJoining}
                                            className="h-14 border-0 bg-orange-500 text-sm font-bold tracking-widest text-white hover:bg-orange-600"
                                        >
                                            JOIN WITH CODE
                                        </Button>
                                    </form>

                                    <div className="my-5 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-gray-100" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                                            or
                                        </span>
                                        <div className="h-px flex-1 bg-gray-100" />
                                    </div>

                                    <div className="space-y-3">
                                        <Button
                                            variant="secondary"
                                            fullWidth
                                            onClick={() => router.push('/discover')}
                                            className="h-12 border-gray-200 text-xs font-bold tracking-widest text-gray-600"
                                        >
                                            Browse Open Teams
                                        </Button>
                                        <button
                                            onClick={() => {
                                                window.location.href = '/league/player/dashboard';
                                            }}
                                            className="w-full py-2 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-orange-500"
                                        >
                                            Skip for now →
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ── STEP 2c: Referee ─────────────────────────────────── */}
                    {step.id === 'referee' && (
                        <motion.div
                            key="referee"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="overflow-hidden border-gray-100 shadow-xl">
                                <CardContent className="p-8">
                                    <StepDots current={1} total={2} />

                                    <button
                                        onClick={() => setStep({ id: 'role' })}
                                        className="mb-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-orange-500"
                                    >
                                        ← Back
                                    </button>

                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50">
                                        <span className="text-2xl">🟡</span>
                                    </div>
                                    <h1 className="mb-1 text-2xl font-black text-gray-900">
                                        You&apos;re all set
                                    </h1>
                                    <p className="mb-6 text-sm text-gray-400">
                                        Your referee account is ready. The league manager will
                                        assign you to matches — you&apos;ll get notified when
                                        you&apos;re scheduled.
                                    </p>

                                    <div className="mb-8 space-y-2 rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-yellow-700">
                                            What happens next
                                        </p>
                                        <ul className="space-y-1.5">
                                            {[
                                                'A league manager assigns you to a match',
                                                'You get access to the live referee console',
                                                'Log goals, cards and events in real-time',
                                            ].map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-start gap-2 text-xs text-yellow-800"
                                                >
                                                    <span className="mt-0.5 font-black text-yellow-500">
                                                        {i + 1}.
                                                    </span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Button
                                        fullWidth
                                        size="lg"
                                        onClick={() => {
                                            window.location.href = '/league/referee';
                                        }}
                                        className="h-14 border-0 bg-orange-500 text-sm font-bold tracking-widest text-white hover:bg-orange-600"
                                    >
                                        GO TO MY DASHBOARD
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
                    Propelling Talent Forward • PLYAZ
                </p>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────
// Role Card component
// ─────────────────────────────────────────

function RoleCard({
    icon,
    label,
    description,
    onClick,
    accent,
}: {
    icon: string;
    label: string;
    description: string;
    onClick: () => void;
    accent: 'orange' | 'blue' | 'yellow';
}) {
    const bgMap = { orange: 'bg-orange-50', blue: 'bg-blue-50', yellow: 'bg-yellow-50' };
    const borderMap = {
        orange: 'hover:border-orange-300',
        blue: 'hover:border-blue-300',
        yellow: 'hover:border-yellow-300',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-4 rounded-2xl border-2 border-gray-100 p-4 ${borderMap[accent]} bg-white hover:${bgMap[accent]} group text-left transition-all active:scale-[0.98]`}
        >
            <div
                className={`h-11 w-11 rounded-xl ${bgMap[accent]} flex flex-shrink-0 items-center justify-center text-xl`}
            >
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm font-black leading-tight text-gray-900">{label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-gray-400">{description}</p>
            </div>
            <span className="text-lg text-gray-300 transition-colors group-hover:text-orange-400">
                →
            </span>
        </button>
    );
}
