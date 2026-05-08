import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/helpers';

export async function POST() {
    const supabase = await createClient();

    // Get the current authenticated user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return apiError('Unauthorized', 401);
    }

    // Use admin client to bypass RLS for the lookup and update
    const adminClient = createAdminClient();

    // Find the demo org by slug
    const { data: org, error: orgError } = await adminClient
        .from('organizations')
        .select('id, name')
        .eq('slug', 'plyaz-demo-league')
        .single();

    if (orgError || !org) {
        return apiError('Demo org not found — run the seed script first.', 404);
    }

    // Link the current user's profile to the demo org
    const { error: updateError } = await adminClient
        .from('profiles')
        .update({
            organization_id: org.id,
            role: 'admin',
            approval_status: 'approved',
        })
        .eq('id', user.id);

    if (updateError) {
        return apiError(updateError.message, 500);
    }

    return NextResponse.json({ success: true, org_name: org.name });
}
