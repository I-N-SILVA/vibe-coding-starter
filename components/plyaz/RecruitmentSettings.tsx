'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input, Select } from '@/components/plyaz';
import { useToast } from '@/components/providers/ToastProvider';

interface RecruitmentSettingsProps {
    type: 'team' | 'competition';
    id: string;
    initialData: {
        is_recruiting: boolean;
        recruitment_message: string | null;
        needed_positions?: string[];
    };
}

export function RecruitmentSettings({ type, id, initialData }: RecruitmentSettingsProps) {
    const toast = useToast();
    const [isRecruiting, setIsRecruiting] = useState(initialData.is_recruiting);
    const [message, setMessage] = useState(initialData.recruitment_message || '');
    const [positions, setPositions] = useState<string[]>(initialData.needed_positions || []);
    const [isSaving, setIsSaving] = useState(false);

    const availablePositions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'];

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const endpoint = type === 'team'
                ? `/api/league/teams/${id}`
                : `/api/league/competitions/${id}`;

            const payload = type === 'team' ? {
                is_recruiting_players: isRecruiting,
                recruitment_message: message,
                needed_positions: positions
            } : {
                is_recruiting_referees: isRecruiting,
                recruitment_message: message
            };

            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update settings');
            }

            toast.success('Recruitment settings updated!');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const togglePosition = (pos: string) => {
        setPositions(prev =>
            prev.includes(pos)
                ? prev.filter(p => p !== pos)
                : [...prev, pos]
        );
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-black text-primary-main">Recruitment Settings</h3>
                        <p className="text-xs text-secondary-main/50">
                            {type === 'team'
                                ? 'Is your team looking for new players?'
                                : 'Are you looking for referees for this competition?'}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsRecruiting(!isRecruiting)}
                            className={`
                                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                                ${isRecruiting ? 'bg-orange-500' : 'bg-gray-200'}
                            `}
                        >
                            <span
                                className={`
                                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                    ${isRecruiting ? 'translate-x-6' : 'translate-x-1'}
                                `}
                            />
                        </button>
                        <span className="text-sm font-bold text-gray-900">
                            {isRecruiting ? 'Recruiting Active' : 'Recruiting Disabled'}
                        </span>
                    </div>

                    {isRecruiting && (
                        <>
                            <Input
                                label="Recruitment Message"
                                placeholder={type === 'team' ? "e.g., Looking for dedicated players for the new season!" : "e.g., Looking for experienced referees for the finals."}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />

                            {type === 'team' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-secondary-main/40">
                                        Needed Positions
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {availablePositions.map(pos => (
                                            <button
                                                key={pos}
                                                onClick={() => togglePosition(pos)}
                                                className={`
                                                    px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all
                                                    ${positions.includes(pos)
                                                        ? 'bg-primary-main text-white shadow-lg shadow-primary-main/20 scale-105'
                                                        : 'bg-secondary-main/5 text-secondary-main/40 hover:bg-secondary-main/10'}
                                                `}
                                            >
                                                {pos}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <Button
                        fullWidth
                        onClick={handleSave}
                        isLoading={isSaving}
                        className="mt-4"
                    >
                        Save Settings
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
