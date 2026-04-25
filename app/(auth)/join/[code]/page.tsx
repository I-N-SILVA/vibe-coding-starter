"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Users } from 'lucide-react';

type PageState =
    | { phase: 'loading' }
    | { phase: 'preview'; orgId: string; orgName: string; orgLogo: string | null; slug: string }
    | { phase: 'joining' }
    | { phase: 'success'; orgName: string }
    | { phase: 'error'; title: string; message: string };

export default function JoinByCodePage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [state, setState] = useState<PageState>({ phase: 'loading' });

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            router.push(`/login?redirect=/join/${code}`);
            return;
        }

        const lookup = async () => {
            try {
                const res = await fetch(`/api/league/invites/join?code=${encodeURIComponent(code)}`);
                const data = await res.json();

                if (!res.ok) {
                    setState({ phase: 'error', title: 'Not found', message: data.error || 'No organisation matches this join code.' });
                    return;
                }

                setState({
                    phase: 'preview',
                    orgId: data.id,
                    orgName: data.name,
                    orgLogo: data.logo_url,
                    slug: data.slug,
                });
            } catch {
                setState({ phase: 'error', title: 'Something went wrong', message: 'Could not load this join link. Please try again.' });
            }
        };

        lookup();
    }, [code, router, isAuthenticated, authLoading]);

    const handleJoin = async () => {
        if (state.phase !== 'preview') return;
        const { orgName } = state;
        setState({ phase: 'joining' });

        try {
            const res = await fetch('/api/league/invites/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });
            const data = await res.json();

            if (!res.ok) {
                setState({ phase: 'error', title: 'Could not join', message: data.error || 'Something went wrong.' });
                return;
            }

            queryClient.invalidateQueries({ queryKey: ['organization'] });
            router.refresh();
            setState({ phase: 'success', orgName: data.organization_name ?? orgName });
            setTimeout(() => router.push('/league'), 2500);
        } catch {
            setState({ phase: 'error', title: 'Something went wrong', message: 'Please try again.' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
                {(state.phase === 'loading' || state.phase === 'joining') && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex flex-col items-center gap-4 text-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center shadow-xl">
                            <Loader2 className="w-7 h-7 text-white animate-spin" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                                {state.phase === 'joining' ? 'Sending join request...' : 'Loading organisation...'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">Just a moment</p>
                        </div>
                    </motion.div>
                )}

                {state.phase === 'preview' && (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="w-full max-w-md"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="bg-gray-900 dark:bg-gray-950 px-8 py-8 text-center">
                                {state.orgLogo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={state.orgLogo}
                                        alt={state.orgName}
                                        className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white shadow-lg">
                                        {state.orgName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-1">Open Join Link</p>
                                <h2 className="text-xl font-black text-white leading-tight">Join {state.orgName}</h2>
                            </div>

                            <div className="px-8 py-8">
                                <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4 mb-6">
                                    <Users className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Permanent join link</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Your request will be sent to {state.orgName} for approval. This link never expires.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleJoin}
                                    className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.98] transition-all text-white font-bold py-4 rounded-2xl text-sm tracking-wide"
                                >
                                    Request to Join
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full mt-3 text-xs font-semibold text-gray-400 hover:text-gray-600 py-2 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {state.phase === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 text-center max-w-sm"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-xl">
                            <CheckCircle className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Request sent!</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {state.orgName} will review your request. Taking you to the dashboard...
                            </p>
                        </div>
                    </motion.div>
                )}

                {state.phase === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="w-full max-w-md"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="bg-gray-900 dark:bg-gray-950 px-8 py-8 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-8 h-8 text-red-400" />
                                </div>
                                <h2 className="text-xl font-black text-white">{state.title}</h2>
                            </div>
                            <div className="px-8 py-8 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{state.message}</p>
                                <button
                                    onClick={() => router.push('/')}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to home
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
