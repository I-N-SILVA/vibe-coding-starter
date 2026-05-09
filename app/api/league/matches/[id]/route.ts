import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError, getUserOrgId } from '@/lib/api/helpers';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('matches')
        .select(
            `
            *,
            home_team:teams!home_team_id(*),
            away_team:teams!away_team_id(*),
            referee:profiles!referee_id(id, full_name, avatar_url)
        `,
        )
        .eq('id', id)
        .single();

    if (error) {
        return apiError(error.message, error.code === 'PGRST116' ? 404 : 500);
    }

    return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const body = (await request.json()) as Record<string, unknown>;
    const { referee_rating } = body;

    if (typeof referee_rating !== 'number' || referee_rating < 1 || referee_rating > 5) {
        return apiError('referee_rating must be 1–5', 400);
    }

    const { error } = await supabase
        .from('matches')
        .update({ referee_rating })
        .eq('id', id)
        .eq('organization_id', auth.orgId);

    if (error) return apiError(error.message, 500);
    return NextResponse.json({ ok: true });
}
