import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/billing/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { STRIPE_WEBHOOK_SECRET } from '@/lib/billing/config';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature')!;
    const stripe = getStripe();
    const supabase = createAdminClient();

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.metadata?.type === 'registration_fee') {
            const { competition_id, player_id, team_id, platform_fee_percent } = session.metadata;
            const amountTotal = session.amount_total || 0;
            const platformFee = Math.round(amountTotal * (Number(platform_fee_percent) / 100));

            // Update registration status
            const { error } = await supabase
                .from('competition_registrations')
                .upsert({
                    competition_id,
                    player_id,
                    team_id,
                    status: 'approved', // Or 'pending' based on flow
                    payment_status: 'paid',
                    registration_fee: amountTotal / 100,
                    platform_fee: platformFee / 100,
                    stripe_session_id: session.id,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'competition_id,player_id'
                });

            if (error) {
                console.error('Error updating registration after payment:', error);
                return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true });
}
