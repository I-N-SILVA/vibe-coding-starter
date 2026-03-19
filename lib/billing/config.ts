export const PLAN_LIMITS = {
  free: {
    maxCompetitions: 1,
    maxTeams: 4,
    maxPlayers: 50,
    canChargeRegistrationFees: false,
    hasRefereePanel: false,
    hasFixtureScheduler: false,
    hasAdvancedAnalytics: false,
    platformFeePercent: 0,
  },
  pro: {
    maxCompetitions: 10,
    maxTeams: Infinity,
    maxPlayers: Infinity,
    canChargeRegistrationFees: true,
    hasRefereePanel: true,
    hasFixtureScheduler: true,
    hasAdvancedAnalytics: true,
    platformFeePercent: 5,
  },
  elite: {
    maxCompetitions: Infinity,
    maxTeams: Infinity,
    maxPlayers: Infinity,
    canChargeRegistrationFees: true,
    hasRefereePanel: true,
    hasFixtureScheduler: true,
    hasAdvancedAnalytics: true,
    platformFeePercent: 3,
  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

// Stripe Price IDs — set these in Stripe Dashboard, then add to env vars
export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY!,
  elite_yearly: process.env.STRIPE_PRICE_ELITE_YEARLY!,
};

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
