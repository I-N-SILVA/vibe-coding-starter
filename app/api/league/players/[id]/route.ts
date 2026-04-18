import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { updatePlayerApiSchema } from '@/lib/api/validation';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .eq('organization_id', auth.orgId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return apiError('Player not found', 404);
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, updatePlayerApiSchema);
    if (parsed.error) return parsed.error;

    const { data, error } = await supabase
        .from('players')
        .update(parsed.data)
        .eq('id', id)
        .eq('organization_id', auth.orgId)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') return apiError('Player not found', 404);
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id)
        .eq('organization_id', auth.orgId);

    if (error) return apiError(error.message, 500);

    return NextResponse.json({ success: true });
}
