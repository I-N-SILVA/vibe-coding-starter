import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/billing/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { STRIPE_WEBHOOK_SECRET } from '@/lib/billing/config';
import Stripe from 'stripe';

export const runtime = 'nodejs';

function getPlanFromPriceId(priceId: string): 'pro' | 'elite' | 'free' {
    if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY ||
        priceId === process.env.STRIPE_PRICE_PRO_YEARLY) return 'pro';
    if (priceId === process.env.STRIPE_PRICE_ELITE_YEARLY) return 'elite';
    return 'free';
}

export async function POST(request: Request) {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature')!;
    const stripe = getStripe();
    const supabase = createAdminClient();

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Webhook Error: ${message}`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.metadata?.organization_id;

    if (!orgId && event.type !== 'customer.subscription.deleted') {
        // Some events might not have orgId in metadata if not initiated by us, 
        // but for our core flow we expect it.
        console.warn(`No organization_id in metadata for event: ${event.type}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const subscriptionId = session.subscription as string;
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0].price.id;
                const plan = getPlanFromPriceId(priceId);

                await supabase
                    .from('organizations')
                    .update({
                        plan: plan,
                        stripe_subscription_id: subscriptionId,
                        stripe_customer_id: session.customer as string
                    })
                    .eq('id', orgId);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const priceId = subscription.items.data[0].price.id;
                const plan = getPlanFromPriceId(priceId);
                const status = subscription.status;

                let finalPlan: 'free' | 'pro' | 'elite' = plan;
                if (status !== 'active' && status !== 'trialing') {
                    finalPlan = 'free';
                }

                await supabase
                    .from('organizations')
                    .update({ plan: finalPlan })
                    .eq('stripe_subscription_id', subscription.id);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await supabase
                    .from('organizations')
                    .update({ 
                        plan: 'free',
                        stripe_subscription_id: null 
                    })
                    .eq('stripe_subscription_id', subscription.id);
                break;
            }

            case 'invoice.payment_succeeded': {
                // Ensure plan is correct on successful renewal
                // SDK v20 (API 2025-01-27): subscription is under parent.subscription_details
                const invoiceRaw = event.data.object as unknown as {
                    subscription?: string | null;
                    parent?: { subscription_details?: { subscription?: string | null } };
                };
                const subscriptionId = invoiceRaw.subscription
                    ?? invoiceRaw.parent?.subscription_details?.subscription;
                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
                    await supabase
                        .from('organizations')
                        .update({ plan })
                        .eq('stripe_subscription_id', subscriptionId);
                }
                break;
            }

            case 'invoice.payment_failed': {
                console.warn(`Payment failed for organization: ${orgId}`);
                // Could send email or trigger notification here
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error('Webhook processing error:', err instanceof Error ? err.message : err);
        // Always return 200 to Stripe to avoid retries on logic errors
        return NextResponse.json({ received: true });
    }
}
