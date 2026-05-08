import { NextResponse } from 'next/server';
import { log } from '@/lib/logger';

export type WhatsAppNotificationType = 'match_start' | 'goal' | 'full_time';

interface WhatsAppPayload {
    matchId: string;
    type: WhatsAppNotificationType;
    recipientPhone: string;
    message: string;
}

export async function POST(request: Request) {
    let body: WhatsAppPayload;
    try {
        body = (await request.json()) as WhatsAppPayload;
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { matchId, type, recipientPhone, message } = body;

    if (!matchId || !type || !recipientPhone || !message) {
        return NextResponse.json(
            { error: 'Missing required fields: matchId, type, recipientPhone, message' },
            { status: 400 },
        );
    }

    const apiKey = process.env.CALLMEBOT_API_KEY;

    if (!apiKey) {
        log.info('[WhatsApp] No CALLMEBOT_API_KEY configured — notification queued', {
            matchId,
            type,
            recipientPhone: recipientPhone.slice(0, 6) + '****',
        });
        return NextResponse.json({ queued: true, reason: 'no_provider_configured' });
    }

    try {
        const encoded = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${recipientPhone}&text=${encoded}&apikey=${apiKey}`;

        const resp = await fetch(url, { method: 'GET' });

        if (!resp.ok) {
            const text = await resp.text();
            log.warn('[WhatsApp] CallMeBot returned non-OK status', {
                status: resp.status,
                body: text,
                matchId,
                type,
            });
            return NextResponse.json(
                { sent: false, reason: 'provider_error', detail: text },
                { status: 502 },
            );
        }

        log.info('[WhatsApp] Notification sent', {
            matchId,
            type,
            recipientPhone: recipientPhone.slice(0, 6) + '****',
        });

        return NextResponse.json({ sent: true });
    } catch (err) {
        log.error('[WhatsApp] Failed to call CallMeBot', {
            error: err instanceof Error ? err.message : String(err),
            matchId,
            type,
        });
        return NextResponse.json({ error: 'Notification delivery failed' }, { status: 500 });
    }
}
