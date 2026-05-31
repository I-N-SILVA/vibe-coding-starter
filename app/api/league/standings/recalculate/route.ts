import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserOrgId, apiError, parseBody, validateResourceOwner } from '@/lib/api/helpers';
import { recalculateCompetitionStandings } from '@/lib/standings/recalculate';
import { log } from '@/lib/logger';

const bodySchema = z.object({ competitionId: z.string().uuid() });

/**
 * POST /api/league/standings/recalculate
 *
 * Recalculates standings for a competition the caller's organization owns.
 * Requires an authenticated org member; the competition must belong to their org.
 * Internal post-match recalculation calls `recalculateCompetitionStandings`
 * directly (in-process) rather than hitting this route.
 *
 * Body: { competitionId: string }
 */
export async function POST(request: Request) {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { data, error } = await parseBody(request, bodySchema);
    if (error) return error;

    const ownerError = await validateResourceOwner(
        supabase,
        'competitions',
        data.competitionId,
        auth.orgId!,
    );
    if (ownerError) return ownerError;

    let admin;
    try {
        admin = createAdminClient();
    } catch {
        return apiError('Server configuration error', 503);
    }

    try {
        const { teamsUpdated } = await recalculateCompetitionStandings(admin, data.competitionId);
        return NextResponse.json({
            message: `Standings recalculated for ${teamsUpdated} teams`,
            teamsUpdated,
        });
    } catch (err) {
        log.error('[Standings] Recalculation failed', {
            error: err instanceof Error ? err.message : String(err),
            competitionId: data.competitionId,
        });
        return apiError('Failed to recalculate standings', 500);
    }
}
