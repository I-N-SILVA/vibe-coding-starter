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
} from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
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

const DEMO_COMPETITIONS = [
    { id: '1', name: 'Premier Division' },
    { id: '2', name: 'Sunday Cup' },
];

const goalsPerRound = [
    { round: 'R1', goals: 12 },
    { round: 'R2', goals: 18 },
    { round: 'R3', goals: 15 },
    { round: 'R4', goals: 22 },
    { round: 'R5', goals: 19 },
    { round: 'R6', goals: 25 },
];

const teamData = [
    { name: 'FC United', goals: 24, conceded: 8 },
    { name: 'City Rangers', goals: 18, conceded: 12 },
    { name: 'Phoenix FC', goals: 21, conceded: 15 },
    { name: 'Eagles', goals: 14, conceded: 19 },
    { name: 'Rovers', goals: 12, conceded: 22 },
];

import { fadeUp } from '@/lib/animations';

export default function AnalyticsDashboard() {
    const [selectedComp, setSelectedComp] = useState('1');

    return (
        <PageLayout navItems={adminNavItems} title="Analytics Dashboard">
            <PageHeader
                label="Performance Insights"
                title="League Statistics"
                rightAction={
                    <div className="flex items-center gap-3">
                        <CompetitionSelector
                            competitions={DEMO_COMPETITIONS}
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
                variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
                {[
                    { title: 'Total Goals', value: '111', trend: { value: 12, isPositive: true } },
                    { title: 'Avg Goals/Match', value: '2.8', trend: { value: 5, isPositive: true } },
                    { title: 'Clean Sheets', value: '42', trend: { value: 3, isPositive: true } },
                    { title: 'Matches Played', value: '38' },
                ].map((stat) => (
                    <motion.div key={stat.title} variants={fadeUp}>
                        <StatCard title={stat.title} value={stat.value} trend={stat.trend} />
                    </motion.div>
                ))}
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
                        <h2 className="text-xs font-bold tracking-wider uppercase text-gray-900">
                            Goals Trend
                        </h2>
                        <p className="text-[10px] text-gray-400 uppercase mt-1">Total goals per match day</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={goalsPerRound}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="round"
                                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="goals"
                                    stroke="#F97316"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#F97316', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Team Comparison */}
                <Card padding="lg">
                    <div className="mb-6">
                        <h2 className="text-xs font-bold tracking-wider uppercase text-gray-900">
                            Team Efficiency
                        </h2>
                        <p className="text-[10px] text-gray-400 uppercase mt-1">Goals Scored vs Conceded</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={teamData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F9FAFB' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar dataKey="goals" fill="#000000" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="conceded" fill="#F97316" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex gap-4 justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-black rounded-sm" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Scored</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-sm" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Conceded</span>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </PageLayout>
    );
}
