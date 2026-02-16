import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { updateScoreApiSchema } from '@/lib/api/validation';

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, updateScoreApiSchema);
    if (parsed.error) return parsed.error;

    // Verify match is live before allowing score update
    const { data: match } = await supabase
        .from('matches').select('status').eq('id', id).single();
    if (!match) return apiError('Match not found', 404);
    if (match.status !== 'live') {
        return apiError(`Cannot update score for match with status "${match.status}". Match must be live.`, 409);
    }

    const { data, error } = await supabase
        .from('matches')
        .update({ home_score: parsed.data.homeScore, away_score: parsed.data.awayScore })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}
