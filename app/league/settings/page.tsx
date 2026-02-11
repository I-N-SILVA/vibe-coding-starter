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
import { adminNavItems } from '@/lib/constants/navigation';
import { useToast } from '@/components/providers';

const stagger = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function AdminSettings() {
    const { success } = useToast();
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
        <PageLayout navItems={adminNavItems} title="SETTINGS">
            <div className="max-w-3xl">
                <PageHeader label="Account & System" title="League Settings" />

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="space-y-6"
                >
                    {/* General Configuration */}
                    <motion.div variants={fadeUp}>
                        <Card elevated>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold tracking-widest uppercase">General Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input label="Organization Name" defaultValue="PLYAZ League Authority" />
                                <Input label="Admin Email" defaultValue="admin@plyaz.net" />
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Public visibility</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Allow fans to see scores and standings</p>
                                    </div>
                                    <Toggle checked={true} onChange={() => { }} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Match Rules */}
                    <motion.div variants={fadeUp}>
                        <Card elevated>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold tracking-widest uppercase">Match Rules</CardTitle>
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
                                        <p className="text-sm font-bold text-gray-900">Extra Time Enabled</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Allow knockout matches to go into extra time</p>
                                    </div>
                                    <Toggle checked={true} onChange={() => { }} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Notification Preferences */}
                    <motion.div variants={fadeUp}>
                        <Card elevated>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold tracking-widest uppercase">Notification Preferences</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {[
                                    { key: 'matchAlerts' as const, label: 'Match Start Alerts', desc: 'Get notified when a match kicks off' },
                                    { key: 'goals' as const, label: 'Goal Notifications', desc: 'Receive alerts for every goal scored' },
                                    { key: 'results' as const, label: 'Final Results', desc: 'Get notified when matches end' },
                                    { key: 'weeklyDigest' as const, label: 'Weekly Digest', desc: 'Summary of the week\'s results and standings' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{item.label}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.desc}</p>
                                        </div>
                                        <Toggle
                                            checked={notifications[item.key]}
                                            onChange={(val) => setNotifications({ ...notifications, [item.key]: val })}
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
                                <CardTitle className="text-sm font-bold tracking-widest uppercase">Scoring Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <Input
                                        label="Win Points"
                                        type="number"
                                        value={scoring.winPoints}
                                        onChange={(e) => setScoring({ ...scoring, winPoints: e.target.value })}
                                    />
                                    <Input
                                        label="Draw Points"
                                        type="number"
                                        value={scoring.drawPoints}
                                        onChange={(e) => setScoring({ ...scoring, drawPoints: e.target.value })}
                                    />
                                    <Input
                                        label="Loss Points"
                                        type="number"
                                        value={scoring.lossPoints}
                                        onChange={(e) => setScoring({ ...scoring, lossPoints: e.target.value })}
                                    />
                                </div>
                                <div className="pt-2 space-y-1">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Goal Difference Tiebreaker</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Use GD to break ties in standings</p>
                                        </div>
                                        <Toggle
                                            checked={scoring.tiebreaker_gd}
                                            onChange={(val) => setScoring({ ...scoring, tiebreaker_gd: val })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Head-to-Head Tiebreaker</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Use H2H record to break ties</p>
                                        </div>
                                        <Toggle
                                            checked={scoring.tiebreaker_h2h}
                                            onChange={(val) => setScoring({ ...scoring, tiebreaker_h2h: val })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div variants={fadeUp}>
                        <Card elevated className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold tracking-widest uppercase text-red-600">Danger Zone</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Reset League Data</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Clear all matches, scores, and standings</p>
                                    </div>
                                    <Button variant="danger" size="sm" onClick={() => setResetModalOpen(true)}>
                                        Reset
                                    </Button>
                                </div>
                                <div className="border-t border-gray-50" />
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Delete League</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Permanently delete this league and all data</p>
                                    </div>
                                    <Button variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>
                                        Delete
                                    </Button>
                                </div>
                                <div className="border-t border-gray-50" />
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Export Data</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Download all league data as JSON</p>
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={() => success('Data export started. Check your downloads.')}>
                                        Export
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="flex justify-end pt-4">
                        <Button variant="primary" className="px-12" onClick={() => success('Settings saved successfully.')}>
                            Save Changes
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Confirm Modals */}
            <ConfirmModal
                isOpen={resetModalOpen}
                onClose={() => setResetModalOpen(false)}
                onConfirm={() => { setResetModalOpen(false); success('League data has been reset.'); }}
                title="Reset League Data"
                message="This will permanently clear all match results, scores, and standings. Teams will be preserved. This action cannot be undone."
                confirmLabel="Reset All Data"
                variant="danger"
            />
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => { setDeleteModalOpen(false); success('League has been deleted.'); }}
                title="Delete League"
                message="This will permanently delete this league and all associated data including teams, matches, and standings. This action cannot be undone."
                confirmLabel="Delete League"
                variant="danger"
            />
        </PageLayout>
    );
}
