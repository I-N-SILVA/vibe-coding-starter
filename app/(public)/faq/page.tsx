'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PageLayout, PageHeader, Button, Card, CardContent } from '@/components/plyaz';

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
    <PageLayout title="SUPPORT PROTOCOL">
      <PageHeader
        label="Support"
        title="Frequently Asked Questions"
        description="Everything you need to know about starting your league or building your player profile."
      />

      <div className="max-w-3xl mx-auto mt-16 space-y-4">
        {FAQS.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
          >
            <Card elevated className="bg-neutral-50/50 dark:bg-neutral-900/30 border-neutral-100 dark:border-neutral-800 rounded-3xl overflow-hidden group hover:border-orange-500/30 transition-colors">
              <CardContent className="p-8">
                <h3 className="text-sm font-black text-neutral-900 dark:text-white mb-4 uppercase tracking-tight group-hover:text-orange-500 transition-colors">{faq.q}</h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed font-medium">{faq.a}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <section className="mt-24 pb-20 text-center">
        <div className="max-w-2xl mx-auto p-12 rounded-[2.5rem] bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xl shadow-black/10">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Still have questions?</h2>
          <p className="text-xs font-medium opacity-50 mb-10 uppercase tracking-widest leading-loose">Our support team is active pitch-side and digitally. <br />Direct all inquiries to our help desk.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
                variant="primary" 
                className="bg-orange-500 text-white hover:bg-orange-600 border-none h-12 px-8 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full"
                onClick={() => window.location.href = '/contact'}
            >
                Contact Support
            </Button>
            <a 
                href="mailto:help@plyaz.co.uk" 
                className="inline-flex items-center justify-center px-8 h-12 border border-neutral-700 dark:border-neutral-200 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
            >
                Email help@plyaz.co.uk
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
