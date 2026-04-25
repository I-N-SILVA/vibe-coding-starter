"use client";

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ShieldCheck, Camera, Database } from 'lucide-react';

type PageState =
    | { phase: 'loading' }
    | { phase: 'form'; playerName: string; orgName: string | null; alreadyConsented: boolean }
    | { phase: 'submitting' }
    | { phase: 'success' }
    | { phase: 'error'; message: string };

export default function GuardianConsentPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [state, setState] = useState<PageState>({ phase: 'loading' });
    const [guardianName, setGuardianName] = useState('');
    const [imageRights, setImageRights] = useState(false);
    const [dataConsent, setDataConsent] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/league/consent?token=${encodeURIComponent(token)}`);
                const data = await res.json();
                if (!res.ok) {
                    setState({ phase: 'error', message: data.error ?? 'This consent link is invalid or has expired.' });
                    return;
                }
                setState({
                    phase: 'form',
                    playerName: data.player_name,
                    orgName: data.organisation_name,
                    alreadyConsented: data.already_consented,
                });
            } catch {
                setState({ phase: 'error', message: 'Could not load this page. Please try again.' });
            }
        };
        load();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageRights || !dataConsent) return;
        setState({ phase: 'submitting' });

        try {
            const res = await fetch('/api/league/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, guardian_name: guardianName, image_rights_granted: imageRights, data_consent_granted: dataConsent }),
            });
            const data = await res.json();
            if (!res.ok) {
                setState({ phase: 'error', message: data.error ?? 'Something went wrong.' });
                return;
            }
            setState({ phase: 'success' });
        } catch {
            setState({ phase: 'error', message: 'Something went wrong. Please try again.' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
                {state.phase === 'loading' && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center shadow-xl">
                            <Loader2 className="w-7 h-7 text-white animate-spin" />
                        </div>
                        <p className="font-bold text-gray-900">Loading consent form...</p>
                    </motion.div>
                )}

                {state.phase === 'submitting' && (
                    <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center shadow-xl">
                            <Loader2 className="w-7 h-7 text-white animate-spin" />
                        </div>
                        <p className="font-bold text-gray-900">Recording consent...</p>
                    </motion.div>
                )}

                {state.phase === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 text-center max-w-sm">
                        <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-xl">
                            <CheckCircle className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Consent recorded</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                Thank you. The player's registration is now complete. You can close this window.
                            </p>
                        </div>
                    </motion.div>
                )}

                {state.phase === 'error' && (
                    <motion.div key="error" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="w-full max-w-md">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gray-900 px-8 py-8 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-8 h-8 text-red-400" />
                                </div>
                                <h2 className="text-xl font-black text-white">Invalid Link</h2>
                            </div>
                            <div className="px-8 py-8 text-center">
                                <p className="text-sm text-gray-500 mb-4">{state.message}</p>
                                <p className="text-xs text-gray-400">Please ask the club to resend the consent email.</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {state.phase === 'form' && (
                    <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="w-full max-w-lg">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gray-900 px-8 py-8 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <ShieldCheck className="w-7 h-7 text-white" />
                                </div>
                                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-1">Parental Consent</p>
                                <h1 className="text-xl font-black text-white">
                                    {state.orgName ? `${state.orgName}` : 'Player Registration'}
                                </h1>
                                <p className="text-sm text-gray-400 mt-2">
                                    Consent required for <span className="text-white font-semibold">{state.playerName}</span>
                                </p>
                            </div>

                            {state.alreadyConsented ? (
                                <div className="px-8 py-8 text-center">
                                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                                    <p className="font-bold text-gray-900">Consent already granted</p>
                                    <p className="text-sm text-gray-400 mt-1">You have already provided consent for this player. You can close this window.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        As the parent or legal guardian of <strong>{state.playerName}</strong>, please review and confirm the following consents
                                        {state.orgName ? ` to participate in activities organised by ${state.orgName}` : ''}.
                                    </p>

                                    {/* Guardian name */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Your Full Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={guardianName}
                                            onChange={(e) => setGuardianName(e.target.value)}
                                            placeholder="e.g. Sarah Johnson"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Image rights */}
                                    <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${imageRights ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                                        <input type="checkbox" checked={imageRights} onChange={(e) => setImageRights(e.target.checked)} className="mt-1 w-4 h-4 accent-orange-600 flex-shrink-0" />
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Camera className="w-4 h-4 text-orange-500" />
                                                <p className="text-sm font-bold text-gray-900">Image & Video Rights</p>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed">
                                                I grant permission for photographs and videos of <strong>{state.playerName}</strong> to be used in official match coverage, social media posts, and league publications produced by {state.orgName ?? 'the organisation'}.
                                            </p>
                                        </div>
                                    </label>

                                    {/* Data consent */}
                                    <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${dataConsent ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                                        <input type="checkbox" checked={dataConsent} onChange={(e) => setDataConsent(e.target.checked)} className="mt-1 w-4 h-4 accent-orange-600 flex-shrink-0" />
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Database className="w-4 h-4 text-orange-500" />
                                                <p className="text-sm font-bold text-gray-900">Data Processing</p>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed">
                                                I consent to <strong>{state.playerName}</strong>'s personal data (name, date of birth, contact information, and match statistics) being processed by the league for administration and safeguarding purposes in accordance with GDPR and the UK Data Protection Act 2018.
                                            </p>
                                        </div>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={!imageRights || !dataConsent || !guardianName.trim()}
                                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all text-white font-bold py-4 rounded-2xl text-sm tracking-wide"
                                    >
                                        Grant Consent
                                    </button>

                                    <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                                        By submitting this form you confirm you are the legal parent or guardian of {state.playerName}. This consent is recorded with a timestamp for safeguarding compliance.
                                    </p>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
