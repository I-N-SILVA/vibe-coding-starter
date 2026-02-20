'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout, PageHeader, Card, CardContent, Button, Badge } from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { Copy, Check, Plus, Link2, RefreshCw } from 'lucide-react';

/**
 * Competition Invite Code Generator
 * Allows managers to generate and share invite codes for teams/players.
 */

interface InviteCode {
    id: string;
    code: string;
    type: 'team' | 'player';
    competition: string;
    assignedTo: string | null;
    status: 'active' | 'used' | 'expired';
    createdAt: string;
}

const generateCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'PLY-';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
};

const MOCK_CODES: InviteCode[] = [
    { id: '1', code: 'PLY-A8X3K2', type: 'team', competition: 'Premier League 2026', assignedTo: 'Phoenix FC', status: 'used', createdAt: '2026-02-10' },
    { id: '2', code: 'PLY-B7Y2J9', type: 'team', competition: 'Premier League 2026', assignedTo: 'City Rangers', status: 'used', createdAt: '2026-02-10' },
    { id: '3', code: 'PLY-C4Z8M1', type: 'team', competition: 'Premier League 2026', assignedTo: null, status: 'active', createdAt: '2026-02-12' },
    { id: '4', code: 'PLY-D9W5N6', type: 'player', competition: 'Champions Cup', assignedTo: 'Marcus Rivera', status: 'used', createdAt: '2026-02-14' },
    { id: '5', code: 'PLY-E3V7P4', type: 'player', competition: 'Champions Cup', assignedTo: null, status: 'active', createdAt: '2026-02-15' },
];

export default function InviteCodesPage() {
    const [codeType, setCodeType] = useState<'team' | 'player'>('team');
    const [codes, setCodes] = useState<InviteCode[]>(MOCK_CODES);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredCodes = codes.filter(c => c.type === codeType);
    const activeCount = codes.filter(c => c.status === 'active').length;
    const usedCount = codes.filter(c => c.status === 'used').length;

    const handleGenerate = () => {
        const newCode: InviteCode = {
            id: Date.now().toString(),
            code: generateCode(),
            type: codeType,
            competition: 'Premier League 2026',
            assignedTo: null,
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
        };
        setCodes([newCode, ...codes]);
    };

    const handleCopy = (code: InviteCode) => {
        navigator.clipboard.writeText(code.code);
        setCopiedId(code.id);
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

                {/* Code List */}
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
                                                <p className="text-xs text-gray-500 font-bold">{code.competition}</p>
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
        </PageLayout>
    );
}
