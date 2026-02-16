import { NextResponse } from 'next/server';
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // In production, this would connect to a mailing service (Mailchimp, ConvertKit, etc.)
    // or store in Supabase. For now, we log and return success.
    log.info('Newsletter signup', { email });

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed to the newsletter!' },
      { status: 200 }
    );
  } catch (error) {
    log.error('Newsletter subscription failed', { error: String(error) });
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Newsletter API — use POST to subscribe.' },
    { status: 200 }
  );
}
