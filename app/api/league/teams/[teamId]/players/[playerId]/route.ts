import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { updatePlayerApiSchema } from '@/lib/api/validation';

type RouteParams = { params: Promise<{ teamId: string; playerId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    const { playerId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

    if (error) {
        return apiError(error.message, error.code === 'PGRST116' ? 404 : 500);
    }

    return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
    const { playerId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, updatePlayerApiSchema);
    if (parsed.error) return parsed.error;

    const { data, error } = await supabase
        .from('players')
        .update(parsed.data)
        .eq('id', playerId)
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
    const { playerId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

    if (error) {
        return apiError(error.message, 500);
    }

    return new NextResponse(null, { status: 204 });
}
