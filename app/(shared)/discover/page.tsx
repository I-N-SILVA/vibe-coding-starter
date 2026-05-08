'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/plyaz';
import { DiscoveryBoard } from '@/components/plyaz/DiscoveryBoard';
import { useAuth } from '@/lib/auth/AuthProvider';
import { stagger, fadeUp } from '@/lib/animations';

export default function DiscoveryPage() {
    const { profile } = useAuth();

    return (
        <PageLayout title="DISCOVERY">
            <PageHeader
                label="Recruitment Marketplace"
                title="Find Your Next Opportunity"
                description="Browse teams looking for players or tournaments looking for referees."
            />

            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
                <motion.div variants={fadeUp}>
                    <Tabs defaultValue="teams" className="w-full">
                        <TabsList className="mb-8">
                            <TabsTrigger value="teams" className="px-8">
                                Teams
                            </TabsTrigger>
                            <TabsTrigger value="competitions" className="px-8">
                                Tournaments
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="teams">
                            <DiscoveryBoard
                                type="team"
                                userRole={profile?.role === 'referee' ? 'referee' : 'player'}
                            />
                        </TabsContent>

                        <TabsContent value="competitions">
                            <DiscoveryBoard
                                type="competition"
                                userRole={profile?.role === 'referee' ? 'referee' : 'player'}
                            />
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </motion.div>
        </PageLayout>
    );
}
