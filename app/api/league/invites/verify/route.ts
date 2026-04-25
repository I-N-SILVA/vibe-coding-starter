import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError, parseBody } from '@/lib/api/helpers';
import { acceptInviteApiSchema as verifyInviteApiSchema } from '@/lib/api/validation'; // Re-using schema
import { rateLimit } from '@/lib/api/rate-limit';

export async function POST(request: Request) {
    const limited = await rateLimit(request, 20, 60_000); // More lenient rate limit for this check
    if (limited) return limited;

    const supabase = await createClient();
    
    const parsed = await parseBody(request, verifyInviteApiSchema);
    if (parsed.error) return parsed.error;

    const { token } = parsed.data;

    // Fetch invite and join organization name in one query
    const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select('invited_role, organization_id, expires_at, organizations(name, logo_url)')
        .eq('token', token)
        .eq('status', 'pending')
        .maybeSingle();

    if (inviteError) {
        return apiError(inviteError.message, 500);
    }

    if (!invite) {
        return apiError('Invalid or expired invitation token.', 404);
    }

    if (new Date(invite.expires_at) < new Date()) {
        return apiError('This invitation has expired.', 400);
    }

    const org = Array.isArray(invite.organizations) ? invite.organizations[0] : invite.organizations;

    return NextResponse.json({
        invited_role: invite.invited_role,
        organization_id: invite.organization_id,
        organization_name: org?.name ?? null,
        organization_logo: org?.logo_url ?? null,
    });
}
