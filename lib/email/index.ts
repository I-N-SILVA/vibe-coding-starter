import { NextResponse } from 'next/server';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

// In a real application, this would use an email provider like Resend, SendGrid, etc.
// For this example, we'll just log the email to the console.
export async function sendEmail({ to, subject, html }: EmailOptions) {
    console.log('--- Sending Email ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Body:');
    console.log(html);
    console.log('--- Email Sent (Logged to Console) ---');
    
    // Simulate a successful email send
    return { data: { id: 'mock_email_id' }, error: null };
}


// --- Email Templates ---

export function getInvitationEmailTemplate(token: string, organizationName: string) {
    const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/invites/accept?token=${token}`;
    
    return `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>You've been invited to join ${organizationName} on PLYAZ!</h2>
            <p>Click the link below to accept your invitation:</p>
            <a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
            <p style="margin-top: 20px; font-size: 12px; color: #777;">If you did not expect this invitation, you can safely ignore this email.</p>
        </div>
    `;
}
