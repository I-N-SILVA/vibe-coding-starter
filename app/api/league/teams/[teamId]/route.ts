import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';

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

    const body = await request.json();

    const { data, error } = await supabase
        .from('teams')
        .update(body)
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
