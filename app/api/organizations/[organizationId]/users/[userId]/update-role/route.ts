import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { updateUserRoleApiSchema } from '@/lib/api/validation';
import { rateLimit } from '@/lib/api/rate-limit';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ organizationId: string, userId: string }> }
) {
    const limited = rateLimit(request, 10, 60_000);
    if (limited) return limited;

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { organizationId, userId } = await params;

    // Authorization: Only 'admin' of the organization can update roles
    if (auth.orgId !== organizationId || auth.user.role !== 'admin') {
        return apiError('Forbidden: Only organization administrators can update user roles.', 403);
    }

    const parsed = await parseBody(request, updateUserRoleApiSchema);
    if (parsed.error) return parsed.error;

    const { role: newRole } = parsed.data;

    // Ensure the target user is part of the same organization
    const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, organization_id, role')
        .eq('id', userId)
        .eq('organization_id', organizationId)
        .single();

    if (profileError || !targetProfile) {
        return apiError('User not found in this organization.', 404);
    }

    // Update the user's role
    const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
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
            target_user_id: userId, // User whose role was updated
            action: 'role_changed',
            details: {
                old_role: targetProfile.role,
                new_role: newRole,
                organization_id: organizationId,
            },
        });

    if (auditLogError) {
        console.error('Failed to write audit log for role change:', auditLogError);
    }

    return NextResponse.json(data, { status: 200 });
}
