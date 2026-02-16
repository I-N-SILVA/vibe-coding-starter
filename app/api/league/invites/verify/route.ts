import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError, parseBody } from '@/lib/api/helpers';
import { acceptInviteApiSchema as verifyInviteApiSchema } from '@/lib/api/validation'; // Re-using schema
import { rateLimit } from '@/lib/api/rate-limit';

export async function POST(request: Request) {
    const limited = rateLimit(request, 20, 60_000); // More lenient rate limit for this check
    if (limited) return limited;

    const supabase = await createClient();
    
    const parsed = await parseBody(request, verifyInviteApiSchema);
    if (parsed.error) return parsed.error;

    const { token } = parsed.data;

    // Fetch and validate the invite
    const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select('invited_role, organization_id, email, expires_at')
        .eq('token', token)
        .eq('status', 'pending')
        .maybeSingle();

    if (inviteError) {
        return apiError(inviteError.message, 500);
    }

    if (!invite) {
        return apiError('Invalid or expired invitation token.', 404);
    }

    // Check if the invite has expired
    if (new Date(invite.expires_at) < new Date()) {
        return apiError('This invitation has expired.', 400);
    }
    
    // Return the role and organization ID associated with the invite
    return NextResponse.json({ 
        invited_role: invite.invited_role, 
        organization_id: invite.organization_id,
        email: invite.email // Also return the email to pre-fill the form
    });
}
