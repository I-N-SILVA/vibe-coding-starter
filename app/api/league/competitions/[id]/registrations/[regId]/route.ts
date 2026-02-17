import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { updateRegistrationApiSchema } from '@/lib/api/validation';

type RouteParams = { params: Promise<{ id: string; regId: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
    const { id, regId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, updateRegistrationApiSchema);
    if (parsed.error) return parsed.error;

    const { data, error } = await supabase
        .from('competition_registrations')
        .update(parsed.data)
        .eq('id', regId)
        .eq('competition_id', id)
        .eq('organization_id', auth.orgId)
        .select()
        .single();

    if (error) {
        return apiError(error.message, error.code === 'PGRST116' ? 404 : 500);
    }

    return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
    const { id, regId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { error } = await supabase
        .from('competition_registrations')
        .delete()
        .eq('id', regId)
        .eq('competition_id', id)
        .eq('organization_id', auth.orgId);

    if (error) {
        return apiError(error.message, 500);
    }

    return new NextResponse(null, { status: 204 });
}
