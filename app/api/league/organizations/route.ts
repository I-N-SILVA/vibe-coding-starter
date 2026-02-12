import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getAuthUser, apiError } from '@/lib/api/helpers';

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
    const supabase = await createClient();
    const auth = await getAuthUser(supabase);
    if (auth.error) return auth.error;

    const body = await request.json();

    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{ ...body, owner_id: auth.user!.id }])
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
