import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { acceptInviteApiSchema } from '@/lib/api/validation';
import { rateLimit } from '@/lib/api/rate-limit';

export async function POST(request: Request) {
    const limited = rateLimit(request, 10, 60_000);
    if (limited) return limited;

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase); // This will return current user's org and profile
    if (auth.error) {
        // If no user is logged in, auth.error will contain a redirect to login.
        // The frontend should handle redirecting unauthenticated users to login/signup page
        // with the token in the URL, so they can accept after authentication.
        return apiError('User not authenticated.', 401);
    }

    const parsed = await parseBody(request, acceptInviteApiSchema);
    if (parsed.error) return parsed.error;

    const { token } = parsed.data;
    const { user } = auth; // Get the authenticated user's profile and id

    // 1. Fetch and validate the invite
    const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .lte('expires_at', new Date().toISOString()) // Filter for expired invites
        .maybeSingle();

    if (inviteError) {
        return apiError(inviteError.message, 500);
    }

    if (!invite) {
        return apiError('Invalid or expired invitation token.', 404);
    }

    // Check if the email associated with the invite matches the logged-in user's email
    // This is important for security to ensure only the invited person can accept.
    if (invite.email && invite.email !== user.email) {
        return apiError('This invitation is not for your email address.', 403);
    }

    // 2. Update user profile with organization_id, role, and approval_status
    const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
            organization_id: invite.organization_id,
            role: invite.invited_role, // Use the invited_role from the invite
            approval_status: 'approved', // Automatically approve upon invite acceptance
        })
        .eq('id', user.id);

    if (profileUpdateError) {
        return apiError(profileUpdateError.message, 500);
    }

    // 3. Update invite status
    const { error: updateInviteError } = await supabase
        .from('invites')
        .update({
            status: 'accepted',
            accepted_by: user.id,
            accepted_at: new Date().toISOString(),
        })
        .eq('id', invite.id);

    if (updateInviteError) {
        return apiError(updateInviteError.message, 500);
    }

    // 4. Record audit log
    const { error: auditLogError } = await supabase
        .from('audit_logs')
        .insert({
            organization_id: invite.organization_id,
            user_id: user.id, // User who accepted the invite
            target_user_id: user.id, // Target is the same user
            action: 'invite_accepted',
            details: {
                invite_id: invite.id,
                invited_role: invite.invited_role,
                organization_id: invite.organization_id,
            },
        });

    if (auditLogError) {
        console.error('Failed to write audit log for invite acceptance:', auditLogError);
        // Do not block the user if audit log fails, but log the error
    }

    return NextResponse.json({ message: 'Invitation accepted successfully.', profile: user }, { status: 200 });
}
