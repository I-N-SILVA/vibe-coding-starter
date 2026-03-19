import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser, getUserOrgId, apiError } from '@/lib/api/helpers';
import { getStripe } from '@/lib/billing/stripe';

export async function POST(request: Request) {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    
    if (auth.error) return auth.error;
    const { orgId, user } = auth;

    try {
        const { priceId } = await request.json();
        if (!priceId) return apiError('Price ID is required', 400);

        // Get organization details
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('stripe_customer_id, name')
            .eq('id', orgId)
            .single();

        if (orgError || !org) return apiError('Organization not found', 404);

        const stripe = getStripe();
        let customerId = org.stripe_customer_id;

        // Create customer if not exists
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email!,
                name: org.name,
                metadata: { organization_id: orgId }
            });
            customerId = customer.id;
            
            // Save customer ID
            await supabase
                .from('organizations')
                .update({ stripe_customer_id: customerId })
                .eq('id', orgId);
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/league?upgraded=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
            metadata: { organization_id: orgId },
            subscription_data: { 
                metadata: { organization_id: orgId } 
            },
            allow_promotion_codes: true,
        }, {
            idempotencyKey: `checkout_${orgId}_${Date.now()}`
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return apiError(err.message || 'Internal Server Error', 500);
    }
}
