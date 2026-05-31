'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Select,
    Toggle,
    ConfirmModal,
} from '@/components/plyaz';
import { useToast } from '@/components/providers';
import { useOrganization } from '@/lib/hooks';
import { stagger, fadeUp } from '@/lib/animations';
import { useRouter } from 'next/navigation';

export default function AdminSettings() {
    const { success, error: toastError, warning } = useToast();
    const { data: org } = useOrganization();
    const router = useRouter();
    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const [isDemoLinking, setIsDemoLinking] = useState(false);
    const [isEnablingRecruiting, setIsEnablingRecruiting] = useState(false);
    const [isRecalculating, setIsRecalculating] = useState(false);

    const handleLinkDemoOrg = async () => {
        try {
            setIsDemoLinking(true);
            const res = await fetch('/api/admin/link-demo-org', { method: 'POST' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? 'Failed to link demo org');
            success(`Connected to "${json.org_name}" successfully! Reloading…`);
            // Give the toast a moment to show before hard reload
            setTimeout(() => router.refresh(), 1200);
        } catch (err) {
            toastError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsDemoLinking(false);
        }
    };

    const handleEnableRecruiting = async () => {
        try {
            setIsEnablingRecruiting(true);
            const res = await fetch('/api/admin/enable-demo-recruiting', { method: 'POST' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? 'Failed to enable recruiting');
            success(`Recruiting enabled for ${json.updated} demo team(s).`);
        } catch (err) {
            toastError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsEnablingRecruiting(false);
        }
    };

    const handleRecalculateStandings = async () => {
        try {
            setIsRecalculating(true);
            const res = await fetch('/api/admin/recalculate-all-standings', { method: 'POST' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? 'Failed to recalculate standings');
            success(
                `Standings recalculated: ${json.competitions} competition(s), ${json.teams_updated} team(s) updated.`,
            );
        } catch (err) {
            toastError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsRecalculating(false);
        }
    };

    const handlePortal = async () => {
        try {
            setIsPortalLoading(true);
            const res = await fetch('/api/stripe/portal', { method: 'POST' });
            const { url, error } = await res.json();
            if (url) {
                window.location.href = url;
                return;
            }
            // 400 = org has no Stripe subscription yet (free/seeded org). Route to pricing.
            if (res.status === 400) {
                warning('Choose a plan to start a subscription.');
                router.push('/pricing');
                return;
            }
            throw new Error(error || 'Failed to open billing portal');
        } catch (err) {
            toastError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsPortalLoading(false);
        }
    };
    const [notifications, setNotifications] = useState({
        matchAlerts: true,
        goals: true,
        results: true,
        weeklyDigest: false,
    });
    const [scoring, setScoring] = useState({
        winPoints: '3',
        drawPoints: '1',
        lossPoints: '0',
        tiebreaker_gd: true,
        tiebreaker_h2h: false,
    });
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    return (
        <PageLayout title="SETTINGS">
            <div className="max-w-3xl">
                <PageHeader label="Account & System" title="League Settings" />

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="space-y-6"
                >
                    {/* Subscription & Billing */}
                    <motion.div variants={fadeUp}>
                        <Card elevated className="border-orange-100 bg-orange-50/30">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest">
                                    Subscription & Billing
                                </CardTitle>
                                <span className="rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                    {org?.plan || 'Free'} Plan
                                </span>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            Manage Subscription
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400">
                                            Update payment method or change plans
                                        </p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handlePortal}
                                        isLoading={isPortalLoading}
                                    >
                                        Manage
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* General Configuration */}
                    <motion.div variants={fadeUp}>
                        <Card elevated>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest">
                                    General Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    label="Organization Name"
                                    defaultValue="PLYAZ League Authority"
                                />
                                <Input label="Admin Email" defaultValue="admin@plyaz.net" />
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            Public visibility
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400">
                                            Allow fans to see scores and standings
                                        </p>
                                    </div>
                                    <Toggle checked={true} onChange={() => {}} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Match Rules */}
                    <motion.div variants={fadeUp}>
                        <Card elevated>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest">
                                    Match Rules
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Select
                                    label="Half Duration (mins)"
                                    options={[
                                        { value: '45', label: '45 Minutes' },
                                        { value: '40', label: '40 Minutes' },
                                        { value: '35', label: '35 Minutes' },
                                        { value: '30', label: '30 Minutes' },
                                    ]}
                                    defaultValue="45"
                                />
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            Extra Time Enabled
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400">
                                            Allow knockout matches to go into extra time
                                        </p>
                                    </div>
                                    <Toggle checked={true} onChange={() => {}} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Notification Preferences */}
                    <motion.div variants={fadeUp}>
                        <Card elevated>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest">
                                    Notification Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {[
                                    {
                                        key: 'matchAlerts' as const,
                                        label: 'Match Start Alerts',
                                        desc: 'Get notified when a match kicks off',
                                    },
                                    {
                                        key: 'goals' as const,
                                        label: 'Goal Notifications',
                                        desc: 'Receive alerts for every goal scored',
                                    },
                                    {
                                        key: 'results' as const,
                                        label: 'Final Results',
                                        desc: 'Get notified when matches end',
                                    },
                                    {
                                        key: 'weeklyDigest' as const,
                                        label: 'Weekly Digest',
                                        desc: "Summary of the week's results and standings",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">
                                                {item.label}
                                            </p>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400">
                                                {item.desc}
                                            </p>
                                        </div>
                                        <Toggle
                                            checked={notifications[item.key]}
                                            onChange={(val) =>
                                                setNotifications({
                                                    ...notifications,
                                                    [item.key]: val,
                                                })
                                            }
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Scoring Configuration */}
                    <motion.div variants={fadeUp}>
                        <Card elevated>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest">
                                    Scoring Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <Input
                                        label="Win Points"
                                        type="number"
                                        value={scoring.winPoints}
                                        onChange={(e) =>
                                            setScoring({ ...scoring, winPoints: e.target.value })
                                        }
                                    />
                                    <Input
                                        label="Draw Points"
                                        type="number"
                                        value={scoring.drawPoints}
                                        onChange={(e) =>
                                            setScoring({ ...scoring, drawPoints: e.target.value })
                                        }
                                    />
                                    <Input
                                        label="Loss Points"
                                        type="number"
                                        value={scoring.lossPoints}
                                        onChange={(e) =>
                                            setScoring({ ...scoring, lossPoints: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-1 pt-2">
                                    <div className="flex items-center justify-between border-b border-gray-50 py-3">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">
                                                Goal Difference Tiebreaker
                                            </p>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400">
                                                Use GD to break ties in standings
                                            </p>
                                        </div>
                                        <Toggle
                                            checked={scoring.tiebreaker_gd}
                                            onChange={(val) =>
                                                setScoring({ ...scoring, tiebreaker_gd: val })
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">
                                                Head-to-Head Tiebreaker
                                            </p>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400">
                                                Use H2H record to break ties
                                            </p>
                                        </div>
                                        <Toggle
                                            checked={scoring.tiebreaker_h2h}
                                            onChange={(val) =>
                                                setScoring({ ...scoring, tiebreaker_h2h: val })
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Developer / Testing */}
                    <motion.div variants={fadeUp}>
                        <Card elevated className="border-blue-100 bg-blue-50/30">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-blue-700">
                                    Developer / Testing
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            Connect to PLYAZ Demo League
                                        </p>
                                        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-400">
                                            Connects your account to the demo dataset with 6 teams,
                                            66 players, and 17 matches
                                        </p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleLinkDemoOrg}
                                        isLoading={isDemoLinking}
                                    >
                                        Connect
                                    </Button>
                                </div>
                                <div className="border-t border-blue-100" />
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            Enable Recruiting for Demo Teams
                                        </p>
                                        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-400">
                                            Turns on <code>is_recruiting_players</code> for all demo
                                            teams so they appear in Discovery
                                        </p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleEnableRecruiting}
                                        isLoading={isEnablingRecruiting}
                                    >
                                        Enable
                                    </Button>
                                </div>
                                <div className="border-t border-blue-100" />
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            Recalculate Standings
                                        </p>
                                        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-400">
                                            Re-derives standings from all completed matches across
                                            active competitions
                                        </p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleRecalculateStandings}
                                        isLoading={isRecalculating}
                                    >
                                        Recalculate
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div variants={fadeUp}>
                        <Card elevated className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-red-600">
                                    Danger Zone
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            Reset League Data
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400">
                                            Clear all matches, scores, and standings
                                        </p>
                                    </div>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => setResetModalOpen(true)}
                                    >
                                        Reset
                                    </Button>
                                </div>
                                <div className="border-t border-gray-50" />
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            Delete League
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400">
                                            Permanently delete this league and all data
                                        </p>
                                    </div>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => setDeleteModalOpen(true)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                                <div className="border-t border-gray-50" />
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            Export Data
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400">
                                            Download all league data as JSON
                                        </p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() =>
                                            success('Data export started. Check your downloads.')
                                        }
                                    >
                                        Export
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="flex justify-end pt-4">
                        <Button
                            variant="primary"
                            className="px-12"
                            onClick={() => success('Settings saved successfully.')}
                        >
                            Save Changes
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Confirm Modals */}
            <ConfirmModal
                isOpen={resetModalOpen}
                onClose={() => setResetModalOpen(false)}
                onConfirm={() => {
                    setResetModalOpen(false);
                    success('League data has been reset.');
                }}
                title="Reset League Data"
                message="This will permanently clear all match results, scores, and standings. Teams will be preserved. This action cannot be undone."
                confirmLabel="Reset All Data"
                variant="danger"
            />
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => {
                    setDeleteModalOpen(false);
                    success('League has been deleted.');
                }}
                title="Delete League"
                message="This will permanently delete this league and all associated data including teams, matches, and standings. This action cannot be undone."
                confirmLabel="Delete League"
                variant="danger"
            />
        </PageLayout>
    );
}
