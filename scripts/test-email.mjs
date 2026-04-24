import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    console.log('--- Resend Integration Test ---');
    
    if (!process.env.RESEND_API_KEY) {
        console.error('ERROR: RESEND_API_KEY is not set in .env.local');
        return;
    }

    const testEmailAddress = process.argv[2] || 'onboarding@resend.dev';
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    
    console.log(`Target: ${testEmailAddress}`);
    console.log(`From: PLYAZ <${fromEmail}>`);
    console.log(`API Key: ${process.env.RESEND_API_KEY.substring(0, 5)}...`);

    try {
        const { data, error } = await resend.emails.send({
            from: `PLYAZ <${fromEmail}>`,
            to: testEmailAddress,
            subject: 'Test Invitation - PLYAZ Kinetic Order',
            html: `
                <div style="font-family: sans-serif; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
                    <h1 style="color: #FF4D00; text-transform: uppercase;">Kinetic Order Test</h1>
                    <p>This is a test email to verify your Resend integration for <strong>PLYAZ</strong>.</p>
                    <p>If you received this, your API key and "From" address are working correctly.</p>
                </div>
            `,
        });

        if (error) {
            console.error('RESEND ERROR:', JSON.stringify(error, null, 2));
            if (error.name === 'validation_error') {
                console.log('\nTIP: "onboarding@resend.dev" can only send to your own email address.');
                console.log('TIP: To send to others, you must verify your domain in Resend.');
            }
        } else {
            console.log('SUCCESS! Email sent successfully.');
            console.log('Response ID:', data.id);
        }
    } catch (err) {
        console.error('UNEXPECTED FAILURE:', err);
    }
}

testEmail();
