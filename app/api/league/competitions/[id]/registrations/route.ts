import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { createRegistrationApiSchema } from '@/lib/api/validation';
import { rateLimit } from '@/lib/api/rate-limit';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    let query = supabase
        .from('competition_registrations')
        .select('*, team:teams(name)')
        .eq('competition_id', id)
        .eq('organization_id', auth.orgId)
        .order('registered_at', { ascending: false });

    if (auth.user.role === 'player') {
        const { data: players } = await supabase
            .from('players')
            .select('id')
            .eq('profile_id', auth.userId);

        const playerIds = players?.map(p => p.id) || [];

        if (playerIds.length === 0) {
            return NextResponse.json([]);
        }

        query = query.in('player_id', playerIds);
    }

    const { data, error } = await query;

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request, { params }: RouteParams) {
    const limited = rateLimit(request, 10, 60_000);
    if (limited) return limited;

    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, createRegistrationApiSchema);
    if (parsed.error) return parsed.error;

    const { data, error } = await supabase
        .from('competition_registrations')
        .insert([{
            ...parsed.data,
            competition_id: id,
            organization_id: auth.orgId,
        }])
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data, { status: 201 });
}
