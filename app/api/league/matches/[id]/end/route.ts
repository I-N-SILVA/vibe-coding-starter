import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    // Verify match is live before ending AND belongs to user's org
    const { data: match } = await supabase
        .from('matches')
        .select('status, organization_id')
        .eq('id', id)
        .single();
    
    if (!match) return apiError('Match not found', 404);
    if (match.organization_id !== auth.orgId) {
        return apiError('Forbidden: Match belongs to another organization', 403);
    }

    if (match.status !== 'live') {
        return apiError(`Cannot end match with status "${match.status}". Match must be live.`, 409);
    }

    const { data, error } = await supabase
        .from('matches')
        .update({
            status: 'completed',
            ended_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}
