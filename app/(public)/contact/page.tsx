'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate form submission
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <section className="px-6 py-24 bg-gray-50 border-b border-gray-100">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-xs font-bold tracking-[0.4em] text-orange-500 uppercase mb-4">Get in Touch</p>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Contact Us</h1>
                        <p className="text-gray-500 max-w-lg mx-auto">
                            Have questions about PLYAZ? Want to partner with us? We'd love to hear from you.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="px-6 py-24">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {submitted ? (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-3xl">✓</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Message Sent!</h3>
                                <p className="text-gray-500">We'll get back to you within 24 hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Subject</label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                                    >
                                        <option value="">Select a topic</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="partnership">Partnership Opportunity</option>
                                        <option value="league">League Management</option>
                                        <option value="support">Technical Support</option>
                                        <option value="press">Press & Media</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        placeholder="Tell us how we can help..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-14 bg-gray-900 text-white font-bold rounded-lg text-sm tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </button>
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
                        <div>
                            <h3 className="text-lg font-bold mb-2">Email Us</h3>
                            <a href="mailto:help@plyaz.co.uk" className="text-orange-600 hover:underline font-medium">
                                help@plyaz.co.uk
                            </a>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-2">Community</h3>
                            <a href="https://community.plyaz.co.uk/" className="text-orange-600 hover:underline font-medium">
                                community.plyaz.co.uk
                            </a>
                            <p className="text-sm text-gray-400 mt-1">Join 1,200+ players and coaches</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
                            <div className="flex flex-col gap-3">
                                <a href="https://x.com/Plyaz_" className="text-sm font-medium hover:text-orange-600 transition-colors">
                                    Twitter (X) → @Plyaz_
                                </a>
                                <a href="https://www.linkedin.com/company/plyaz" className="text-sm font-medium hover:text-orange-600 transition-colors">
                                    LinkedIn → PLYAZ
                                </a>
                                <a href="https://www.instagram.com/plyaz_/" className="text-sm font-medium hover:text-orange-600 transition-colors">
                                    Instagram → @plyaz_
                                </a>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                            <h3 className="text-lg font-bold mb-2">Partnership Inquiries</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Interested in partnering with PLYAZ? We work with academies, community trusts, and sports organizations.
                            </p>
                            <a
                                href="mailto:help@plyaz.co.uk?subject=Partnership Inquiry"
                                className="inline-block px-6 py-3 bg-orange-600 text-white text-sm font-bold rounded-full hover:bg-orange-700 transition-colors"
                            >
                                Get in Touch
                            </a>
                        </div>

                        <div className="pt-6">
                            <Image src="/static/branding/logo.png" alt="Plyaz" width={80} height={30} className="opacity-40" />
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
