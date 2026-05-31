import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';
import { recalculateCompetitionStandings } from '@/lib/standings/recalculate';
import { log } from '@/lib/logger';

/**
 * POST /api/admin/recalculate-all-standings
 *
 * Maintenance op: recalculates standings for all active competitions.
 * Requires an authenticated admin/organizer (was previously unauthenticated).
 *
 * Points: Win = 3, Draw = 1, Loss = 0 (standard football rules)
 * Returns: { competitions: N, teams_updated: N }
 */
export async function POST() {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const role = (auth.user as { role?: string } | null)?.role;
    if (role !== 'admin' && role !== 'organizer') {
        return apiError('Forbidden: admin or organizer role required', 403);
    }

    let admin;
    try {
        admin = createAdminClient();
    } catch {
        return apiError('Server configuration error', 503);
    }

    const { data: competitions, error: compError } = await admin
        .from('competitions')
        .select('id, name')
        .eq('status', 'active');

    if (compError) {
        log.error('[Standings] Failed to load competitions', { error: compError.message });
        return apiError('Failed to load competitions', 500);
    }

    if (!competitions || competitions.length === 0) {
        return NextResponse.json({ competitions: 0, teams_updated: 0 });
    }

    let totalTeamsUpdated = 0;
    for (const comp of competitions) {
        try {
            const { teamsUpdated } = await recalculateCompetitionStandings(admin, comp.id);
            totalTeamsUpdated += teamsUpdated;
        } catch (err) {
            log.warn('[Standings] Recalculation failed for competition', {
                competitionId: comp.id,
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }

    return NextResponse.json({
        competitions: competitions.length,
        teams_updated: totalTeamsUpdated,
    });
}
