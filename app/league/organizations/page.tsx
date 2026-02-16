'use client';

import React, { useState } from 'react';
import {
    PageLayout,
    PageHeader,
    Card,
    Button,
    Badge,
    Input,
    Modal,
} from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { motion } from 'framer-motion';
import { stagger, fadeUp } from '@/lib/animations';

// Mock organizations for demonstration
const MOCK_ORGS = [
    { id: '1', name: 'Elite Premier League', slug: 'elite-premier', status: 'active', members: 12, color: 'bg-gray-900' },
    { id: '2', name: 'Youth Soccer Assoc', slug: 'youth-soccer', status: 'active', members: 45, color: 'bg-orange-600' },
    { id: '3', name: 'Corporate Cup', slug: 'corp-cup', status: 'pending', members: 8, color: 'bg-blue-600' },
];

export default function OrganizationsPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [orgs] = useState(MOCK_ORGS);

    return (
        <PageLayout navItems={adminNavItems} title="ORGANIZATIONS">
            <PageHeader
                label="Platform Management"
                title="Organizations & Tenants"
                rightAction={
                    <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
                        New Organization
                    </Button>
                }
            />

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {orgs.map((org) => (
                    <motion.div key={org.id} variants={fadeUp}>
                        <Card elevated hoverable className="h-full flex flex-col pt-8">
                            <div className="px-6 pb-6 flex-1 flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-2xl ${org.color} flex items-center justify-center text-2xl font-black text-white shadow-lg mb-6 transform -rotate-3 group-hover:rotate-0 transition-transform`}>
                                    {org.name[0]}
                                </div>

                                <Badge variant={org.status === 'active' ? 'default' : 'secondary'} className="mb-3">
                                    {org.status.toUpperCase()}
                                </Badge>

                                <h3 className="font-bold text-gray-900 text-lg mb-1">{org.name}</h3>
                                <p className="text-[10px] font-bold text-orange-500 tracking-widest uppercase mb-4">
                                    {org.slug}.plyaz.com
                                </p>

                                <div className="w-full pt-6 mt-auto border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex flex-col items-start">
                                        <span className="text-xl font-black text-gray-900">{org.members}</span>
                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Members</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="font-bold tracking-widest uppercase text-[10px] hover:text-orange-500">Manage ↗</Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Create Organization Modal */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create Organization"
            >
                <div className="space-y-6 pt-4">
                    <Input label="Organization Name" placeholder="e.g. Amateur Football League" />
                    <Input label="Subdomain / Slug" placeholder="e.g. amateur-league" />

                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Live Preview</p>
                        <p className="text-sm font-medium text-gray-900">https://<span className="text-orange-500 font-bold">your-slug</span>.plyaz.com</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button variant="ghost" fullWidth onClick={() => setIsCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" fullWidth onClick={() => setIsCreateOpen(false)}>
                            Provision Org
                        </Button>
                    </div>
                </div>
            </Modal>
        </PageLayout>
    );
}
