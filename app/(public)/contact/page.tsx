'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PageLayout, PageHeader, Button, Input, Card, CardContent } from '@/components/plyaz';
import { publicNavItems } from '@/lib/constants/navigation';
import { toast } from 'sonner';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.subject) {
            toast.error('Please select a subject');
            return;
        }

        setIsSubmitting(true);
        // Simulate form submission
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            toast.success('Message sent successfully!');
        }, 1500);
    };

    return (
        <PageLayout navItems={publicNavItems} title="CONTACT PLYAZ">
            <PageHeader
                label="Get in Touch"
                title="Contact Protocol"
                description="Have questions about PLYAZ? Our technical team is ready to assist with your deployment."
            />

            <div className="grid md:grid-cols-2 gap-16 mt-12">
                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {submitted ? (
                        <Card elevated className="bg-neutral-50/50 dark:bg-neutral-900/20 border-2 border-dashed border-emerald-500/30 rounded-3xl py-20">
                            <CardContent className="text-center">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-3xl text-emerald-500">✓</span>
                                </div>
                                <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-3 uppercase tracking-tight">Message Received</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Our team will respond within 24 hours.</p>
                                <Button 
                                    variant="ghost" 
                                    className="mt-8"
                                    onClick={() => setSubmitted(false)}
                                >
                                    Send another message
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Full Name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your full name"
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="you@example.com"
                            />
                            
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500 ml-1">Subject</label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select a topic</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="partnership">Partnership Opportunity</option>
                                    <option value="league">League Management</option>
                                    <option value="support">Technical Support</option>
                                    <option value="press">Press & Media</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500 ml-1">Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all"
                                    placeholder="Tell us how we can help..."
                                />
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                isLoading={isSubmitting}
                                className="h-14 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xl shadow-black/5 dark:shadow-white/5"
                            >
                                Send Protocol Message
                            </Button>
                        </form>
                    )}
                </motion.div>

                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-10"
                >
                    <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
                        <h3 className="text-[10px] font-bold tracking-[0.25em] text-orange-500 uppercase mb-6">Direct Channels</h3>
                        
                        <div className="space-y-8">
                            <div>
                                <p className="text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase mb-2">Technical Support</p>
                                <a href="mailto:help@plyaz.co.uk" className="text-xl font-black text-neutral-900 dark:text-white hover:text-orange-500 transition-colors">
                                    help@plyaz.co.uk
                                </a>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase mb-2">Network Community</p>
                                <a href="https://community.plyaz.co.uk/" className="text-xl font-black text-neutral-900 dark:text-white hover:text-orange-500 transition-colors">
                                    community.plyaz.co.uk
                                </a>
                                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 font-medium">Join 1,200+ validated operators</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-8">
                        <h3 className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 dark:text-neutral-500 uppercase mb-6">Network Nodes</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { name: 'Twitter (X)', handle: '@Plyaz_', href: 'https://x.com/Plyaz_' },
                                { name: 'LinkedIn', handle: 'PLYAZ', href: 'https://www.linkedin.com/company/plyaz' },
                                { name: 'Instagram', handle: '@plyaz_', href: 'https://www.instagram.com/plyaz_/' }
                            ].map((social) => (
                                <a 
                                    key={social.name}
                                    href={social.href} 
                                    className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:border-orange-500/50 hover:bg-orange-500/[0.02] transition-all group"
                                >
                                    <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-widest">{social.name}</span>
                                    <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 group-hover:text-orange-500 transition-colors">{social.handle} →</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl shadow-orange-500/20">
                        <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase mb-4 opacity-80">Strategic Partnerships</h3>
                        <p className="text-sm font-medium mb-6 leading-relaxed">
                            Interested in deploying PLYAZ at scale for your academy or federation?
                        </p>
                        <a
                            href="mailto:help@plyaz.co.uk?subject=Partnership Inquiry"
                            className="inline-flex h-11 px-6 items-center justify-center bg-white text-orange-600 text-[10px] font-bold tracking-widest rounded-full uppercase hover:scale-105 transition-transform"
                        >
                            Request Briefing
                        </a>
                    </div>
                </motion.div>
            </div>
        </PageLayout>
    );
}
