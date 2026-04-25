'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Button,
} from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { useCompetition, useUpdateCompetition } from '@/lib/hooks';
import { useInvites, useCreateInvite } from '@/lib/hooks';
import { useToast } from '@/components/providers';
import { Settings, GitBranch, Users, Link2, Check, Copy } from 'lucide-react';
import { stagger, fadeUp } from '@/lib/animations';

type ApiInvite = {
    id: string;
    token: string;
    status: string;
};

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-orange-100 text-orange-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    archived: 'bg-gray-100 text-gray-400',
};

const TYPE_LABELS: Record<string, string> = {
    league: 'League',
    knockout: 'Knockout Cup',
    group_knockout: 'Group Stage + Knockout',
};

const SECTIONS = [
    {
        href: 'config',
        icon: Settings,
        label: 'Configuration',
        description: 'Format, rules, and match settings',
    },
    {
        href: 'draw',
        icon: GitBranch,
        label: 'Draw',
        description: 'Generate brackets or groups',
    },
    {
        href: 'registrations',
        icon: Users,
        label: 'Registrations',
        description: 'Team and player sign-ups',
    },
    {
        href: 'codes',
        icon: Link2,
        label: 'Invite Codes',
        description: 'Share access links with teams',
    },
];

export default function CompetitionHubPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const toast = useToast();

    const { data: competition, isLoading } = useCompetition(id);
    const updateCompetition = useUpdateCompetition();
    const createInvite = useCreateInvite();
    const { data: invites = [] } = useInvites();

    const [freshLink, setFreshLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const activeInvites = (invites as unknown as ApiInvite[]).filter(
        (inv) => inv.status === 'pending'
    );

    const handleActivate = async () => {
        if (!competition) return;
        try {
            await updateCompetition.mutateAsync({
                id,
                data: { status: 'active' },
            });
            toast.success('Competition is now live!');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to activate');
        }
    };

    const handleGenerateInvite = async () => {
        setIsGenerating(true);
        try {
            const result = await createInvite.mutateAsync({
                type: 'team_join',
                role: 'manager',
            }) as ApiInvite;
            const link = `${window.location.origin}/invites/accept?token=${result.token}`;
            setFreshLink(link);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to generate invite');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!freshLink) return;
        navigator.clipboard.writeText(freshLink);
        setCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <PageLayout navItems={adminNavItems} title="Competition">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-100 rounded w-1/3" />
                    <div className="h-40 bg-gray-100 rounded" />
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-28 bg-gray-100 rounded" />
                        ))}
                    </div>
                </div>
            </PageLayout>
        );
    }

    if (!competition) {
        return (
            <PageLayout navItems={adminNavItems} title="Competition">
                <div className="py-24 text-center">
                    <p className="text-sm text-gray-400">Competition not found.</p>
                    <Button variant="secondary" className="mt-4" onClick={() => router.push('/league')}>
                        Back to Dashboard
                    </Button>
                </div>
            </PageLayout>
        );
    }

    const isDraft = competition.status === 'draft';

    return (
        <PageLayout navItems={adminNavItems} title={competition.name}>
            <div className="space-y-8 max-w-2xl">
                <PageHeader
                    label="Competition"
                    title={competition.name}
                    description={`${TYPE_LABELS[competition.type] ?? competition.type} · Created ${new Date(competition.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    rightAction={
                        <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full ${STATUS_COLORS[competition.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {competition.status}
                        </span>
                    }
                />

                {/* Draft CTA */}
                {isDraft && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="border-orange-200 bg-orange-50">
                            <CardContent className="p-5 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-orange-800">This competition is not live yet</p>
                                    <p className="text-xs text-orange-600 mt-0.5">Configure your rules, invite teams, then activate to go live.</p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={handleActivate}
                                    disabled={updateCompetition.isPending}
                                    isLoading={updateCompetition.isPending}
                                    className="flex-shrink-0"
                                >
                                    Activate
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Quick Invite */}
                <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gray-400 mb-3">
                        Quick Invite
                    </h2>

                    {freshLink ? (
                        <Card elevated>
                            <CardContent className="p-5">
                                <p className="text-xs font-bold tracking-widest uppercase text-green-600 mb-2">Invite Ready</p>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                    <p className="flex-1 text-xs font-mono text-gray-600 truncate">{freshLink}</p>
                                    <button
                                        onClick={handleCopy}
                                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all hover:bg-gray-700"
                                    >
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <p className="text-[10px] text-gray-400">{activeInvites.length} active invite{activeInvites.length !== 1 ? 's' : ''} total</p>
                                    <button onClick={() => router.push('/league/invites')} className="text-[10px] font-bold text-gray-500 hover:text-gray-900 underline underline-offset-2">
                                        Manage all invites
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="p-5 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Invite a team or player</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Generate a shareable link — no email needed.</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={handleGenerateInvite}
                                        disabled={isGenerating}
                                        isLoading={isGenerating}
                                    >
                                        <Link2 className="w-3.5 h-3.5 mr-1.5" />
                                        Get Link
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => router.push('/league/invites')}
                                    >
                                        All Invites
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.section>

                {/* Section Cards */}
                <motion.section variants={stagger} initial="hidden" animate="show">
                    <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gray-400 mb-3">
                        Setup
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {SECTIONS.map((section) => (
                            <motion.div key={section.href} variants={fadeUp}>
                                <button
                                    onClick={() => router.push(`/league/competitions/${id}/${section.href}`)}
                                    className="w-full text-left p-5 rounded-2xl bg-white border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-gray-100 transition-colors">
                                        <section.icon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{section.label}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{section.description}</p>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Back link */}
                <div className="pt-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/league')} className="text-gray-400 hover:text-gray-700">
                        ← Back to Dashboard
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
}
