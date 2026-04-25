import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';
import { rateLimit } from '@/lib/api/rate-limit';
import { z } from 'zod';

const getSchema = z.object({ token: z.string().min(1) });
const postSchema = z.object({
    token: z.string().min(1),
    guardian_name: z.string().min(2),
    image_rights_granted: z.boolean(),
    data_consent_granted: z.boolean(),
});

// GET /api/league/consent?token=<guardian_token>
// Public — returns player and competition preview for the consent page.
export async function GET(request: Request) {
    const limited = await rateLimit(request, 30, 60_000);
    if (limited) return limited;

    const url = new URL(request.url);
    const parsed = getSchema.safeParse({ token: url.searchParams.get('token') });
    if (!parsed.success) return apiError('Missing token.', 400);

    const supabase = await createClient();

    const { data: player, error } = await supabase
        .from('players')
        .select('id, name, is_minor, guardian_consented_at, guardian_relation, organizations(name)')
        .eq('guardian_token', parsed.data.token)
        .maybeSingle();

    if (error) return apiError(error.message, 500);
    if (!player) return apiError('Invalid or expired consent link.', 404);

    const org = Array.isArray(player.organizations) ? player.organizations[0] : player.organizations;

    return NextResponse.json({
        player_name: player.name,
        organisation_name: org?.name ?? null,
        already_consented: Boolean(player.guardian_consented_at),
        guardian_relation: player.guardian_relation,
    });
}

// POST /api/league/consent
// Submits guardian consent — no auth required (guardian may not have an account).
export async function POST(request: Request) {
    const limited = await rateLimit(request, 10, 60_000);
    if (limited) return limited;

    let body: unknown;
    try { body = await request.json(); } catch { return apiError('Invalid body.', 400); }

    const parsed = postSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Invalid request.', 400);

    if (!parsed.data.image_rights_granted || !parsed.data.data_consent_granted) {
        return apiError('Both consent checkboxes must be ticked.', 422);
    }

    const supabase = await createClient();

    const { data: player, error: fetchError } = await supabase
        .from('players')
        .select('id, guardian_consented_at')
        .eq('guardian_token', parsed.data.token)
        .maybeSingle();

    if (fetchError) return apiError(fetchError.message, 500);
    if (!player) return apiError('Invalid or expired consent link.', 404);
    if (player.guardian_consented_at) return NextResponse.json({ message: 'Consent already recorded.' });

    const { error: updateError } = await supabase
        .from('players')
        .update({
            guardian_name: parsed.data.guardian_name,
            guardian_consented_at: new Date().toISOString(),
            image_rights_granted: parsed.data.image_rights_granted,
            data_consent_granted: parsed.data.data_consent_granted,
        })
        .eq('id', player.id);

    if (updateError) return apiError(updateError.message, 500);

    return NextResponse.json({ message: 'Consent recorded successfully.' }, { status: 200 });
}
