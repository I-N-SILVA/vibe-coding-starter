'use client';

import React, { useState, useCallback, useRef } from 'react';
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
import { uploadImage } from '@/lib/supabase/storage';
import { useToast } from '@/components/providers/ToastProvider';
import { stagger, fadeUp } from '@/lib/animations';
import { Loader2, Camera, X } from 'lucide-react';
import Image from 'next/image';

export default function AdminTeams() {
    const router = useRouter();
    const toast = useToast();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: '', short_name: '', competition_id: '', logo_url: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: teams = [], isLoading: teamsLoading } = useTeams();
    const { data: competitions = [], isLoading: compsLoading } = useCompetitions();
    const createTeamMutation = useCreateTeam();

    const isLoading = teamsLoading || compsLoading;

    const handleCloseModal = useCallback(() => {
        setIsAddModalOpen(false);
        setNewTeam({ name: '', short_name: '', competition_id: '', logo_url: '' });
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileName = `team-${Date.now()}.${file.name.split('.').pop()}`;
            const publicUrl = await uploadImage(file, 'logos', `teams/${fileName}`);
            setNewTeam(prev => ({ ...prev, logo_url: publicUrl }));
            toast.success('Logo uploaded!');
        } catch (err) {
            toast.error('Upload failed');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTeamMutation.mutateAsync({
                name: newTeam.name,
                shortName: newTeam.short_name,
                logoUrl: newTeam.logo_url,
                competitionId: newTeam.competition_id || undefined,
            });
            handleCloseModal();
            toast.success('Team registered successfully!');
        } catch (err) {
            toast.error('Failed to create team');
            console.error('Failed to create team:', err);
        }
    };

    return (
        <PageLayout title="TEAMS">
            <PageHeader
                label="Management"
                title="Registered Teams"
                rightAction={
                    <Button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-10 md:h-9 text-xs"
                    >
                        + Add Team
                    </Button>
                }
            />

            {isLoading ? (
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {teams.map((team) => (
                        <motion.div key={team.id} variants={fadeUp}>
                            <Card padding="lg" elevated hoverable className="group">
                                <CardContent className="pt-4">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-20 h-20 rounded-[2rem] bg-neutral-900 overflow-hidden flex items-center justify-center text-xl font-bold text-white mb-4 group-hover:scale-110 transition-transform relative shadow-xl border-4 border-white dark:border-neutral-800">
                                            {team.logo_url ? (
                                                <Image 
                                                    src={team.logo_url} 
                                                    alt={team.name} 
                                                    fill 
                                                    className="object-cover"
                                                />
                                            ) : (
                                                team.short_name || team.name.substring(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-1 uppercase tracking-tight italic">{team.name}</h3>
                                        <Badge variant="secondary" size="sm" className="mb-6 border-neutral-100 dark:border-white/5 text-[9px] font-black uppercase tracking-widest opacity-60">
                                            {competitions.find(c => c.id === team.competition_id)?.name || 'Unassigned League'}
                                        </Badge>

                                        <div className="grid grid-cols-2 gap-2 w-full pt-6 border-t border-neutral-100 dark:border-white/5 mt-auto">
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/league/teams/${team.id}`)} className="text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary">
                                                Profile
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-neutral-300 hover:text-red-600 hover:bg-red-50">
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
                onClose={handleCloseModal}
                title="Add New Team"
            >
                <form onSubmit={handleAddTeam} className="space-y-6 pt-4">
                    {/* Logo Upload */}
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-[2rem] bg-neutral-100 dark:bg-white/5 overflow-hidden flex items-center justify-center border-2 border-dashed border-neutral-200 dark:border-white/10 group-hover:border-primary/50 transition-colors relative">
                                {newTeam.logo_url ? (
                                    <>
                                        <Image 
                                            src={newTeam.logo_url} 
                                            alt="Preview" 
                                            fill 
                                            className="object-cover"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setNewTeam(prev => ({ ...prev, logo_url: '' }))}
                                            className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-neutral-400">
                                        <Camera className="w-6 h-6 opacity-40" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Logo</span>
                                    </div>
                                )}

                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors border-2 border-white dark:border-neutral-900"
                            >
                                <Camera className="w-3.5 h-3.5" />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Upload Team Crest</p>
                    </div>

                    <div className="space-y-4">
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
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button variant="secondary" onClick={handleCloseModal} type="button">
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={createTeamMutation.isPending} disabled={isUploading}>
                            Register Team
                        </Button>
                    </div>
                </form>
            </Modal>
        </PageLayout>
    );
}
