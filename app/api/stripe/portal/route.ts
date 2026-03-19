import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';
import { getStripe } from '@/lib/billing/stripe';

export async function POST() {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    
    if (auth.error) return auth.error;
    const { orgId } = auth;

    try {
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('stripe_customer_id')
            .eq('id', orgId)
            .single();

        if (orgError || !org?.stripe_customer_id) {
            return apiError('No active subscription found', 400);
        }

        const stripe = getStripe();
        const session = await stripe.billingPortal.sessions.create({
            customer: org.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/league/settings`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Portal Error:', err);
        return apiError(err.message || 'Internal Server Error', 500);
    }
}
