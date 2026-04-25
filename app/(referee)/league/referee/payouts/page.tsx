'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    PageLayout,
    PageHeader,
    Card,
    CardContent,
    Button,
    Badge,
    StatCard,
    NavIcons,
} from '@/components/plyaz';
import { useMatches } from '@/lib/hooks';
import { stagger, fadeUp } from '@/lib/animations';

export default function RefereePayoutsPage() {
    const { data: completedMatches = [], isLoading } = useMatches({ status: 'completed' });
    
    const totalEarnings = completedMatches.length * 45;
    const pendingBalance = totalEarnings; // Simple logic for now

    return (
        <PageLayout title="EARNINGS">
            <PageHeader
                label="Referee Payouts"
                title="Financial Overview"
                description="Manage your match fees, view payment history, and update your bank details."
            />

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-8"
            >
                {/* Stripe Connect CTA */}
                <motion.div variants={fadeUp}>
                    <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <CardContent className="p-8 relative z-10">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="max-w-md">
                                    <Badge variant="primary" className="mb-4 bg-orange-500 text-white border-none">Action Required</Badge>
                                    <h2 className="text-2xl font-black tracking-tight mb-2">Connect with Stripe</h2>
                                    <p className="text-slate-400 text-sm">
                                        To receive direct payouts to your bank account, you need to set up your Stripe Connect account. This process is secure and takes less than 2 minutes.
                                    </p>
                                </div>
                                <Button 
                                    className="bg-white text-slate-900 hover:bg-slate-100 whitespace-nowrap px-8"
                                    onClick={() => window.open('https://dashboard.stripe.com/register', '_blank')}
                                >
                                    Set Up Direct Payouts
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Earnings Stats */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard 
                        title="Available Balance" 
                        value={`$${pendingBalance.toFixed(2)}`} 
                        icon={<NavIcons.Dashboard />}
                        trend={{ value: 100, isPositive: true }}
                    />
                    <StatCard 
                        title="Total Earnings" 
                        value={`$${totalEarnings.toFixed(2)}`} 
                        icon={<NavIcons.Statistics />} 
                    />
                    <StatCard 
                        title="Matches Paid" 
                        value={completedMatches.length.toString()} 
                        icon={<NavIcons.Whistle />} 
                    />
                </motion.div>

                {/* Match History / Payout History */}
                <motion.div variants={fadeUp}>
                    <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-400 mb-4">
                        Recent Match Fees
                    </h2>
                    <Card>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-12 text-center animate-pulse">Loading history...</div>
                            ) : completedMatches.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-50">
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Match Date</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Fee</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {completedMatches.map((match) => (
                                                <tr key={match.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-5 text-sm font-bold">
                                                        {match.scheduled_at ? new Date(match.scheduled_at).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-5 text-sm font-black text-center tabular-nums">
                                                        $45.00
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <Badge variant="secondary">Pending</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <p className="text-sm text-slate-400">No completed matches found in your history.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </PageLayout>
    );
}
