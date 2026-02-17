import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { addGroupTeamApiSchema } from '@/lib/api/validation';
import { rateLimit } from '@/lib/api/rate-limit';

type RouteParams = { params: Promise<{ id: string; groupId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    const { groupId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('group_teams')
        .select('*, team:teams(*)')
        .eq('group_id', groupId);

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request, { params }: RouteParams) {
    const { groupId } = await params;
    const limited = rateLimit(request, 5, 60_000);
    if (limited) return limited;

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, addGroupTeamApiSchema);
    if (parsed.error) return parsed.error;

    const { data, error } = await supabase
        .from('group_teams')
        .insert([{ ...parsed.data, group_id: groupId }])
        .select('*, team:teams(*)')
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request, { params }: RouteParams) {
    const { groupId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');

    if (!teamId) {
        return apiError('team_id query parameter is required', 400);
    }

    const { error } = await supabase
        .from('group_teams')
        .delete()
        .eq('group_id', groupId)
        .eq('team_id', teamId);

    if (error) {
        return apiError(error.message, 500);
    }

    return new NextResponse(null, { status: 204 });
}
