import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';
import { rateLimit } from '@/lib/api/rate-limit';
import { z } from 'zod';

const schema = z.object({ code: z.string().min(1) });

// GET /api/league/invites/join?code=<slug>
// Returns org preview info for the universal join page — no auth required.
export async function GET(request: Request) {
    const limited = await rateLimit(request, 30, 60_000);
    if (limited) return limited;

    const url = new URL(request.url);
    const parsed = schema.safeParse({ code: url.searchParams.get('code') });
    if (!parsed.success) return apiError('Missing join code.', 400);

    const supabase = await createClient();

    const { data: org, error } = await supabase
        .from('organizations')
        .select('id, name, logo_url, slug')
        .eq('slug', parsed.data.code)
        .maybeSingle();

    if (error) return apiError(error.message, 500);
    if (!org) return apiError('No organisation found for this join code.', 404);

    return NextResponse.json({ id: org.id, name: org.name, logo_url: org.logo_url, slug: org.slug });
}

// POST /api/league/invites/join
// Authenticated user requests to join org via join code.
export async function POST(request: Request) {
    const limited = await rateLimit(request, 10, 60_000);
    if (limited) return limited;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError('Not authenticated.', 401);

    let body: { code?: string };
    try { body = await request.json(); } catch { return apiError('Invalid body.', 400); }

    if (!body.code) return apiError('Missing join code.', 400);

    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('slug', body.code)
        .maybeSingle();

    if (orgError) return apiError(orgError.message, 500);
    if (!org) return apiError('No organisation found for this join code.', 404);

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ organization_id: org.id, role: 'player', approval_status: 'pending' })
        .eq('id', user.id);

    if (updateError) return apiError(updateError.message, 500);

    await supabase.from('audit_logs').insert({
        organization_id: org.id,
        user_id: user.id,
        target_user_id: user.id,
        action: 'join_code_used',
        details: { slug: body.code, organization_id: org.id },
    });

    return NextResponse.json({ message: 'Join request sent.', organization_name: org.name }, { status: 200 });
}
