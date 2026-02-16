'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Input,
    Select,
} from '@/components/plyaz';
import { PageLayout } from '@/components/plyaz/navigation/PageLayout';
import { adminNavItems } from '@/lib/constants/navigation';

interface Invite {
    id: string;
    type: 'team' | 'player' | 'referee';
    code: string;
    email: string;
    status: 'pending' | 'accepted' | 'expired';
    created: string;
    expires: string;
}

const DEMO_INVITES: Invite[] = [
    { id: '1', type: 'team', code: 'PLZ-TM-A1B2', email: 'coach@example.com', status: 'pending', created: '2025-01-15', expires: '2025-01-22' },
    { id: '2', type: 'player', code: 'PLZ-PL-C3D4', email: 'player@example.com', status: 'accepted', created: '2025-01-14', expires: '2025-01-21' },
    { id: '3', type: 'referee', code: 'PLZ-RF-E5F6', email: 'ref@example.com', status: 'expired', created: '2025-01-10', expires: '2025-01-17' },
    { id: '4', type: 'player', code: 'PLZ-PL-G7H8', email: 'star@example.com', status: 'pending', created: '2025-01-16', expires: '2025-01-23' },
];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    expired: 'bg-gray-100 text-gray-500',
};

const typeIcons: Record<string, string> = {
    team: '🏟️',
    player: '⚽',
    referee: '🟨',
};

export default function InvitesPage() {
    const [invites] = useState<Invite[]>(DEMO_INVITES);
    const [showCreate, setShowCreate] = useState(false);
    const [newInvite, setNewInvite] = useState<{ email: string; type: Invite['type'] }>({ email: '', type: 'player' });
    const [filter, setFilter] = useState<string>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filtered = invites.filter((inv) => filter === 'all' || inv.status === filter);

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCreate = () => {
        // In production, POST to /api/league/invites
        setShowCreate(false);
        setNewInvite({ email: '', type: 'player' });
    };

    return (
        <PageLayout navItems={adminNavItems} title="Invites">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight">Invitations</h1>
                        <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">{invites.length} total invites</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)} className="h-10 md:h-9 text-xs">
                        + Send Invite
                    </Button>
                </div>

                {/* Create invite modal-like card */}
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
                                        options={[
                                            { value: 'player', label: 'Player' },
                                            { value: 'team', label: 'Team Manager' },
                                            { value: 'referee', label: 'Referee' },
                                        ]}
                                        value={newInvite.type}
                                        onChange={(e) => setNewInvite({ ...newInvite, type: e.target.value as Invite['type'] })}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button onClick={handleCreate} disabled={!newInvite.email} className="h-10 text-xs">
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
                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Invite list */}
                <div className="space-y-2">
                    {filtered.map((invite, i) => (
                        <motion.div
                            key={invite.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-3 md:p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                                            {typeIcons[invite.type]}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{invite.email}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">{invite.type}</span>
                                                <span className="text-gray-200">·</span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(invite.created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Code + Copy */}
                                        <button
                                            onClick={() => handleCopy(invite.code, invite.id)}
                                            className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            title="Copy invite code"
                                        >
                                            <span className="text-[10px] font-mono font-bold text-gray-600">
                                                {copiedId === invite.id ? '✓ Copied' : invite.code}
                                            </span>
                                        </button>

                                        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full flex-shrink-0 ${statusColors[invite.status]}`}>
                                            {invite.status}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-4xl mb-4">📨</p>
                            <p className="text-sm text-gray-400">No invites found</p>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
}
