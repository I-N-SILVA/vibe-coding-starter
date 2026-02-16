'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Input,
    Badge,
} from '@/components/plyaz';

export default function JoinTeamPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inviteCode = searchParams?.get('code') || '';

    const [step, setStep] = useState<'join' | 'create' | 'success'>('join');
    const [isLoading, setIsLoading] = useState(false);
    const [joinCode, setJoinCode] = useState(inviteCode);
    const [newTeam, setNewTeam] = useState({
        name: '',
        short_name: '',
        primary_color: '#1a1a2e',
        secondary_color: '#e94560',
    });
    const [result, setResult] = useState<{ name?: string; code?: string; invite_code?: string } | null>(null);

    const handleJoinTeam = async () => {
        setIsLoading(true);
        // In production, this would validate the invite code against the API
        setTimeout(() => {
            setResult({ name: 'Demo Team', code: joinCode });
            setStep('success');
            setIsLoading(false);
        }, 1000);
    };

    const handleCreateTeam = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/league/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTeam),
            });
            if (res.ok) {
                const team = await res.json();
                setResult(team);
                setStep('success');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:py-16">
            <div className="max-w-md mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">Team Registration</h1>
                    <p className="text-xs tracking-widest uppercase text-gray-400 mt-2">Join or create a team</p>
                </motion.div>

                {step === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card elevated>
                            <CardContent className="p-8 text-center">
                                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                                    <span className="text-4xl">✅</span>
                                </div>
                                <h2 className="text-xl font-bold mb-2">Team Registered!</h2>
                                <p className="text-sm text-gray-400 mb-6">
                                    {result?.name || newTeam.name} has been successfully registered.
                                </p>

                                {/* Share invite code */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">
                                        Share this code with players
                                    </p>
                                    <p className="text-2xl font-mono font-black tracking-wide text-gray-900">
                                        {result?.invite_code || 'PLZ-DEMO'}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button onClick={() => router.push('/league/teams')} className="h-12">
                                        Go to Teams
                                    </Button>
                                    <Button variant="secondary" onClick={() => router.push('/league/join/player')}>
                                        Add Players →
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <>
                        {/* Tab toggle */}
                        <div className="flex rounded-xl bg-white p-1 mb-6 border border-gray-100">
                            <button
                                onClick={() => setStep('join')}
                                className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-lg transition-all ${step === 'join' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Join Team
                            </button>
                            <button
                                onClick={() => setStep('create')}
                                className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-lg transition-all ${step === 'create' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Create Team
                            </button>
                        </div>

                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card elevated>
                                <CardContent className="p-6 md:p-8">
                                    {step === 'join' ? (
                                        <div className="space-y-5">
                                            <div>
                                                <h2 className="text-lg font-bold mb-1">Join with Invite Code</h2>
                                                <p className="text-xs text-gray-400">Enter the code shared by your team manager.</p>
                                            </div>
                                            <Input
                                                label="Invite Code"
                                                placeholder="e.g., PLZ-A1B2C3"
                                                value={joinCode}
                                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                                className="text-center font-mono text-xl tracking-widest"
                                            />
                                            <Button
                                                onClick={handleJoinTeam}
                                                disabled={joinCode.length < 4 || isLoading}
                                                className="w-full h-14"
                                            >
                                                {isLoading ? 'Joining...' : 'Join Team'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            <div>
                                                <h2 className="text-lg font-bold mb-1">Register New Team</h2>
                                                <p className="text-xs text-gray-400">Create your team and invite players.</p>
                                            </div>
                                            <Input
                                                label="Team Name"
                                                placeholder="e.g., London Lions FC"
                                                value={newTeam.name}
                                                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                                required
                                            />
                                            <Input
                                                label="Short Name (3-4 chars)"
                                                placeholder="e.g., LLN"
                                                value={newTeam.short_name}
                                                onChange={(e) => setNewTeam({ ...newTeam, short_name: e.target.value.toUpperCase().slice(0, 4) })}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Primary Color</label>
                                                    <input
                                                        type="color"
                                                        value={newTeam.primary_color}
                                                        onChange={(e) => setNewTeam({ ...newTeam, primary_color: e.target.value })}
                                                        className="w-full h-12 rounded-lg border border-gray-200 cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Secondary Color</label>
                                                    <input
                                                        type="color"
                                                        value={newTeam.secondary_color}
                                                        onChange={(e) => setNewTeam({ ...newTeam, secondary_color: e.target.value })}
                                                        className="w-full h-12 rounded-lg border border-gray-200 cursor-pointer"
                                                    />
                                                </div>
                                            </div>

                                            {/* Preview */}
                                            <div className="bg-gray-50 rounded-xl p-6 text-center">
                                                <div
                                                    className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl"
                                                    style={{ backgroundColor: newTeam.primary_color }}
                                                >
                                                    {newTeam.short_name || '??'}
                                                </div>
                                                <p className="font-bold text-sm">{newTeam.name || 'Your Team'}</p>
                                            </div>

                                            <Button
                                                onClick={handleCreateTeam}
                                                disabled={newTeam.name.length < 3 || isLoading}
                                                className="w-full h-14"
                                            >
                                                {isLoading ? 'Creating...' : 'Register Team'}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
