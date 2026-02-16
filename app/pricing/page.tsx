'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/plyaz';
import Image from 'next/image';

import { fadeUpLarge } from '@/lib/animations';

const TIERS = [
  {
    name: 'Academy Free',
    price: '£0',
    desc: 'Perfect for small tournaments or individual team tracking.',
    features: [
      'Up to 4 Teams',
      'Full Squad Management',
      'Real-time Scorecards',
      'Basic League Standings',
      'Public Player Profiles',
    ],
    cta: 'Start for Free',
    featured: false,
  },
  {
    name: 'Pro League',
    price: '£29',
    priceSuffix: '/mo',
    desc: 'The complete toolkit for professional league organizers.',
    features: [
      'Unlimited Teams',
      'Referee Pilot Panel',
      'Fixture Auto-Scheduler',
      'Custom Point Rules',
      'Player Analytics & Heatmaps',
      'Priority Support',
    ],
    cta: 'Go Pro Now',
    featured: true,
  },
  {
    name: 'Enterprise / Assocation',
    price: 'Custom',
    desc: 'White-labeled solutions for large associations and governing bodies.',
    features: [
      'Multiple Multi-tenant Orgs',
      'Custom Domain Embedding',
      'Scout Network Integration',
      'Dedicated Account Manager',
      'API Access',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
];

export default function PricingPage() {
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

      <section className="px-6 py-24 md:py-32 bg-gray-900 text-white relative overflow-hidden text-center border-b border-gray-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[80%] bg-orange-500 rounded-full blur-[200px]" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="show" variants={fadeUpLarge}>
            <p className="text-xs font-bold tracking-[0.4em] text-orange-400 uppercase mb-6">Pricing</p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[0.9]">
              INVEST IN THE <br />
              <span className="text-orange-500 italic">NEXT LEVEL</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Start for free and scale as your competition grows.
              Professional grade management for any size.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24 md:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {TIERS.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`p-8 md:p-10 rounded-3xl flex flex-col h-full ${tier.featured
                  ? 'bg-gray-900 text-white shadow-2xl shadow-orange-500/10 ring-4 ring-orange-500/20'
                  : 'bg-white border border-gray-100'
                }`}
            >
              <div className="mb-10">
                <h3 className={`text-xs font-bold tracking-widest uppercase mb-6 ${tier.featured ? 'text-orange-500' : 'text-gray-400'}`}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black">{tier.price}</span>
                  {tier.priceSuffix && <span className={`text-sm ${tier.featured ? 'text-gray-400' : 'text-gray-400'}`}>{tier.priceSuffix}</span>}
                </div>
                <p className={`mt-4 text-sm leading-relaxed ${tier.featured ? 'text-gray-400' : 'text-gray-500'}`}>
                  {tier.desc}
                </p>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm font-medium">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span className={tier.featured ? 'text-gray-300' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.featured ? 'primary' : 'secondary'}
                fullWidth
                onClick={() => window.location.href = tier.price === 'Custom' ? '/contact' : '/login'}
                className="h-14 font-black uppercase tracking-widest text-xs"
              >
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 p-10 rounded-3xl bg-orange-50 border border-orange-100">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">Non-profit or Community Charity?</h3>
            <p className="text-sm text-gray-500">We offer specialized discounts and free Pro access for qualified community organizations.</p>
          </div>
          <Button variant="secondary" onClick={() => window.location.href = '/contact'}>Apply Now</Button>
        </div>
      </section>

      <footer className="px-6 py-24 bg-gray-50 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <Image src="/static/branding/logo-circle.png" alt="Plyaz" width={24} height={24} />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">PLYAZ &copy; 2025</span>
          </div>
          <div className="flex gap-8">
            {['Features', 'FAQ', 'Terms', 'Privacy'].map((item) => (
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
