import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';
import { rateLimit } from '@/lib/api/rate-limit';

export async function POST(
    request: Request,
    { params }: { params: { organizationId: string, userId: string } }
) {
    const limited = rateLimit(request, 10, 60_000);
    if (limited) return limited;

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { organizationId, userId } = params;

    // Authorization: Only 'admin' of the organization can approve users
    if (auth.orgId !== organizationId || auth.user.role !== 'admin') {
        return apiError('Forbidden: Only organization administrators can approve users.', 403);
    }

    // Ensure the target user is part of the same organization and is pending
    const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, organization_id, approval_status')
        .eq('id', userId)
        .eq('organization_id', organizationId)
        .single();

    if (profileError || !targetProfile) {
        return apiError('User not found in this organization.', 404);
    }

    if (targetProfile.approval_status === 'approved') {
        return apiError('User is already approved.', 400);
    }

    // Update the user's approval_status
    const { data, error } = await supabase
        .from('profiles')
        .update({ approval_status: 'approved' })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    // Record audit log
    const { error: auditLogError } = await supabase
        .from('audit_logs')
        .insert({
            organization_id: organizationId,
            user_id: auth.id, // Admin who performed the action
            target_user_id: userId, // User who was approved
            action: 'user_approved',
            details: {
                organization_id: organizationId,
            },
        });

    if (auditLogError) {
        console.error('Failed to write audit log for user approval:', auditLogError);
    }

    return NextResponse.json(data, { status: 200 });
}
