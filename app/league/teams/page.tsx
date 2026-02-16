'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeams, useCompetitions, useCreateTeam } from '@/lib/hooks';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Button,
    Badge,
    Modal,
    Input,
    Select,
    EmptyState,
    SkeletonCard,
    NavIcons,
} from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { stagger, fadeUp } from '@/lib/animations';

export default function AdminTeams() {
    const router = useRouter();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: '', short_name: '', competition_id: '' });

    const { data: teams = [], isLoading: teamsLoading } = useTeams();
    const { data: competitions = [], isLoading: compsLoading } = useCompetitions();
    const createTeamMutation = useCreateTeam();

    const isLoading = teamsLoading || compsLoading;

    const handleAddTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTeamMutation.mutateAsync(newTeam as any);
            setIsAddModalOpen(false);
            setNewTeam({ name: '', short_name: '', competition_id: '' });
        } catch (err) {
            console.error('Failed to create team:', err);
        }
    };

    return (
        <PageLayout navItems={adminNavItems} title="TEAMS">
            <PageHeader
                label="Management"
                title="Registered Teams"
                rightAction={
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        Add New Team
                    </Button>
                }
            />

            {isLoading ? (
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <motion.div key={i} variants={fadeUp}>
                            <SkeletonCard />
                        </motion.div>
                    ))}
                </motion.div>
            ) : teams.length > 0 ? (
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {teams.map((team) => (
                        <motion.div key={team.id} variants={fadeUp}>
                            <Card padding="lg" elevated hoverable className="group">
                                <CardContent className="pt-4">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-primary-main flex items-center justify-center text-xl font-bold text-white mb-4 group-hover:scale-110 transition-transform">
                                            {team.shortName || team.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <h3 className="text-lg font-bold text-primary-main mb-1">{team.name}</h3>
                                        <Badge variant="secondary" size="sm" className="mb-6 border-secondary-main/10 text-secondary-main/40">
                                            {competitions.find(c => c.id === team.competitionId)?.name || 'Unassigned'}
                                        </Badge>

                                        <div className="grid grid-cols-2 gap-2 w-full pt-6 border-t border-secondary-main/5 mt-auto">
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/league/teams/${team.id}`)} className="text-secondary-main/40 hover:text-primary-main">
                                                Profile
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-secondary-main/20 hover:text-red-600">
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <EmptyState
                    icon={<NavIcons.Teams />}
                    title="No Teams Yet"
                    description="Add your first team to get started."
                    action={{
                        label: 'Add New Team',
                        onClick: () => setIsAddModalOpen(true),
                    }}
                />
            )}

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Team"
            >
                <form onSubmit={handleAddTeam} className="space-y-4">
                    <Input
                        label="Team Name"
                        placeholder="e.g., Manchester Jets"
                        value={newTeam.name}
                        onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Short Name (3-4 chars)"
                        placeholder="e.g., MJT"
                        value={newTeam.short_name}
                        onChange={e => setNewTeam({ ...newTeam, short_name: e.target.value })}
                    />
                    <Select
                        label="Assign to Competition"
                        placeholder="Select a league"
                        options={competitions.map(c => ({ value: c.id, label: c.name }))}
                        value={newTeam.competition_id}
                        onChange={e => setNewTeam({ ...newTeam, competition_id: e.target.value })}
                    />
                    <div className="flex justify-end gap-3 mt-8">
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Register Team
                        </Button>
                    </div>
                </form>
            </Modal>
        </PageLayout>
    );
}
