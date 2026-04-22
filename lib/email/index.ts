import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Use custom domain if configured, otherwise fallback to Resend onboarding email
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'PLYAZ';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    if (!resend) {
        console.warn(`[Email MOCKED] To: ${to} | Subject: ${subject} | Length: ${html.length}`);
        console.warn('Set RESEND_API_KEY to send real emails.');
        return { data: { id: 'mock_email_id' }, error: null };
    }

    try {
        console.log(`[Email] Attempting to send via Resend to: ${to} from: ${FROM_EMAIL}`);
        
        const { data, error } = await resend.emails.send({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to,
            subject,
            html,
        });

        if (error) {
            console.error('[Email] Resend API Error:', JSON.stringify(error, null, 2));
            
            // Helpful tip for the common "unverified domain" error
            if (error.name === 'validation_error' && FROM_EMAIL.includes('plyaz.net')) {
                console.warn('TIP: You likely need to verify the domain "plyaz.net" in your Resend Dashboard or set EMAIL_FROM="onboarding@resend.dev" in your environment variables.');
            }
            
            return { data: null, error };
        }

        console.log('[Email] Sent successfully. ID:', data?.id);
        return { data, error: null };
    } catch (err) {
        console.error('[Email] Unexpected failure:', err);
        return { data: null, error: err };
    }
}

// --- Email Templates ---

export function getInvitationEmailTemplate(token: string, organizationName: string) {
    const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://plyaz.net'}/invites/accept?token=${token}`;
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://api.fontshare.com/v2/css?f[]=general-sans@700,500,400&display=swap');
                body { font-family: 'General Sans', sans-serif; background-color: #ffffff; color: #000000; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #eeeeee; border-radius: 24px; }
                .logo { font-size: 24px; font-weight: 700; letter-spacing: -0.05em; margin-bottom: 40px; }
                .title { font-size: 32px; font-weight: 700; line-height: 1.1; margin-bottom: 24px; text-transform: uppercase; letter-spacing: -0.02em; }
                .message { font-size: 16px; line-height: 1.6; color: #444444; margin-bottom: 32px; }
                .btn { display: inline-block; background: linear-gradient(135deg, #FFA132 0%, #FF4D00 100%); color: #ffffff !important; padding: 16px 40px; border-radius: 999px; text-decoration: none; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; }
                .footer { margin-top: 40px; font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 0.1em; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">PLYAZ.</div>
                <h1 class="title">Join the <br/><span style="color: #FF4D00;">Kinetic Order.</span></h1>
                <p class="message">You have been invited to join <strong>${organizationName}</strong> on PLYAZ, the premier platform for elite athletic management.</p>
                <a href="${inviteLink}" class="btn">+ Accept Invitation +</a>
                <div class="footer">
                    &copy; 2026 PLYAZ.NET — PROPELLING ELITE TALENT
                </div>
            </div>
        </body>
        </html>
    `;
}
