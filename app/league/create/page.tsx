'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Input,
    Select,
    Badge,
} from '@/components/plyaz';
import { useAuth } from '@/lib/auth/AuthProvider';

const STEPS = [
    { id: 1, label: 'Basics', icon: '📋' },
    { id: 2, label: 'Format', icon: '⚙️' },
    { id: 3, label: 'Schedule', icon: '📅' },
    { id: 4, label: 'Review', icon: '✅' },
];

const FORMATS = [
    { value: 'league', label: 'League', desc: 'Round-robin — every team plays each other', icon: '🏆' },
    { value: 'knockout', label: 'Knockout', desc: 'Single elimination bracket', icon: '⚡' },
    { value: 'group_knockout', label: 'Group + Knockout', desc: 'Group stage into knockout rounds', icon: '🌟' },
];

export default function CreateLeaguePage() {
    const router = useRouter();
    const { profile } = useAuth();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        type: 'league',
        season: '2025/26',
        max_teams: 12,
        start_date: '',
        end_date: '',
        venue: '',
        rules: {
            points_win: 3,
            points_draw: 1,
            points_loss: 0,
            legs: 2,
        },
    });

    const update = (field: string, value: string | number | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const updateRules = (field: string, value: string | number | boolean) => {
        setForm((prev) => ({ ...prev, rules: { ...prev.rules, [field]: value } }));
    };

    const handleSubmit = async () => {
        if (!profile?.organization_id && !process.env.NEXT_PUBLIC_DEMO_MODE) {
            console.error('No organization found for current user');
            return;
        }

        setIsSubmitting(true);
        try {
            // Destructure to remove fields that don't belong in the top-level schema
            const { venue, ...formData } = form;

            const payload = {
                ...formData,
                organization_id: profile?.organization_id || 'demo-org-001',
                status: 'active',
                settings: {
                    venue: form.venue,
                    legs: form.rules.legs
                }
            };

            const res = await fetch('/api/league/competitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                router.push('/league');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceed = () => {
        if (step === 1) return form.name.length > 2;
        if (step === 2) return !!form.type;
        if (step === 3) return true;
        return true;
    };

    return (
        <div className="min-h-screen bg-primary-main/2 px-4 py-8 md:py-16">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-primary-main">Create a League</h1>
                    <p className="text-xs tracking-widest uppercase text-secondary-main/30 mt-2">Step {step} of 4</p>
                </motion.div>

                {/* Progress */}
                <div className="flex items-center justify-between mb-10 px-2">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s.id}>
                            <button
                                onClick={() => s.id < step && setStep(s.id)}
                                className={`flex flex-col items-center gap-1.5 transition-all ${s.id <= step ? 'opacity-100' : 'opacity-30'}`}
                            >
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg
                                    ${s.id === step ? 'bg-accent-main text-white scale-110' : s.id < step ? 'bg-primary-main text-white' : 'bg-secondary-main/5 text-secondary-main/20'}`}>
                                    {s.id < step ? '✓' : s.icon}
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-secondary-main/40">{s.label}</span>
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 md:mx-2 ${s.id < step ? 'bg-primary-main' : 'bg-secondary-main/10'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Steps */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card elevated>
                            <CardContent className="p-6 md:p-8">
                                {step === 1 && (
                                    <div className="space-y-5">
                                        <h2 className="text-lg font-bold mb-1 text-primary-main">League Details</h2>
                                        <p className="text-xs text-secondary-main/30 mb-4">Give your league a name and description.</p>
                                        <Input
                                            label="League Name"
                                            placeholder="e.g., Sunday Premier Division"
                                            value={form.name}
                                            onChange={(e) => update('name', e.target.value)}
                                            required
                                        />
                                        <Input
                                            label="Description (optional)"
                                            placeholder="What's this league about?"
                                            value={form.description}
                                            onChange={(e) => update('description', e.target.value)}
                                        />
                                        <Input
                                            label="Season"
                                            placeholder="e.g., 2025/26"
                                            value={form.season}
                                            onChange={(e) => update('season', e.target.value)}
                                        />
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-5">
                                        <h2 className="text-lg font-bold mb-1 text-primary-main">Competition Format</h2>
                                        <p className="text-xs text-secondary-main/30 mb-4">Choose how your league is structured.</p>
                                        <div className="space-y-3">
                                            {FORMATS.map((f) => (
                                                <button
                                                    key={f.value}
                                                    onClick={() => update('type', f.value)}
                                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${form.type === f.value ? 'border-accent-main bg-accent-main/5' : 'border-secondary-main/5 hover:border-secondary-main/10'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{f.icon}</span>
                                                        <div>
                                                            <p className="font-bold text-sm text-primary-main">{f.label}</p>
                                                            <p className="text-xs text-secondary-main/30">{f.desc}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="pt-2">
                                            <Input
                                                label="Maximum Teams"
                                                type="number"
                                                value={String(form.max_teams)}
                                                onChange={(e) => update('max_teams', parseInt(e.target.value) || 8)}
                                            />
                                        </div>

                                        <AnimatePresence>
                                            {(form.type === 'league' || form.type === 'group_knockout') && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="grid grid-cols-3 gap-3 pt-2 overflow-hidden"
                                                >
                                                    <Input
                                                        label="Win Points"
                                                        type="number"
                                                        value={String(form.rules.points_win)}
                                                        onChange={(e) => updateRules('points_win', parseInt(e.target.value) || 3)}
                                                    />
                                                    <Input
                                                        label="Draw Points"
                                                        type="number"
                                                        value={String(form.rules.points_draw)}
                                                        onChange={(e) => updateRules('points_draw', parseInt(e.target.value) || 1)}
                                                    />
                                                    <Input
                                                        label="Loss Points"
                                                        type="number"
                                                        value={String(form.rules.points_loss)}
                                                        onChange={(e) => updateRules('points_loss', parseInt(e.target.value) || 0)}
                                                    />
                                                </motion.div>
                                            )}

                                            {form.type === 'knockout' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="p-4 rounded-xl bg-secondary-main/2 overflow-hidden"
                                                >
                                                    <p className="text-[10px] font-bold tracking-widest uppercase text-secondary-main/30 mb-2">Tournament Rules</p>
                                                    <div className="flex items-center gap-2 text-xs text-secondary-main/40">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-accent-main" />
                                                        Points are disabled for single-elimination formats.
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-5">
                                        <h2 className="text-lg font-bold mb-1 text-primary-main">Schedule</h2>
                                        <p className="text-xs text-secondary-main/30 mb-4">Set the dates and venue for your league.</p>
                                        <Input
                                            label="Start Date"
                                            type="date"
                                            value={form.start_date}
                                            onChange={(e) => update('start_date', e.target.value)}
                                        />
                                        <Input
                                            label="End Date"
                                            type="date"
                                            value={form.end_date}
                                            onChange={(e) => update('end_date', e.target.value)}
                                        />
                                        <Input
                                            label="Default Venue"
                                            placeholder="e.g., Community Sports Centre"
                                            value={form.venue}
                                            onChange={(e) => update('venue', e.target.value)}
                                        />
                                        <Select
                                            label="Legs"
                                            options={[
                                                { value: '1', label: 'Single (1 game each)' },
                                                { value: '2', label: 'Double (Home & Away)' },
                                            ]}
                                            value={String(form.rules.legs)}
                                            onChange={(e) => updateRules('legs', parseInt(e.target.value))}
                                        />
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-6">
                                        <h2 className="text-lg font-bold mb-1 text-primary-main">Review & Create</h2>
                                        <p className="text-xs text-secondary-main/30 mb-4">Confirm your league details.</p>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-3 border-b border-secondary-main/5">
                                                <span className="text-xs font-bold tracking-widest uppercase text-secondary-main/30">Name</span>
                                                <span className="font-bold text-primary-main">{form.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-secondary-main/5">
                                                <span className="text-xs font-bold tracking-widest uppercase text-secondary-main/30">Format</span>
                                                <Badge variant="secondary" className="border-secondary-main/10 text-secondary-main/40">{FORMATS.find(f => f.value === form.type)?.label}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-secondary-main/5">
                                                <span className="text-xs font-bold tracking-widest uppercase text-secondary-main/30">Max Teams</span>
                                                <span className="font-bold text-primary-main">{form.max_teams}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-secondary-main/5">
                                                <span className="text-xs font-bold tracking-widest uppercase text-secondary-main/30">Season</span>
                                                <span className="font-bold text-primary-main">{form.season || 'TBD'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-secondary-main/5">
                                                <span className="text-xs font-bold tracking-widest uppercase text-secondary-main/30">Dates</span>
                                                <span className="text-sm text-primary-main">{form.start_date || 'TBD'} → {form.end_date || 'TBD'}</span>
                                            </div>
                                            {(form.type === 'league' || form.type === 'group_knockout') && (
                                                <div className="flex justify-between items-center py-3">
                                                    <span className="text-xs font-bold tracking-widest uppercase text-secondary-main/30">Points</span>
                                                    <span className="text-sm text-primary-main">W:{form.rules.points_win} D:{form.rules.points_draw} L:{form.rules.points_loss}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-6 gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                        className="flex-1 h-12 border-secondary-main/10 text-secondary-main/40"
                    >
                        {step > 1 ? '← Back' : 'Cancel'}
                    </Button>

                    {step < 4 ? (
                        <Button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                            className="flex-1 h-12"
                        >
                            Next →
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 h-12 bg-accent-main hover:bg-accent-dark border-none shadow-lg shadow-accent-main/10"
                        >
                            {isSubmitting ? 'Creating...' : '🚀 Create League'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
