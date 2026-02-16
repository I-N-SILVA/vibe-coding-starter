import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { createInviteApiSchema } from '@/lib/api/validation';

export async function GET() {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('organization_id', auth.orgId)
        .order('created_at', { ascending: false });

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, createInviteApiSchema);
    if (parsed.error) return parsed.error;

    const { data, error } = await supabase
        .from('invites')
        .insert([{
            ...parsed.data,
            organization_id: auth.orgId,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }])
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data, { status: 201 });
}
