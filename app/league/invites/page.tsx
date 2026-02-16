'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Input,
    Select,
    EmptyState,
    PageHeader,
} from '@/components/plyaz';
import { PageLayout } from '@/components/plyaz/navigation/PageLayout';
import { NavIcons } from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { useInvites, useCreateInvite } from '@/lib/hooks';
import { useToast } from '@/components/providers';
import { stagger, fadeUp } from '@/lib/animations';

type ApiInvite = {
    id: string;
    type: string;
    email: string | null;
    token: string;
    status: string;
    invited_role: string | null;
    created_at: string | null;
    expires_at: string;
    organization_id: string;
};

const ROLE_OPTIONS = [
    { value: 'player', label: 'Player' },
    { value: 'manager', label: 'Team Manager' },
    { value: 'referee', label: 'Referee' },
    { value: 'admin', label: 'Admin' },
];

const TYPE_OPTIONS = [
    { value: 'player_join', label: 'Player Invite' },
    { value: 'team_join', label: 'Team Invite' },
    { value: 'referee_invite', label: 'Referee Invite' },
    { value: 'admin_invite', label: 'Admin Invite' },
];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    expired: 'bg-gray-100 text-gray-500',
    revoked: 'bg-red-100 text-red-500',
};

const typeLabels: Record<string, string> = {
    team_join: 'Team',
    player_join: 'Player',
    referee_invite: 'Referee',
    admin_invite: 'Admin',
};

export default function InvitesPage() {
    const { data: invites = [], isLoading, error } = useInvites();
    const createInvite = useCreateInvite();
    const toast = useToast();
    const [showCreate, setShowCreate] = useState(false);
    const [newInvite, setNewInvite] = useState({
        email: '',
        type: 'player_join' as 'team_join' | 'player_join' | 'referee_invite' | 'admin_invite',
        role: 'player' as string,
    });
    const [filter, setFilter] = useState<string>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Invites from API — cast to snake_case shape since API returns raw DB rows
    const inviteList: ApiInvite[] = Array.isArray(invites) ? (invites as unknown as ApiInvite[]) : [];
    const filtered = inviteList.filter((inv) => filter === 'all' || inv.status === filter);

    const handleCopy = (token: string, id: string) => {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/invites/accept?token=${token}`;
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        toast.success('Invite link copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCreate = async () => {
        if (!newInvite.email) return;

        try {
            await createInvite.mutateAsync({
                type: newInvite.type,
                email: newInvite.email,
                role: newInvite.role as 'admin' | 'organizer' | 'referee' | 'manager' | 'player' | 'fan',
            });
            toast.success('Invitation sent successfully');
            setShowCreate(false);
            setNewInvite({ email: '', type: 'player_join', role: 'player' });
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to send invitation');
        }
    };

    return (
        <PageLayout navItems={adminNavItems} title="Invites">
            <div className="space-y-6">
                <PageHeader
                    label="Management"
                    title="Invitations"
                    description={`${inviteList.length} total invite${inviteList.length !== 1 ? 's' : ''}`}
                    rightAction={
                        <Button onClick={() => setShowCreate(true)} className="h-10 md:h-9 text-xs">
                            + Send Invite
                        </Button>
                    }
                />

                {/* Create invite card */}
                {showCreate && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                        <Card elevated>
                            <CardContent className="p-5 md:p-6">
                                <h2 className="text-sm font-bold mb-4">New Invitation</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                    <div className="sm:col-span-3">
                                        <Input
                                            label="Email"
                                            type="email"
                                            placeholder="invite@example.com"
                                            value={newInvite.email}
                                            onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                                        />
                                    </div>
                                    <Select
                                        label="Invite Type"
                                        options={TYPE_OPTIONS}
                                        value={newInvite.type}
                                        onChange={(e) => setNewInvite({ ...newInvite, type: e.target.value as typeof newInvite.type })}
                                    />
                                    <Select
                                        label="Role"
                                        options={ROLE_OPTIONS}
                                        value={newInvite.role}
                                        onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleCreate}
                                        disabled={!newInvite.email || createInvite.isPending}
                                        isLoading={createInvite.isPending}
                                        className="h-10 text-xs"
                                    >
                                        Send Invite
                                    </Button>
                                    <Button variant="secondary" onClick={() => setShowCreate(false)} className="h-10 text-xs">
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Filter Pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
                    {['all', 'pending', 'accepted', 'expired'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${
                                filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-4">
                                    <div className="animate-pulse flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                                            <div className="h-2 bg-gray-100 rounded w-1/4" />
                                        </div>
                                        <div className="h-5 bg-gray-100 rounded-full w-16" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
                        Failed to load invitations. Please try again.
                    </div>
                )}

                {/* Invite list */}
                {!isLoading && (
                    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
                        {filtered.map((invite) => (
                            <motion.div key={invite.id} variants={fadeUp}>
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-3 md:p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-gray-500">
                                                    {(typeLabels[invite.type] || invite.type || '?')[0]}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">
                                                    {invite.email || 'Open Invite'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                                                        {typeLabels[invite.type] || invite.type}
                                                    </span>
                                                    {invite.invited_role && (
                                                        <>
                                                            <span className="text-gray-200">·</span>
                                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                                                {invite.invited_role}
                                                            </span>
                                                        </>
                                                    )}
                                                    <span className="text-gray-200">·</span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {invite.created_at
                                                            ? new Date(invite.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                                                            : '—'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Copy invite link */}
                                            <button
                                                onClick={() => handleCopy(invite.token, invite.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                title="Copy invite link"
                                            >
                                                <span className="text-[10px] font-bold text-gray-600">
                                                    {copiedId === invite.id ? '✓ Copied' : 'Copy Link'}
                                                </span>
                                            </button>

                                            <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full flex-shrink-0 ${statusColors[invite.status] || 'bg-gray-100 text-gray-500'}`}>
                                                {invite.status}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        {filtered.length === 0 && !isLoading && (
                            <EmptyState
                                icon={<NavIcons.Public />}
                                title="No Invitations"
                                description={filter === 'all' ? 'Send your first invitation to grow your league.' : `No ${filter} invitations found.`}
                            />
                        )}
                    </motion.div>
                )}
            </div>
        </PageLayout>
    );
}
