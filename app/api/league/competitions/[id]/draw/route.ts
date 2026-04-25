import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { executeDrawApiSchema } from '@/lib/api/validation';
import { rateLimit } from '@/lib/api/rate-limit';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
    const limited = await rateLimit(request, 3, 60_000);
    if (limited) return limited;

    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, executeDrawApiSchema);
    if (parsed.error) return parsed.error;

    const { method, seeds } = parsed.data;

    // Fetch groups for this competition
    const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('id')
        .eq('competition_id', id);

    if (groupsError) {
        return apiError(groupsError.message, 500);
    }

    if (!groups || groups.length === 0) {
        return apiError('No groups found for this competition. Create groups first.', 400);
    }

    const groupIds = groups.map((g: { id: string }) => g.id);

    // Clear existing group_teams for this competition's groups
    const { error: clearError } = await supabase
        .from('group_teams')
        .delete()
        .in('group_id', groupIds);

    if (clearError) {
        return apiError(clearError.message, 500);
    }

    if (method === 'manual') {
        if (!seeds || seeds.length === 0) {
            return apiError('Seeds array is required for manual draw', 400);
        }

        const rows = seeds.map((s) => ({
            team_id: s.team_id,
            group_id: s.group_id,
            seed: s.seed,
        }));

        const { error: insertError } = await supabase
            .from('group_teams')
            .insert(rows);

        if (insertError) {
            return apiError(insertError.message, 500);
        }

        return NextResponse.json({ message: 'Manual draw completed', count: rows.length }, { status: 201 });
    }

    // Random draw
    const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id')
        .eq('competition_id', id);

    if (teamsError) {
        return apiError(teamsError.message, 500);
    }

    if (!teams || teams.length === 0) {
        return apiError('No teams found for this competition', 400);
    }

    const { randomDraw } = await import('@/lib/domain/draw-engine');
    const drawResults = randomDraw(teams, groupIds.length);

    const rows = drawResults.map((result) => ({
        team_id: result.teamId,
        group_id: groupIds[result.groupIndex],
        seed: 1, // Default seed for random draw
    }));

    const { error: insertError } = await supabase
        .from('group_teams')
        .insert(rows);

    if (insertError) {
        return apiError(insertError.message, 500);
    }

    return NextResponse.json({ message: 'Random draw completed', count: rows.length }, { status: 201 });
}
