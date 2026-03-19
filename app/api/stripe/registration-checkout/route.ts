import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser, apiError } from '@/lib/api/helpers';
import { getStripe } from '@/lib/billing/stripe';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const auth = await getAuthUser(supabase);
        if (auth.error) return auth.error;
        const { user } = auth;

        const { competition_id, player_id, team_id, metadata } = await req.json();

        // 1. Fetch competition to get price and name
        const { data: competition, error: compError } = await supabase
            .from('competitions')
            .select('*, organization:organizations(plan)')
            .eq('id', competition_id)
            .single();

        if (compError || !competition) {
            return apiError('Competition not found', 404);
        }

        const registrationFee = competition.registration_fee || 0;
        if (registrationFee <= 0) {
            return apiError('This competition is free', 400);
        }

        // 2. Determine platform fee (PLYAZ cut)
        // Free: 0 (shouldn't reach here), Pro: 5%, Elite: 3%
        const orgPlan = (competition as any).organization?.plan || 'free';
        const { PLAN_LIMITS } = await import('@/lib/billing/config');
        const platformFeePercent = PLAN_LIMITS[orgPlan as keyof typeof PLAN_LIMITS]?.platformFeePercent || 5;
        
        // Stripe Application fee (if using Connect) is one way, 
        // but for now we just collect the full amount and will settle manually or via platform fee field in DB.
        // Actually, the prompt says "PLYAZ takes 5% platform cut".
        // Since we aren't using Connect yet, PLYAZ collects the full amount.

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'gbp', // Using GBP as per business logic symbols (£)
                        product_data: {
                            name: `Registration: ${competition.name}`,
                            description: `Player registration fee for ${competition.name}`,
                        },
                        unit_amount: Math.round(registrationFee * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/league/player/registration?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/league/player/registration?canceled=true`,
            customer_email: user.email,
            client_reference_id: user.id,
            metadata: {
                type: 'registration_fee',
                competition_id,
                player_id,
                team_id,
                user_id: user.id,
                organization_id: competition.organization_id,
                platform_fee_percent: platformFeePercent.toString(),
                ...metadata 
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Registration Checkout Error:', err);
        return apiError(err.message || 'Internal Server Error', 500);
    }
}
