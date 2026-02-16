'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    Card,
    CardContent,
    Button,
    Input,
    Select,
} from '@/components/plyaz';

/**
 * Login Page - PLYAZ Design System
 * Unified sign-in / sign-up / forgot password
 */

const ROLES = [
    { value: 'organizer', label: 'League Organiser' },
    { value: 'manager', label: 'Team Manager' },
    { value: 'player', label: 'Player' },
    { value: 'referee', label: 'Referee' },
    { value: 'fan', label: 'Fan / Spectator' },
];

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const router = useRouter();
    const { signIn, signUp, user, isLoading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const modeParam = searchParams.get('mode');
    const initialMode: 'login' | 'signup' | 'forgot' = (modeParam === 'login' || modeParam === 'signup' || modeParam === 'forgot') ? modeParam : 'login';
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
        fullName: '',
        confirmPassword: '',
        role: 'organizer' as 'admin' | 'organizer' | 'referee' | 'manager' | 'player' | 'fan',
    });
    const [message, setMessage] = useState('');
    const [envCheck, setEnvCheck] = useState({ hasUrl: true, hasKey: true });

    // Sync mode with URL if it changes
    useEffect(() => {
        const urlMode = searchParams.get('mode');
        if (urlMode && (urlMode === 'login' || urlMode === 'signup' || urlMode === 'forgot')) {
            setMode(urlMode as 'login' | 'signup' | 'forgot');
        }
    }, [searchParams]);

    useEffect(() => {
        const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
        const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        setEnvCheck({ hasUrl, hasKey });

        if (user && !authLoading) {
            if (user.profile?.organization_id) {
                router.push('/league');
            } else {
                router.push('/onboarding');
            }
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        if (mode === 'signup') {
            if (form.password !== form.confirmPassword) {
                setMessage('Passwords do not match');
                setIsLoading(false);
                return;
            }

            const { error } = await signUp(form.email, form.password, form.fullName, form.role);
            if (error) {
                setMessage(error);
                setIsLoading(false);
            } else {
                setIsConfirmed(true);
                setIsLoading(false);
            }
        } else if (mode === 'login') {
            const { error } = await signIn(form.email, form.password);
            if (error) {
                setMessage(error);
                setIsLoading(false);
            } else {
                // AuthProvider will handle the redirect via the useEffect
            }
        } else if (mode === 'forgot') {
            // TODO: Implement forgot password in AuthProvider
            setMessage('Forgot password is not implemented yet.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="px-4 py-4">
                <a href="/" className="flex items-center gap-2 w-fit group">
                    <Image
                        src="/static/branding/logo-circle.png"
                        alt="Plyaz"
                        width={28}
                        height={28}
                        className="group-hover:scale-110 transition-transform"
                    />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase">PLYAZ</span>
                </a>
            </header>

            {/* Form */}
            <div className="flex-1 flex items-center justify-center px-4 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm"
                >
                    <AnimatePresence mode="wait">
                        {isConfirmed ? (
                            <motion.div
                                key="confirmed"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12 px-6"
                            >
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-black mb-4">Check Your Email</h2>
                                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                    We&apos;ve sent a confirmation link to <span className="font-bold text-black">{form.email}</span>.
                                    Please verify your account to proceed.
                                </p>
                                <Button
                                    variant="secondary"
                                    fullWidth
                                    onClick={() => setIsConfirmed(false)}
                                    className="h-14 font-black tracking-widest text-[10px] uppercase"
                                >
                                    Back to Login
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="text-center mb-8">
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                        {mode === 'login' && 'Welcome Back'}
                                        {mode === 'signup' && 'Create Account'}
                                        {mode === 'forgot' && 'Reset Password'}
                                    </h1>
                                    <p className="text-xs tracking-widest uppercase text-gray-400 mt-2">
                                        {mode === 'login' && 'Sign in to manage your league'}
                                        {mode === 'signup' && 'Join PLYAZ and start your journey'}
                                        {mode === 'forgot' && 'We\'ll send you a reset link'}
                                    </p>
                                </div>

                                <Card elevated className="border-0">
                                    <CardContent className="p-6 md:p-8">
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {mode === 'signup' && (
                                                <Input
                                                    label="Full Name"
                                                    placeholder="e.g., James Smith"
                                                    value={form.fullName}
                                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                                    required
                                                />
                                            )}

                                            <Input
                                                label="Email"
                                                type="email"
                                                placeholder="you@email.com"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                required
                                            />

                                            {mode !== 'forgot' && (
                                                <Input
                                                    label="Password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={form.password}
                                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                                    required
                                                />
                                            )}

                                            {mode === 'signup' && (
                                                <>
                                                    <Input
                                                        label="Confirm Password"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={form.confirmPassword}
                                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                                        required
                                                    />
                                                    <Select
                                                        label="Your Role"
                                                        options={ROLES}
                                                        value={form.role}
                                                        onChange={(e) => setForm({ ...form, role: e.target.value as typeof form.role })}
                                                    />
                                                </>
                                            )}

                                            {message && (
                                                <p className={`text-sm text-center py-2 px-3 rounded-lg ${message.includes('successful') || message.includes('sent') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    {message}
                                                </p>
                                            )}

                                            {(!envCheck.hasUrl || !envCheck.hasKey) && (
                                                <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-xs text-red-600">
                                                    <p className="font-bold mb-1">Configuration Error</p>
                                                    <p>Supabase environment variables are missing. Please add <strong>NEXT_PUBLIC_SUPABASE_URL</strong> and <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> to your Vercel project settings.</p>
                                                </div>
                                            )}

                                            <Button
                                                type="submit"
                                                fullWidth
                                                isLoading={isLoading}
                                                className="h-14 text-base"
                                            >
                                                {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                                            </Button>

                                            {mode === 'login' && (
                                                <button
                                                    type="button"
                                                    onClick={() => setMode('forgot')}
                                                    className="w-full text-center text-xs text-gray-400 hover:text-orange-500 transition-colors py-1"
                                                >
                                                    Forgot your password?
                                                </button>
                                            )}
                                        </form>
                                    </CardContent>
                                </Card>

                                <div className="text-center mt-6">
                                    {mode === 'login' ? (
                                        <p className="text-sm text-gray-400">
                                            Don&apos;t have an account?{' '}
                                            <button onClick={() => setMode('signup')} className="font-bold text-gray-900 hover:text-orange-500 transition-colors">
                                                Sign Up
                                            </button>
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400">
                                            Already have an account?{' '}
                                            <button onClick={() => setMode('login')} className="font-bold text-gray-900 hover:text-orange-500 transition-colors">
                                                Sign In
                                            </button>
                                        </p>
                                    )}
                                </div>

                                {/* Auth Hint */}
                                <div className="mt-8 p-4 rounded-xl bg-primary-main/5 border border-primary-main/10 text-center">
                                    <p className="text-[10px] font-bold tracking-widest uppercase text-primary-main mb-1">Account Required</p>
                                    <p className="text-xs text-secondary-main/60">
                                        Sign up to create your organization and manage leagues.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
