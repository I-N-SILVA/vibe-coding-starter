import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody, validateResourceOwner } from '@/lib/api/helpers';
import { createPlayerApiSchema } from '@/lib/api/validation';

type RouteParams = { params: Promise<{ teamId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    const { teamId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const ownershipError = await validateResourceOwner(supabase, 'teams', teamId, auth.orgId!);
    if (ownershipError) return ownershipError;

    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)
        .order('name');

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request, { params }: RouteParams) {
    const { teamId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const ownershipError = await validateResourceOwner(supabase, 'teams', teamId, auth.orgId!);
    if (ownershipError) return ownershipError;

    const parsed = await parseBody(request, createPlayerApiSchema);
    if (parsed.error) return parsed.error;

    const { data, error } = await supabase
        .from('players')
        .insert([{ ...parsed.data, team_id: teamId, organization_id: auth.orgId }])
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data, { status: 201 });
}
