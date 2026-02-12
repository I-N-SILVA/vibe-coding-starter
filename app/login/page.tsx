'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { motion } from 'framer-motion';
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
    const router = useRouter();
    const { signIn, signUp, user, isLoading: authLoading } = useAuth();
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
        fullName: '',
        confirmPassword: '',
        role: 'organizer' as any,
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user && !authLoading) {
            router.push('/league');
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
                setMessage('Registration successful! Please check your email for a confirmation link.');
                setIsLoading(false);
            }
        } else if (mode === 'login') {
            const { error } = await signIn(form.email, form.password);
            if (error) {
                setMessage(error);
                setIsLoading(false);
            } else {
                // AuthProvider will handle the redirect via the useEffect above
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
                                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        />
                                    </>
                                )}

                                {message && (
                                    <p className={`text-sm text-center py-2 px-3 rounded-lg ${message.includes('sent') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {message}
                                    </p>
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
            </div>
        </div>
    );
}
