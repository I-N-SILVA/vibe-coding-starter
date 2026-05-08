import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';

/**
 * POST /api/admin/enable-demo-recruiting
 *
 * Sets is_recruiting_players = true on all teams belonging to the
 * 'plyaz-demo-league' organisation so they surface in Discovery.
 * Uses the service-role client to bypass RLS.
 */
export async function POST() {
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
