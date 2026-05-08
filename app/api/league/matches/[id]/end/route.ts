import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';
import { log } from '@/lib/logger';

type RouteParams = { params: Promise<{ id: string }> };

async function fireWhatsAppNotifications(
    matchId: string,
    orgId: string,
    type: 'match_start' | 'full_time',
    message: string,
    baseUrl: string,
) {
    try {
        const supabase = await createClient();

        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('phone')
            .eq('organization_id', orgId)
            .not('phone', 'is', null);

        if (error || !profiles?.length) return;

        for (const profile of profiles) {
            if (!profile.phone) continue;

            fetch(`${baseUrl}/api/notifications/whatsapp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId,
                    type,
                    recipientPhone: profile.phone,
                    message,
                }),
            }).catch((err: unknown) => {
                log.warn('[WhatsApp] Fire-and-forget notification failed', {
                    error: err instanceof Error ? err.message : String(err),
                    matchId,
                    type,
                });
            });
        }
    } catch (err) {
        log.warn('[WhatsApp] Failed to query profiles for notifications', {
            error: err instanceof Error ? err.message : String(err),
            matchId,
        });
    }
}

export async function POST(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    // Verify match is live before ending AND belongs to user's org
    const { data: match } = await supabase
        .from('matches')
        .select('status, organization_id')
        .eq('id', id)
        .single();

    if (!match) return apiError('Match not found', 404);
    if (match.organization_id !== auth.orgId) {
        return apiError('Forbidden: Match belongs to another organization', 403);
    }

    if (match.status !== 'live') {
        return apiError(`Cannot end match with status "${match.status}". Match must be live.`, 409);
    }

    const { data, error } = await supabase
        .from('matches')
        .update({
            status: 'completed',
            ended_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    // Fire WhatsApp notifications in the background (non-blocking)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    fireWhatsAppNotifications(
        id,
        auth.orgId!,
        'full_time',
        'Full time! The match has ended. Check the app for results. 🏁',
        baseUrl,
    );

    return NextResponse.json(data);
}
