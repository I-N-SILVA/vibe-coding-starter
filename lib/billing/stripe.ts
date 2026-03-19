import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from './config';

// Singleton to avoid multiple instances in development
let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!stripe) {
    stripe = new Stripe(STRIPE_SECRET_KEY, { 
      apiVersion: '2025-01-27.acacia' as any
    });
  }
  return stripe;
}
