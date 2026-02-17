'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Input,
    Select,
    PageHeader,
} from '@/components/plyaz';
import { PageLayout } from '@/components/plyaz/navigation/PageLayout';
import { adminNavItems } from '@/lib/constants/navigation';
import { useToast } from '@/components/providers';
import { useChampionshipConfig, useUpsertChampionshipConfig } from '@/lib/hooks';

const FORMAT_OPTIONS = [
    { value: 'round_robin', label: 'Round Robin (League)' },
    { value: 'knockout', label: 'Knockout (Cup)' },
    { value: 'group_knockout', label: 'Group Stage + Knockout' },
];

export default function ChampionshipConfigPage() {
    const { id: competitionId } = useParams<{ id: string }>();
    const toast = useToast();
    const { data: existingConfig, isLoading } = useChampionshipConfig(competitionId);
    const upsertConfig = useUpsertChampionshipConfig();

    const [config, setConfig] = useState({
        format: 'round_robin' as 'round_robin' | 'knockout' | 'group_knockout',
        groups_count: 2,
        teams_per_group: 4,
        advance_count: 2,
        has_gold_final: true,
        has_silver_final: false,
        has_third_place: false,
        points_win: 3,
        points_draw: 1,
        points_loss: 0,
        match_duration_minutes: 90,
        half_time_minutes: 15,
        has_extra_time: false,
        extra_time_minutes: 30,
        has_penalties: true,
        max_substitutions: 5,
    });

    useEffect(() => {
        if (existingConfig && typeof existingConfig === 'object' && 'format' in existingConfig) {
            const c = existingConfig as Record<string, unknown>;
            setConfig({
                format: (c.format as typeof config.format) || 'round_robin',
                groups_count: (c.groups_count as number) || 2,
                teams_per_group: (c.teams_per_group as number) || 4,
                advance_count: (c.advance_count as number) || 2,
                has_gold_final: (c.has_gold_final as boolean) ?? true,
                has_silver_final: (c.has_silver_final as boolean) ?? false,
                has_third_place: (c.has_third_place as boolean) ?? false,
                points_win: (c.points_win as number) ?? 3,
                points_draw: (c.points_draw as number) ?? 1,
                points_loss: (c.points_loss as number) ?? 0,
                match_duration_minutes: (c.match_duration_minutes as number) || 90,
                half_time_minutes: (c.half_time_minutes as number) || 15,
                has_extra_time: (c.has_extra_time as boolean) ?? false,
                extra_time_minutes: (c.extra_time_minutes as number) || 30,
                has_penalties: (c.has_penalties as boolean) ?? true,
                max_substitutions: (c.max_substitutions as number) ?? 5,
            });
        }
    }, [existingConfig]);

    const handleSave = async () => {
        try {
            await upsertConfig.mutateAsync({ competitionId, ...config });
            toast.success('Championship configuration saved');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to save configuration');
        }
    };

    const showGroupSettings = config.format === 'group_knockout';
    const showKnockoutSettings = config.format === 'knockout' || config.format === 'group_knockout';
    const showPointsSettings = config.format === 'round_robin' || config.format === 'group_knockout';

    if (isLoading) {
        return (
            <PageLayout navItems={adminNavItems} title="Championship Config">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-100 rounded w-1/3" />
                    <div className="h-64 bg-gray-100 rounded" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout navItems={adminNavItems} title="Championship Config">
            <div className="space-y-6 max-w-2xl">
                <PageHeader
                    label="Configuration"
                    title="Championship Rules"
                    description="Configure the format and rules for this competition"
                />

                {/* Format Selection */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <Card elevated>
                        <CardContent className="p-5 md:p-6">
                            <h2 className="text-sm font-bold mb-4">Tournament Format</h2>
                            <Select
                                label="Format"
                                options={FORMAT_OPTIONS}
                                value={config.format}
                                onChange={(e) => setConfig({ ...config, format: e.target.value as typeof config.format })}
                            />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Group Settings */}
                {showGroupSettings && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card elevated>
                            <CardContent className="p-5 md:p-6">
                                <h2 className="text-sm font-bold mb-4">Group Stage Settings</h2>
                                <div className="grid grid-cols-3 gap-3">
                                    <Input
                                        label="Groups"
                                        type="number"
                                        value={config.groups_count.toString()}
                                        onChange={(e) => setConfig({ ...config, groups_count: parseInt(e.target.value) || 1 })}
                                    />
                                    <Input
                                        label="Teams/Group"
                                        type="number"
                                        value={config.teams_per_group.toString()}
                                        onChange={(e) => setConfig({ ...config, teams_per_group: parseInt(e.target.value) || 2 })}
                                    />
                                    <Input
                                        label="Advance"
                                        type="number"
                                        value={config.advance_count.toString()}
                                        onChange={(e) => setConfig({ ...config, advance_count: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Points System */}
                {showPointsSettings && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Card elevated>
                            <CardContent className="p-5 md:p-6">
                                <h2 className="text-sm font-bold mb-4">Points System</h2>
                                <div className="grid grid-cols-3 gap-3">
                                    <Input
                                        label="Win"
                                        type="number"
                                        value={config.points_win.toString()}
                                        onChange={(e) => setConfig({ ...config, points_win: parseInt(e.target.value) || 0 })}
                                    />
                                    <Input
                                        label="Draw"
                                        type="number"
                                        value={config.points_draw.toString()}
                                        onChange={(e) => setConfig({ ...config, points_draw: parseInt(e.target.value) || 0 })}
                                    />
                                    <Input
                                        label="Loss"
                                        type="number"
                                        value={config.points_loss.toString()}
                                        onChange={(e) => setConfig({ ...config, points_loss: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Finals Configuration */}
                {showKnockoutSettings && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card elevated>
                            <CardContent className="p-5 md:p-6">
                                <h2 className="text-sm font-bold mb-4">Finals</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.has_gold_final}
                                            onChange={(e) => setConfig({ ...config, has_gold_final: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                        <span className="text-sm">Gold Final (Championship Match)</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.has_silver_final}
                                            onChange={(e) => setConfig({ ...config, has_silver_final: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                        <span className="text-sm">Silver Final (Consolation Final)</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.has_third_place}
                                            onChange={(e) => setConfig({ ...config, has_third_place: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                        <span className="text-sm">Third Place Playoff</span>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Match Rules */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Card elevated>
                        <CardContent className="p-5 md:p-6">
                            <h2 className="text-sm font-bold mb-4">Match Rules</h2>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <Input
                                    label="Duration (min)"
                                    type="number"
                                    value={config.match_duration_minutes.toString()}
                                    onChange={(e) => setConfig({ ...config, match_duration_minutes: parseInt(e.target.value) || 90 })}
                                />
                                <Input
                                    label="Half Time (min)"
                                    type="number"
                                    value={config.half_time_minutes.toString()}
                                    onChange={(e) => setConfig({ ...config, half_time_minutes: parseInt(e.target.value) || 15 })}
                                />
                                <Input
                                    label="Max Substitutions"
                                    type="number"
                                    value={config.max_substitutions.toString()}
                                    onChange={(e) => setConfig({ ...config, max_substitutions: parseInt(e.target.value) || 5 })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.has_extra_time}
                                        onChange={(e) => setConfig({ ...config, has_extra_time: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300"
                                    />
                                    <span className="text-sm">Extra Time Enabled</span>
                                </label>
                                {config.has_extra_time && (
                                    <Input
                                        label="Extra Time (min)"
                                        type="number"
                                        value={config.extra_time_minutes.toString()}
                                        onChange={(e) => setConfig({ ...config, extra_time_minutes: parseInt(e.target.value) || 30 })}
                                    />
                                )}
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.has_penalties}
                                        onChange={(e) => setConfig({ ...config, has_penalties: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300"
                                    />
                                    <span className="text-sm">Penalty Shootout</span>
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Save */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={upsertConfig.isPending}
                        isLoading={upsertConfig.isPending}
                        className="h-12 px-8"
                    >
                        Save Configuration
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
}
