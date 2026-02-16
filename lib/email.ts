import { log } from '@/lib/logger';

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Send an email. Currently logs the email instead of sending.
 * To enable real emails, integrate Resend, SendGrid, or similar.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
    // TODO: Replace with actual email provider (Resend, SendGrid, etc.)
    log.info('Email send requested', { to, subject, htmlLength: html.length });

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Email] To: ${to} | Subject: ${subject}`);
    }
}

/**
 * Generate HTML for invitation emails.
 */
export function getInvitationEmailTemplate(token: string, organizationName: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';
    const inviteLink = `${baseUrl}/invites/accept?token=${token}`;

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Nunito Sans', sans-serif; background: #f9fafb; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 20px; font-weight: 900; letter-spacing: 0.1em; margin: 0;">PLYAZ</h1>
    </div>
    <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 12px;">You're Invited!</h2>
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      You've been invited to join <strong>${organizationName}</strong> on PLYAZ.
      Click the button below to accept your invitation and get started.
    </p>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${inviteLink}" style="display: inline-block; background: #000; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;">
        Accept Invitation
      </a>
    </div>
    <p style="color: #9ca3af; font-size: 11px; text-align: center;">
      This invitation expires in 7 days. If you didn't expect this, you can safely ignore it.
    </p>
  </div>
</body>
</html>`.trim();
}
