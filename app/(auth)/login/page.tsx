'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
    Card,
    CardContent,
    Button,
    Input,
    NavIcons,
} from '@/components/plyaz';

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const router = useRouter();
    const { signIn, signUp, forgotPassword, user, profile, isLoading: authLoading } = useAuth();
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
    });
    const [message, setMessage] = useState('');
    const [envCheck, setEnvCheck] = useState({ hasUrl: true, hasKey: true });

    useEffect(() => {
        const inviteToken = searchParams.get('invite_token');
        if (inviteToken) {
            const verifyInvite = async () => {
                const response = await fetch('/api/league/invites/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: inviteToken }),
                });
                if (response.ok) {
                    const { email } = await response.json();
                    setForm(prev => ({ ...prev, email }));
                    setMode('signup');
                } else {
                    setMessage('Invalid or expired invite token.');
                }
            };
            verifyInvite();
        }
    }, [searchParams]);

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
            if (profile?.organization_id) {
                router.push('/league');
            } else {
                router.push('/onboarding');
            }
        }
    }, [user, authLoading, router, profile?.organization_id]);

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
            const inviteToken = searchParams.get('invite_token') || undefined;
            const { error } = await signUp(form.email, form.password, form.fullName, 'organizer', inviteToken);
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
            }
        } else if (mode === 'forgot') {
            const { error } = await forgotPassword(form.email);
            if (error) {
                setMessage(error);
            } else {
                setMessage('Password reset link sent to your email.');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-neutral-950" data-testid="login-page">
            {/* Left side - Branding panel */}
            <div className="hidden lg:flex lg:w-[45%] relative bg-neutral-900 dark:bg-neutral-900 items-center justify-center overflow-hidden">
                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '24px 24px',
                    }}
                />
                {/* Gradient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/5 blur-3xl" />

                <div className="relative z-10 px-16 max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                <NavIcons.Trophy className="text-neutral-900 w-5 h-5" />
                            </div>
                            <span className="text-lg font-black tracking-[0.2em] text-white">PLYAZ</span>
                        </div>

                        <h2 className="text-3xl font-black text-white tracking-tight leading-tight mb-4">
                            Manage leagues with{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">precision.</span>
                        </h2>

                        <p className="text-sm text-white/40 leading-relaxed mb-12">
                            Professional-grade tournament management, live score tracking, and real-time statistics for leagues of all sizes.
                        </p>

                        <div className="space-y-4">
                            {[
                                'Real-time match tracking',
                                'Automated fixture generation',
                                'Player statistics & analytics',
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    </div>
                                    <span className="text-xs text-white/50 font-medium">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex flex-col">
                <header className="px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 w-fit group" data-testid="login-logo-link">
                        <Image
                            src="/static/branding/logo-circle.png"
                            alt="Plyaz"
                            width={28}
                            height={28}
                            className="group-hover:scale-110 transition-transform"
                        />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-white lg:hidden">PLYAZ</span>
                    </Link>
                </header>

                <div className="flex-1 flex items-center justify-center px-6 pb-12">
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
                                    data-testid="confirmation-message"
                                >
                                    <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-black mb-4 text-neutral-900 dark:text-white">Check Your Email</h2>
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8 leading-relaxed">
                                        We&apos;ve sent a confirmation link to <span className="font-bold text-neutral-900 dark:text-white">{form.email}</span>.
                                        Please verify your account to proceed.
                                    </p>
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        onClick={() => setIsConfirmed(false)}
                                        data-testid="back-to-login-btn"
                                        className="h-12 font-semibold tracking-wider text-[11px] uppercase"
                                    >
                                        Back to Login
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="text-center mb-8">
                                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900 dark:text-white" data-testid="login-heading">
                                            {mode === 'login' && 'Welcome Back'}
                                            {mode === 'signup' && 'Create Account'}
                                            {mode === 'forgot' && 'Reset Password'}
                                        </h1>
                                        <p className="text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mt-2">
                                            {mode === 'login' && 'Sign in to manage your league'}
                                            {mode === 'signup' && 'Create your league and start managing'}
                                            {mode === 'forgot' && 'We\'ll send you a reset link'}
                                        </p>
                                    </div>

                                    <Card elevated className="border-0 bg-white dark:bg-neutral-800/50 shadow-xl shadow-black/5 dark:shadow-black/20 rounded-2xl">
                                        <CardContent className="p-6 md:p-8">
                                            <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
                                                {mode === 'signup' && (
                                                    <Input
                                                        label="Full Name"
                                                        placeholder="e.g., James Smith"
                                                        value={form.fullName}
                                                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                                        required
                                                        data-testid="fullname-input"
                                                    />
                                                )}

                                                <Input
                                                    label="Email"
                                                    type="email"
                                                    placeholder="you@email.com"
                                                    value={form.email}
                                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                    required
                                                    data-testid="email-input"
                                                />

                                                {mode !== 'forgot' && (
                                                    <Input
                                                        label="Password"
                                                        type="password"
                                                        placeholder="Min 6 characters"
                                                        value={form.password}
                                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                                        required
                                                        data-testid="password-input"
                                                    />
                                                )}

                                                {mode === 'signup' && (
                                                    <Input
                                                        label="Confirm Password"
                                                        type="password"
                                                        placeholder="Re-enter password"
                                                        value={form.confirmPassword}
                                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                                        required
                                                        data-testid="confirm-password-input"
                                                    />
                                                )}

                                                {message && (
                                                    <p className={`text-sm text-center py-2.5 px-4 rounded-xl ${message.includes('successful') || message.includes('sent') ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`} data-testid="auth-message">
                                                        {message}
                                                    </p>
                                                )}

                                                {(!envCheck.hasUrl || !envCheck.hasKey) && (
                                                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-4 text-xs text-red-600 dark:text-red-400" data-testid="config-error">
                                                        <p className="font-bold mb-1">Configuration Error</p>
                                                        <p>Supabase environment variables are missing. Please add <strong>NEXT_PUBLIC_SUPABASE_URL</strong> and <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> to your project settings.</p>
                                                    </div>
                                                )}

                                                <Button
                                                    type="submit"
                                                    fullWidth
                                                    isLoading={isLoading}
                                                    data-testid="login-form-submit-button"
                                                    className="h-12 text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 rounded-xl"
                                                >
                                                    {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                                                </Button>

                                                {mode === 'login' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setMode('forgot')}
                                                        className="w-full text-center text-xs text-neutral-400 dark:text-neutral-500 hover:text-orange-500 transition-colors py-1"
                                                        data-testid="forgot-password-link"
                                                    >
                                                        Forgot your password?
                                                    </button>
                                                )}
                                            </form>
                                        </CardContent>
                                    </Card>

                                    <div className="text-center mt-6">
                                        {mode === 'login' ? (
                                            <p className="text-sm text-neutral-400 dark:text-neutral-500">
                                                Don&apos;t have an account?{' '}
                                                <button onClick={() => setMode('signup')} className="font-bold text-neutral-900 dark:text-white hover:text-orange-500 transition-colors" data-testid="switch-to-signup">
                                                    Sign Up
                                                </button>
                                            </p>
                                        ) : (
                                            <p className="text-sm text-neutral-400 dark:text-neutral-500">
                                                Already have an account?{' '}
                                                <button onClick={() => setMode('login')} className="font-bold text-neutral-900 dark:text-white hover:text-orange-500 transition-colors" data-testid="switch-to-login">
                                                    Sign In
                                                </button>
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
