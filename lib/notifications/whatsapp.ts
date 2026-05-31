import { log } from '@/lib/logger';

export type WhatsAppNotificationType = 'match_start' | 'goal' | 'full_time';

export interface WhatsAppPayload {
    matchId: string;
    type: WhatsAppNotificationType;
    recipientPhone: string;
    message: string;
}

type WhatsAppResult =
    | { sent: true }
    | {
          sent: false;
          reason: 'no_provider_configured' | 'provider_error' | 'delivery_failed';
          detail?: string;
      };

/**
 * Send a single WhatsApp notification via CallMeBot.
 *
 * Extracted from the API route so it can be called in-process (e.g. when a
 * match ends) instead of via an unauthenticated HTTP self-call. The HTTP route
 * wraps this with auth + rate limiting; internal callers invoke it directly.
 *
 * No-ops gracefully when CALLMEBOT_API_KEY is not configured.
 */
export async function sendWhatsAppNotification(payload: WhatsAppPayload): Promise<WhatsAppResult> {
    const { matchId, type, recipientPhone, message } = payload;
    const maskedPhone = recipientPhone.slice(0, 6) + '****';
    const apiKey = process.env.CALLMEBOT_API_KEY;

    if (!apiKey) {
        log.info('[WhatsApp] No CALLMEBOT_API_KEY configured — notification skipped', {
            matchId,
            type,
            recipientPhone: maskedPhone,
        });
        return { sent: false, reason: 'no_provider_configured' };
    }

    try {
        const encoded = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
            recipientPhone,
        )}&text=${encoded}&apikey=${encodeURIComponent(apiKey)}`;

        const resp = await fetch(url, { method: 'GET' });

        if (!resp.ok) {
            const text = await resp.text();
            log.warn('[WhatsApp] CallMeBot returned non-OK status', {
                status: resp.status,
                matchId,
                type,
            });
            return { sent: false, reason: 'provider_error', detail: text };
        }

        log.info('[WhatsApp] Notification sent', { matchId, type, recipientPhone: maskedPhone });
        return { sent: true };
    } catch (err) {
        log.error('[WhatsApp] Failed to call CallMeBot', {
            error: err instanceof Error ? err.message : String(err),
            matchId,
            type,
        });
        return { sent: false, reason: 'delivery_failed' };
    }
}
