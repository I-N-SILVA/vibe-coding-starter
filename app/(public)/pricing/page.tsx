'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PageLayout, PageHeader, Button } from '@/components/plyaz';
import { publicNavItems } from '@/lib/constants/navigation';
import { useOrganization } from '@/lib/hooks';
import { toast } from 'sonner';

const TIERS = [
  {
    name: 'Academy Free',
    id: 'free',
    price: '£0',
    desc: 'Perfect for small tournaments or individual team tracking.',
    features: [
      'Up to 4 Teams',
      'Full Squad Management',
      'Real-time Scorecards',
      'Basic League Standings',
      'Public Player Profiles',
    ],
    cta: 'Current Plan',
    featured: false,
  },
  {
    name: 'Pro League',
    id: 'pro',
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
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
  },
  {
    name: 'Elite Association',
    id: 'elite',
    price: '£99',
    priceSuffix: '/mo',
    desc: 'White-labeled solutions for large associations and governing bodies.',
    features: [
      'Multiple Multi-tenant Orgs',
      'Custom Domain Embedding',
      'Scout Network Integration',
      'Dedicated Account Manager',
      'API Access',
    ],
    cta: 'Upgrade to Elite',
    featured: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE_YEARLY,
  },
];

export default function PricingPage() {
  const { data: org } = useOrganization();
  const [loadingPrice, setLoadingPrice] = React.useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    if (!org) {
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    try {
      setLoadingPrice(priceId);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || 'Failed to create checkout session');
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setLoadingPrice(null);
    }
  };

  return (
    <PageLayout navItems={publicNavItems} title="PRICING PROTOCOL">
      <PageHeader
        label="Pricing"
        title="Invest in the Next Level"
        description="Start for free and scale as your competition grows. Professional grade management for any size."
      />

      <div className="grid md:grid-cols-3 gap-8 mt-16">
        {TIERS.map((tier, i) => {
          const isCurrent = org?.plan === tier.id;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`p-8 md:p-10 rounded-[2.5rem] flex flex-col h-full transition-all duration-500 hover:-translate-y-2 ${tier.featured
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xl shadow-orange-500/20 ring-4 ring-orange-500/20'
                : 'bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800'
                }`}
            >
              <div className="mb-10 text-center md:text-left">
                <h3 className={`text-[10px] font-bold tracking-[0.25em] uppercase mb-8 ${tier.featured ? (tier.featured && 'text-orange-500') : 'text-neutral-400 dark:text-neutral-500'}`}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline justify-center md:justify-start gap-1">
                  <span className="text-5xl font-black tracking-tighter">{tier.price}</span>
                  {tier.priceSuffix && <span className={`text-sm font-bold opacity-40`}>{tier.priceSuffix}</span>}
                </div>
                <p className={`mt-6 text-xs leading-relaxed font-medium opacity-60`}>
                  {tier.desc}
                </p>
              </div>

              <div className="h-[1px] w-full bg-neutral-200/50 dark:bg-neutral-800/50 mb-10" />

              <ul className="space-y-5 mb-12 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-4 text-xs font-bold tracking-tight uppercase">
                    <span className="text-orange-500">✓</span>
                    <span className="opacity-80">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.featured ? 'primary' : 'secondary'}
                fullWidth
                onClick={() => {
                  if (tier.id === 'free') return;
                  if (tier.priceId) handleCheckout(tier.priceId);
                }}
                disabled={isCurrent || (tier.id === 'free' && !!org) || !!loadingPrice}
                isLoading={loadingPrice === tier.priceId}
                className={`h-14 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl ${tier.featured ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}`}
              >
                {isCurrent ? 'Current Plan' : tier.cta}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <section className="mt-24 pb-20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 p-10 rounded-[2rem] bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-center md:text-left relative z-10">
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Non-profit or Community Charity?</h3>
            <p className="text-xs font-medium opacity-60 max-w-md uppercase tracking-wider">We offer specialized discounts and free Pro access for qualified community organizations.</p>
          </div>
          <Button 
            className="relative z-10 bg-orange-500 text-white hover:bg-orange-600 border-none px-8 h-12 text-[10px] font-bold tracking-widest rounded-full uppercase"
            onClick={() => window.location.href = '/contact'}
          >
            Apply Now
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
