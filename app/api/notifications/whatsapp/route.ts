import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser, apiError, parseBody } from '@/lib/api/helpers';
import { rateLimit } from '@/lib/api/rate-limit';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';

const whatsappSchema = z.object({
    matchId: z.string().uuid(),
    type: z.enum(['match_start', 'goal', 'full_time']),
    recipientPhone: z
        .string()
        .min(6)
        .max(20)
        .regex(/^\+?[0-9]+$/, 'Invalid phone number'),
    message: z.string().min(1).max(1000),
});

/**
 * POST /api/notifications/whatsapp
 *
 * Authenticated + rate-limited. Internal callers (e.g. match-end) use the
 * `sendWhatsAppNotification` lib function directly instead of this route, so
 * this endpoint no longer exposes unauthenticated outbound messaging.
 */
export async function POST(request: Request) {
    const limited = await rateLimit(request, 10, 60_000);
    if (limited) return limited;

    const supabase = await createClient();
    const auth = await getAuthUser(supabase);
    if (auth.error) return auth.error;

    const { data, error } = await parseBody(request, whatsappSchema);
    if (error) return error;

    const result = await sendWhatsAppNotification(data);

    if (!result.sent) {
        if (result.reason === 'no_provider_configured') {
            return NextResponse.json({ queued: true, reason: result.reason });
        }
        if (result.reason === 'provider_error') {
            return NextResponse.json({ sent: false, reason: result.reason }, { status: 502 });
        }
        return apiError('Notification delivery failed', 500);
    }

    return NextResponse.json({ sent: true });
}
