import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { updateTeamApiSchema } from '@/lib/api/validation';

type RouteParams = { params: Promise<{ teamId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    const { teamId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('teams')
        .select(`
            *,
            players:players(count)
        `)
        .eq('id', teamId)
        .single();

    if (error) {
        return apiError(error.message, error.code === 'PGRST116' ? 404 : 500);
    }

    return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
    const { teamId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, updateTeamApiSchema);
    if (parsed.error) return parsed.error;

    const { data, error } = await supabase
        .from('teams')
        .update(parsed.data)
        .eq('id', teamId)
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
    const { teamId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

    if (error) {
        return apiError(error.message, 500);
    }

    return new NextResponse(null, { status: 204 });
}
