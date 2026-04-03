'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    ThemeToggle,
} from '@/components/plyaz';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const { updatePassword } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [form, setForm] = useState({
        password: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (form.password !== form.confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        if (form.password.length < 6) {
            setMessage('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        setMessage('');

        const { error } = await updatePassword(form.password);
        
        if (error) {
            setMessage(error);
            setIsLoading(false);
        } else {
            setIsConfirmed(true);
            setIsLoading(false);
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-neutral-950" data-testid="update-password-page">
            {/* Left side - Branding panel */}
            <div className="hidden lg:flex lg:w-[45%] relative bg-neutral-900 dark:bg-neutral-900 items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '24px 24px',
                    }}
                />
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
                            Update your{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">security.</span>
                        </h2>

                        <p className="text-sm text-white/40 leading-relaxed mb-12">
                            Secure your account with a strong password to continue managing your leagues with precision.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex flex-col">
                <header className="px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 w-fit group">
                        <Image
                            src="/static/branding/logo-circle.png"
                            alt="Plyaz"
                            width={28}
                            height={28}
                            className="group-hover:scale-110 transition-transform"
                        />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-white lg:hidden">PLYAZ</span>
                    </Link>
                    <ThemeToggle />
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
                                    data-testid="success-message"
                                >
                                    <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-black mb-4 text-neutral-900 dark:text-white">Password Updated!</h2>
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8 leading-relaxed">
                                        Your password has been successfully updated. Redirecting you to login...
                                    </p>
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        onClick={() => window.location.href = '/'}
                                        className="h-12 font-semibold tracking-wider text-[11px] uppercase"
                                    >
                                        Go to Dashboard
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="text-center mb-8">
                                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
                                            Update Password
                                        </h1>
                                        <p className="text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mt-2">
                                            Enter your new password
                                        </p>
                                    </div>

                                    <Card elevated className="border-0 bg-white dark:bg-neutral-800/50 shadow-xl shadow-black/5 dark:shadow-black/20 rounded-2xl">
                                        <CardContent className="p-6 md:p-8">
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <Input
                                                    label="New Password"
                                                    type="password"
                                                    placeholder="Min 6 characters"
                                                    value={form.password}
                                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                                    required
                                                />

                                                <Input
                                                    label="Confirm New Password"
                                                    type="password"
                                                    placeholder="Re-enter password"
                                                    value={form.confirmPassword}
                                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                                    required
                                                />

                                                {message && (
                                                    <p className="text-sm text-center py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                                                        {message}
                                                    </p>
                                                )}

                                                <Button
                                                    type="submit"
                                                    fullWidth
                                                    isLoading={isLoading}
                                                    className="h-12 text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 rounded-xl"
                                                >
                                                    Update Password
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
