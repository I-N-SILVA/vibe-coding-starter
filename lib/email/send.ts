const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@plyaz.app';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'PLYAZ';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://plyaz.app';

interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
    if (!RESEND_API_KEY) {
        console.warn('[email] RESEND_API_KEY not set — email skipped');
        return;
    }
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        console.error('[email] Resend error:', err);
    }
}

export { APP_URL };
