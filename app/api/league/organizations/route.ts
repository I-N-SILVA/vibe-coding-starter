import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getAuthUser, apiError, parseBody } from '@/lib/api/helpers';
import { createOrganizationApiSchema } from '@/lib/api/validation';
import { rateLimit } from '@/lib/api/rate-limit';

export async function GET() {
    const supabase = await createClient();
    const auth = await getAuthUser(supabase);
    if (auth.error) return auth.error;

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', auth.user!.id)
        .single();

    if (!profile?.organization_id) {
        return NextResponse.json(null);
    }

    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const limited = rateLimit(request, 5, 60_000); // 5 orgs/min
    if (limited) return limited;

    const supabase = await createClient();
    const auth = await getAuthUser(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, createOrganizationApiSchema);
    if (parsed.error) return parsed.error;

    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{ ...parsed.data, owner_id: auth.user!.id }])
        .select()
        .single();

    if (orgError) {
        return apiError(orgError.message, 500);
    }

    // Update the user's profile with the new org and admin role
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: org.id, role: 'admin' })
        .eq('id', auth.user!.id);

    if (profileError) {
        return apiError(profileError.message, 500);
    }

    return NextResponse.json(org, { status: 201 });
}
