'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Input,
    Select,
    PageHeader,
    EmptyState,
} from '@/components/plyaz';
import { NavIcons } from '@/components/plyaz';
import { PageLayout } from '@/components/plyaz/navigation/PageLayout';
import { adminNavItems } from '@/lib/constants/navigation';
import { useToast } from '@/components/providers';
import { stagger, fadeUp } from '@/lib/animations';

type Invite = {
    id: string;
    email: string;
    type: string;
    status: string;
    expires_at: string;
    invited_role: string;
    created_at?: string;
    token: string;
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    expired: 'bg-gray-100 text-gray-500',
    revoked: 'bg-red-100 text-red-500',
};

const ROLE_OPTIONS = [
    { value: 'player', label: 'Player' },
    { value: 'manager', label: 'Manager' },
    { value: 'referee', label: 'Referee' },
    { value: 'admin', label: 'Admin' },
    { value: 'fan', label: 'Fan' },
];

export default function InvitationsPage() {
    const { organizationId } = useParams();
    const toast = useToast();
    const [invites, setInvites] = useState<Invite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [newInvite, setNewInvite] = useState({
        email: '',
        type: 'player_join',
        role: 'player',
    });

    const fetchInvites = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/league/invites');
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) setInvites(data);
            }
        } catch {
            toast.error('Failed to load invitations');
        } finally {
            setIsLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchInvites(); }, [organizationId]);

    const handleSendInvite = async () => {
        if (!newInvite.email) return;
        setIsSending(true);
        try {
            const response = await fetch('/api/league/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInvite),
            });
            if (response.ok) {
                toast.success('Invitation sent');
                setShowCreate(false);
                setNewInvite({ email: '', type: 'player_join', role: 'player' });
                fetchInvites();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to send invitation');
            }
        } catch {
            toast.error('Failed to send invitation');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <PageLayout navItems={adminNavItems} title="Organization Invitations">
            <div className="space-y-6">
                <PageHeader
                    label="Organization"
                    title="Invitations"
                    description={`${invites.length} invitation${invites.length !== 1 ? 's' : ''} sent`}
                    rightAction={
                        <Button onClick={() => setShowCreate(!showCreate)} className="h-10 md:h-9 text-xs">
                            + Send Invite
                        </Button>
                    }
                />

                {/* Create invite form */}
                {showCreate && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                        <Card elevated>
                            <CardContent className="p-5 md:p-6">
                                <h2 className="text-sm font-bold mb-4">New Invitation</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                    <div className="sm:col-span-2">
                                        <Input
                                            label="Email"
                                            type="email"
                                            placeholder="invite@example.com"
                                            value={newInvite.email}
                                            onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                                        />
                                    </div>
                                    <Select
                                        label="Role"
                                        options={ROLE_OPTIONS}
                                        value={newInvite.role}
                                        onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleSendInvite}
                                        disabled={!newInvite.email || isSending}
                                        isLoading={isSending}
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

                {/* Loading */}
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

                {/* Invite list */}
                {!isLoading && (
                    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
                        {invites.map((invite) => (
                            <motion.div key={invite.id} variants={fadeUp}>
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-3 md:p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-gray-500">
                                                    {(invite.invited_role || '?')[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{invite.email}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                                                        {invite.invited_role}
                                                    </span>
                                                    <span className="text-gray-200">·</span>
                                                    <span className="text-[10px] text-gray-400">
                                                        Expires {new Date(invite.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full flex-shrink-0 ${statusColors[invite.status] || 'bg-gray-100 text-gray-500'}`}>
                                                {invite.status}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        {invites.length === 0 && (
                            <EmptyState
                                icon={<NavIcons.Public />}
                                title="No Invitations"
                                description="Send your first invitation to grow your organization."
                            />
                        )}
                    </motion.div>
                )}
            </div>
        </PageLayout>
    );
}
