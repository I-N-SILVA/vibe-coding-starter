import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ organizationId: string }> }
) {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { organizationId } = await params;

    // Authorization: Only 'admin' of the organization can view users
    if (auth.orgId !== organizationId || auth.user.role !== 'admin') {
        return apiError('Forbidden: Only organization administrators can view users.', 403);
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}
