import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';

export async function GET() {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('organization_id', auth.orgId)
        .eq('role', 'referee')
        .order('full_name');

    if (error) return apiError(error.message, 500);
    return NextResponse.json(data ?? []);
}
