import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { createInviteApiSchema } from '@/lib/api/validation';
import { rateLimit } from '@/lib/api/rate-limit';
import { sendEmail, getInvitationEmailTemplate } from '@/lib/email';

export async function GET() {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('organization_id', auth.orgId)
        .order('created_at', { ascending: false });

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const limited = rateLimit(request, 10, 60_000);
    if (limited) return limited;

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, createInviteApiSchema);
    if (parsed.error) return parsed.error;

    const { role, ...inviteData } = parsed.data; // Extract 'role' to map to invited_role
    const { data, error } = await supabase
        .from('invites')
        .insert([{
            ...inviteData, // Spread the rest of the data (including 'type', 'competition_id', 'team_id', 'email')
            invited_role: role, // Use the extracted 'role' for 'invited_role'
            organization_id: auth.orgId,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }])
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    // Record audit log for sending an invite
    const { error: auditLogError } = await supabase
        .from('audit_logs')
        .insert({
            organization_id: auth.orgId,
            user_id: auth.id, // User who sent the invite (admin)
            target_user_id: null, // Target user is not yet known/authenticated
            action: 'invite_sent',
            details: {
                invite_id: data.id,
                invited_email: data.email,
                invited_role: data.invited_role,
                organization_id: auth.orgId,
            },
        });

    if (auditLogError) {
        console.error('Failed to write audit log for invite sent:', auditLogError);
    }
    
    // Send invitation email
    if (data.email) {
        const { data: org } = await supabase.from('organizations').select('name').eq('id', auth.orgId).single();
        const emailHtml = getInvitationEmailTemplate(data.token, org?.name || 'PLYAZ');
        await sendEmail({
            to: data.email,
            subject: `You've been invited to join ${org?.name || 'PLYAZ'}`,
            html: emailHtml,
        });
    }

    return NextResponse.json(data, { status: 201 });
}

