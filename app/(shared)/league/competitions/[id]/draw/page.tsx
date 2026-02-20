'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    PageHeader,
    EmptyState,
    NavIcons,
} from '@/components/plyaz';
import { PageLayout } from '@/components/plyaz/navigation/PageLayout';
import { adminNavItems } from '@/lib/constants/navigation';
import { useToast } from '@/components/providers';
import { stagger, fadeUp } from '@/lib/animations';
import { useGroups, useCreateGroup, useExecuteDraw } from '@/lib/hooks';

type ApiGroup = {
    id: string;
    name: string;
    display_order: number;
    teams?: Array<{ id: string; name: string; seed: number | null }>;
};

export default function DrawPage() {
    const { id: competitionId } = useParams<{ id: string }>();
    const toast = useToast();
    const { data: groups = [], isLoading } = useGroups(competitionId);
    const createGroup = useCreateGroup();
    const executeDraw = useExecuteDraw();
    const [newGroupName, setNewGroupName] = useState('');

    const groupList: ApiGroup[] = Array.isArray(groups) ? (groups as unknown as ApiGroup[]) : [];

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;
        try {
            await createGroup.mutateAsync({
                competitionId,
                name: newGroupName,
                displayOrder: groupList.length,
            });
            toast.success(`${newGroupName} created`);
            setNewGroupName('');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to create group');
        }
    };

    const handleRandomDraw = async () => {
        if (groupList.length === 0) {
            toast.warning('Create groups first before running the draw');
            return;
        }
        try {
            await executeDraw.mutateAsync({ competitionId, method: 'random' });
            toast.success('Draw completed successfully');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to execute draw');
        }
    };

    return (
        <PageLayout navItems={adminNavItems} title="Draw">
            <div className="space-y-6">
                <PageHeader
                    label="Championship"
                    title="Draw & Seeding"
                    description="Assign teams to groups"
                    rightAction={
                        <Button
                            onClick={handleRandomDraw}
                            disabled={groupList.length === 0 || executeDraw.isPending}
                            isLoading={executeDraw.isPending}
                            className="h-10 md:h-9 text-xs"
                        >
                            Random Draw
                        </Button>
                    }
                />

                {/* Create Group */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Group name (e.g., Group A)"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                            />
                            <Button
                                onClick={handleCreateGroup}
                                disabled={!newGroupName.trim() || createGroup.isPending}
                                isLoading={createGroup.isPending}
                                className="h-10 text-xs"
                            >
                                Add Group
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-4">
                                    <div className="animate-pulse space-y-3">
                                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                                        <div className="h-24 bg-gray-100 rounded" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {!isLoading && (
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {groupList.map((group) => (
                            <motion.div key={group.id} variants={fadeUp}>
                                <Card elevated>
                                    <CardContent className="p-4">
                                        <h3 className="text-sm font-bold mb-3">{group.name}</h3>
                                        {group.teams && group.teams.length > 0 ? (
                                            <div className="space-y-2">
                                                {group.teams.map((team, idx) => (
                                                    <div
                                                        key={team.id}
                                                        className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded-lg"
                                                    >
                                                        <span className="text-[10px] font-bold text-gray-400 w-4">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-sm font-medium">{team.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 py-4 text-center">
                                                No teams assigned yet
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {!isLoading && groupList.length === 0 && (
                    <EmptyState
                        icon={<NavIcons.Teams />}
                        title="No Groups"
                        description="Create groups and run the draw to assign teams."
                    />
                )}
            </div>
        </PageLayout>
    );
}
