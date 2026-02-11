'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/plyaz';
import Image from 'next/image';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const FAQS = [
  {
    q: 'What exactly is PLYAZ?',
    a: 'PLYAZ is a professional match and tournament management ecosystem. We provide the digital infrastructure (live scores, stats, player profiles) that keeps grassroots and academy football professional and visible.',
  },
  {
    q: 'Is it really free to start?',
    a: 'Yes. You can create your first league and register up to 4 teams for free. As your competition grows, we offer premium tiers with advanced features like referee pilot panels and deep analytics.',
  },
  {
    q: 'How do I register as a player?',
    a: 'Players are typically invited by their Team Manager or League Organizer via a unique invite code. Once you have your code, you can create your profile and start tracking your stats.',
  },
  {
    q: 'Can scouts really see my profile?',
    a: 'Absolutely. Public profiles are visible to everyone, including our network of partner scouts and academies. High performance in a PLYAZ-managed league increases your digital footprint and scout visibility.',
  },
  {
    q: 'What makes your referee panel different?',
    a: 'Most apps are just spreadsheets. Our referee panel is a high-touch, mobile-optimized control room. It handles live timers, goal recording, and substitutions with massive touch targets designed for use in all weather conditions.',
  },
  {
    q: 'Do you support knockout tournaments?',
    a: 'Yes. Our fixture generator supports Round Robin (League), Knockout (Cup), and multi-stage (Group + Knockout) formats out of the box.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="px-6 py-6 flex justify-between items-center border-b border-gray-50 bg-white sticky top-0 z-50">
        <a href="/" className="flex items-center gap-2">
          <Image src="/static/branding/logo-circle.png" alt="Plyaz" width={28} height={28} />
          <span className="text-xs font-bold tracking-[0.2em] uppercase">PLYAZ</span>
        </a>
        <div className="flex gap-6">
          <a href="/login" className="text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-orange-500 transition-colors pt-3">Sign In</a>
          <Button variant="primary" size="sm" onClick={() => window.location.href = '/league/create'}>Start League</Button>
        </div>
      </nav>

      <section className="px-6 py-24 bg-gray-50 border-b border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-500/5 blur-[120px] rounded-full" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <p className="text-xs font-bold tracking-[0.4em] text-orange-500 uppercase mb-4">Support</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              Everything you need to know about starting your league or building your player profile.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto divide-y divide-gray-100">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="py-10"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">{faq.q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 bg-gray-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-400 mb-10 text-sm">Our support team is active pitch-side and digitally. Direct all inquiries to our help desk.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" onClick={() => window.location.href = '/contact'}>Contact Support</Button>
            <a href="mailto:help@plyaz.co.uk" className="px-8 py-4 border border-gray-700 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors pt-5">
              Email help@plyaz.co.uk
            </a>
          </div>
        </div>
      </section>

      <footer className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <Image src="/static/branding/logo-circle.png" alt="Plyaz" width={24} height={24} />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">PLYAZ &copy; 2025</span>
          </div>
          <div className="flex gap-8">
            {['Features', 'Matches', 'Terms', 'Privacy'].map((item) => (
              <a key={item} href={`/${item.toLowerCase()}`} className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-orange-500 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
