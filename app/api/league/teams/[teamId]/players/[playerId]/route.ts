import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody, validateResourceOwner } from '@/lib/api/helpers';
import { updatePlayerApiSchema } from '@/lib/api/validation';

type RouteParams = { params: Promise<{ teamId: string; playerId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    const { teamId, playerId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const ownershipError = await validateResourceOwner(supabase, 'teams', teamId, auth.orgId!);
    if (ownershipError) return ownershipError;

    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .eq('team_id', teamId)
        .single();

    if (error) {
        return apiError(error.message, error.code === 'PGRST116' ? 404 : 500);
    }

    return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
    const { teamId, playerId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const ownershipError = await validateResourceOwner(supabase, 'teams', teamId, auth.orgId!);
    if (ownershipError) return ownershipError;

    const parsed = await parseBody(request, updatePlayerApiSchema);
    if (parsed.error) return parsed.error;

    const { data, error } = await supabase
        .from('players')
        .update(parsed.data)
        .eq('id', playerId)
        .eq('team_id', teamId)
        .eq('organization_id', auth.orgId!)
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
    const { teamId, playerId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const ownershipError = await validateResourceOwner(supabase, 'teams', teamId, auth.orgId!);
    if (ownershipError) return ownershipError;

    const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)
        .eq('team_id', teamId)
        .eq('organization_id', auth.orgId!);

    if (error) {
        return apiError(error.message, 500);
    }

    return new NextResponse(null, { status: 204 });
}
