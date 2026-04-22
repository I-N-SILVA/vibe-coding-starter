'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    StatCard,
    Button,
    CompetitionSelector,
    SkeletonStatCard,
} from '@/components/plyaz';
import { adminNavItems, refereeNavItems, playerNavItems, coachNavItems } from '@/lib/constants/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useCompetitions } from '@/lib/hooks';
import { useQuery } from '@tanstack/react-query';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';

// Use components directly from recharts
const DynamicLineChart = LineChart;
const DynamicBarChart = BarChart;
const DynamicResponsiveContainer = ResponsiveContainer;
const DynamicXAxis = XAxis;
const DynamicYAxis = YAxis;
const DynamicTooltip = Tooltip;
const DynamicLine = Line;
const DynamicBar = Bar;
const DynamicCartesianGrid = CartesianGrid;

import { fadeUp, stagger } from '@/lib/animations';

export default function AnalyticsDashboard() {
    const { profile } = useAuth();
    const [selectedComp, setSelectedComp] = useState<string>('all');
    const { data: competitions = [] } = useCompetitions();

    const { data: analytics, isLoading } = useQuery({
        queryKey: ['analytics', selectedComp],
        queryFn: async () => {
            const url = `/api/league/analytics${selectedComp !== 'all' ? `?competitionId=${selectedComp}` : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch analytics');
            return res.json();
        }
    });

    const getNavItems = () => {
        if (!profile) return playerNavItems;
        switch (profile.role) {
            case 'admin':
            case 'organizer': return adminNavItems;
            case 'referee': return refereeNavItems;
            case 'player': return playerNavItems;
            case 'coach':
            case 'manager': return coachNavItems;
            default: return playerNavItems;
        }
    };

    const competitionOptions = [
        { id: 'all', name: 'All Competitions' },
        ...competitions.map(c => ({ id: c.id, name: c.name }))
    ];

    const stats = [
        { title: 'Total Goals', value: analytics?.stats?.totalGoals?.toString() || '0' },
        { title: 'Avg Goals/Match', value: analytics?.stats?.avgGoalsPerMatch || '0' },
        { title: 'Clean Sheets', value: analytics?.stats?.cleanSheets?.toString() || '0' },
        { title: 'Matches Played', value: analytics?.stats?.totalMatches?.toString() || '0' },
    ];

    return (
        <PageLayout navItems={getNavItems()} title="Analytics Dashboard">
            <PageHeader
                label="Performance Insights"
                title="League Statistics"
                rightAction={
                    <div className="flex items-center gap-3">
                        <CompetitionSelector
                            competitions={competitionOptions}
                            selected={selectedComp}
                            onChange={setSelectedComp}
                        />
                        <Button variant="secondary" size="sm" onClick={() => window.print()}>
                            Export Report
                        </Button>
                    </div>
                }
            />

            {/* Top Stats */}
            <motion.div
                initial="hidden"
                animate="show"
                variants={stagger}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
                {isLoading ? (
                    [1, 2, 3, 4].map((i) => (
                        <motion.div key={i} variants={fadeUp}>
                            <SkeletonStatCard />
                        </motion.div>
                    ))
                ) : (
                    stats.map((stat) => (
                        <motion.div key={stat.title} variants={fadeUp}>
                            <StatCard title={stat.title} value={stat.value} />
                        </motion.div>
                    ))
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
                {/* Scoring Trend */}
                <Card padding="lg">
                    <div className="mb-6">
                        <h2 className="text-xs font-black tracking-[0.2em] uppercase text-gray-900">
                            Goals Trend
                        </h2>
                        <p className="text-[10px] text-gray-400 uppercase mt-1">Total goals over time</p>
                    </div>
                    <div className="h-[300px] w-full">
                        {isLoading ? (
                            <div className="w-full h-full bg-gray-50 animate-pulse rounded-xl" />
                        ) : (
                            <DynamicResponsiveContainer width="100%" height="100%">
                                <DynamicLineChart data={analytics?.goalsTrend || []}>
                                    <DynamicCartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <DynamicXAxis
                                        dataKey="label"
                                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <DynamicYAxis
                                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <DynamicTooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                    <DynamicLine
                                        type="monotone"
                                        dataKey="goals"
                                        stroke="#F97316"
                                        strokeWidth={4}
                                        dot={{ r: 4, fill: '#F97316', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </DynamicLineChart>
                            </DynamicResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Team Comparison */}
                <Card padding="lg">
                    <div className="mb-6">
                        <h2 className="text-xs font-black tracking-[0.2em] uppercase text-gray-900">
                            Top Teams Performance
                        </h2>
                        <p className="text-[10px] text-gray-400 uppercase mt-1">Goals Scored vs Conceded</p>
                    </div>
                    <div className="h-[300px] w-full">
                        {isLoading ? (
                            <div className="w-full h-full bg-gray-50 animate-pulse rounded-xl" />
                        ) : (
                            <DynamicResponsiveContainer width="100%" height="100%">
                                <DynamicBarChart data={analytics?.teamComparison || []}>
                                    <DynamicCartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <DynamicXAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <DynamicTooltip
                                        cursor={{ fill: '#F9FAFB' }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                    <DynamicBar dataKey="goals" fill="#000000" radius={[4, 4, 0, 0]} barSize={24} />
                                    <DynamicBar dataKey="conceded" fill="#F97316" radius={[4, 4, 0, 0]} barSize={24} />
                                </DynamicBarChart>
                            </DynamicResponsiveContainer>
                        )}
                    </div>
                    <div className="mt-6 flex gap-6 justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-black rounded-full" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scored</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conceded</span>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </PageLayout>
    );
}
