import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';

/**
 * POST /api/admin/enable-demo-recruiting
 *
 * Sets is_recruiting_players = true on all teams belonging to the
 * 'plyaz-demo-league' organisation so they surface in Discovery.
 * Requires an authenticated admin/organizer (was previously unauthenticated).
 * Uses the service-role client to bypass RLS for the write.
 */
export async function POST() {
    const authClient = await createClient();
    const auth = await getUserOrgId(authClient);
    if (auth.error) return auth.error;

    const role = (auth.user as { role?: string } | null)?.role;
    if (role !== 'admin' && role !== 'organizer') {
        return apiError('Forbidden: admin or organizer role required', 403);
    }

    let supabase;
    try {
        supabase = createAdminClient();
    } catch {
        return apiError('Server configuration error', 503);
    }

    // Resolve the demo organisation id by slug
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', 'plyaz-demo-league')
        .single();

    if (orgError || !org) {
        return apiError('Demo org not found — run the seed script first.', 404);
    }

    // Update all teams in that organisation
    const { data: updated, error: updateError } = await supabase
        .from('teams')
        .update({
            is_recruiting_players: true,
            recruitment_message: 'We are looking for talented players to join our squad!',
        })
        .eq('organization_id', org.id)
        .select('id');

    if (updateError) {
        return apiError(updateError.message, 500);
    }

    return NextResponse.json({ updated: updated?.length ?? 0 });
}
