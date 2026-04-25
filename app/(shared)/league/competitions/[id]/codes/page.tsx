'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageLayout, PageHeader, Card, CardContent, Button, Badge, Modal } from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { Copy, Check, Plus, Link2, RefreshCw, QrCode } from 'lucide-react';
import { useToast } from '@/components/providers';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Competition Invite Code Generator
 * Allows managers to generate and share invite codes for teams/players.
 */

interface InviteCode {
    id: string;
    code: string;
    type: 'team' | 'player';
    assignedTo: string | null;
    status: 'active' | 'used' | 'expired';
    createdAt: string;
}

interface InviteRow {
    id: string;
    token: string;
    type: string;
    status: string;
    created_at: string;
    email: string | null;
}

function mapInviteRow(row: InviteRow): InviteCode {
    return {
        id: row.id,
        code: row.token,
        type: row.type === 'team_join' ? 'team' : 'player',
        status: row.status === 'pending' ? 'active' : (row.status as 'used' | 'expired'),
        createdAt: row.created_at,
        assignedTo: row.email ?? null,
    };
}

export default function InviteCodesPage() {
    const params = useParams();
    const id = params.id as string;
    const queryClient = useQueryClient();
    const toast = useToast();
    const [codeType, setCodeType] = useState<'team' | 'player'>('team');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [qrCodeState, setQrCodeState] = useState<{ open: boolean; url: string; code: string }>({
        open: false,
        url: '',
        code: '',
    });

    const { data: rawCodes = [], isLoading } = useQuery({
        queryKey: ['codes', id],
        queryFn: () =>
            fetch(`/api/league/competitions/${id}/codes`)
                .then((r) => (r.ok ? r.json() : [])) as Promise<InviteRow[]>,
    });

    const codes: InviteCode[] = rawCodes.map(mapInviteRow);
    const filteredCodes = codes.filter((c) => c.type === codeType);
    const activeCount = codes.filter((c) => c.status === 'active').length;
    const usedCount = codes.filter((c) => c.status === 'used').length;

    const handleGenerate = async () => {
        await fetch(`/api/league/competitions/${id}/codes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: codeType }),
        });
        await queryClient.invalidateQueries({ queryKey: ['codes', id] });
    };

    const handleCopy = (code: InviteCode) => {
        const url = `${window.location.origin}/invites/accept?token=${code.code}`;
        navigator.clipboard.writeText(url);
        setCopiedId(code.id);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <PageLayout navItems={adminNavItems} title="INVITE CODES">
            <PageHeader
                label="Competition Access"
                title="Invite Codes"
                description="Generate and manage access codes for teams and players."
            />

            <div className="max-w-2xl space-y-6 pb-24">
                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4">
                    <Card className="border-0 bg-gray-50 rounded-2xl">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-black text-gray-900">{codes.length}</div>
                            <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Total</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-green-50 rounded-2xl">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-black text-green-600">{activeCount}</div>
                            <div className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Active</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-gray-100 rounded-2xl">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-black text-gray-500">{usedCount}</div>
                            <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Used</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Type Toggle */}
                <div className="flex bg-gray-100 rounded-2xl p-1">
                    {(['team', 'player'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setCodeType(type)}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${codeType === type ? 'bg-black text-white shadow-lg' : 'text-gray-400'
                                }`}
                        >
                            {type === 'team' ? '🏟️ Team Codes' : '👤 Player Codes'}
                        </button>
                    ))}
                </div>

                {/* Generate Button */}
                <Button
                    fullWidth
                    className="h-16 bg-black text-white rounded-2xl font-black tracking-widest text-sm"
                    onClick={handleGenerate}
                >
                    <Plus className="w-5 h-5 mr-2" /> GENERATE NEW {codeType.toUpperCase()} CODE
                </Button>
                <p className="text-[10px] text-gray-400 text-center mt-2">Share the invite link — anyone with it can join directly.</p>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-8 text-gray-400 text-sm font-bold tracking-widest uppercase">
                        Loading codes...
                    </div>
                )}

                {/* Code List */}
                {!isLoading && (
                    <AnimatePresence>
                        <div className="space-y-3">
                            {filteredCodes.map((code, i) => (
                                <motion.div
                                    key={code.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card className="border-0 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-lg font-black text-gray-900 tracking-wider">{code.code}</span>
                                                    <button
                                                        onClick={() => {
                                                            const url = `${window.location.origin}/invites/accept?token=${code.code}`;
                                                            setQrCodeState({ open: true, url, code: code.code });
                                                        }}
                                                        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                                    >
                                                        <QrCode className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCopy(code)}
                                                        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                                    >
                                                        {copiedId === code.id ? (
                                                            <Check className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                <Badge
                                                    variant={code.status === 'active' ? 'success' : 'secondary'}
                                                    className="text-[8px] uppercase tracking-widest"
                                                >
                                                    {code.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        {code.assignedTo
                                                            ? `Assigned to: ${code.assignedTo}`
                                                            : 'Unassigned'}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] text-gray-300 font-mono">{code.createdAt}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}

                {/* Bulk Actions */}
                <div className="flex gap-3 pt-4">
                    <Button variant="secondary" fullWidth className="h-12 rounded-2xl border-gray-200 text-gray-500 text-xs font-bold">
                        <Link2 className="w-4 h-4 mr-2" /> Share All Active
                    </Button>
                    <Button variant="secondary" fullWidth className="h-12 rounded-2xl border-gray-200 text-gray-500 text-xs font-bold">
                        <RefreshCw className="w-4 h-4 mr-2" /> Revoke Expired
                    </Button>
                </div>
            </div>

            {/* QR Modal */}
            <Modal
                isOpen={qrCodeState.open}
                onClose={() => setQrCodeState({ ...qrCodeState, open: false })}
                title="Share Access"
            >
                <div className="flex flex-col items-center py-6 gap-6">
                    <div className="p-4 bg-white rounded-3xl border shadow-xl">
                        <QRCodeSVG value={qrCodeState.url} size={200} fgColor="#F97316" />
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Invite Link</p>
                        <p className="text-sm font-mono text-gray-500 break-all px-6">{qrCodeState.url}</p>
                    </div>
                    <Button 
                        fullWidth 
                        onClick={() => {
                            navigator.clipboard.writeText(qrCodeState.url);
                            toast.success('Link copied');
                        }}
                        className="bg-black text-white"
                    >
                        Copy Link
                    </Button>
                </div>
            </Modal>
        </PageLayout>
    );
}
