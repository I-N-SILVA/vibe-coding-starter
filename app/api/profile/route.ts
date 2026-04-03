import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiError } from '@/lib/api/helpers';

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return apiError('Unauthorized', 401);
        }

        const body = await request.json() as Record<string, unknown>;

        // SECURITY: role changes must go through the admin-only update-role endpoint.
        // Accepting role from user input here would allow self-promotion to admin.
        // We use an explicit allowlist below to ensure restricted fields are excluded.

        const allowedFields = [
            'full_name', 'avatar_url', 'phone', 'bio',
            'position', 'jersey_number', 'nationality',
        ];

        const filtered = Object.fromEntries(
            Object.entries(body).filter(([key]) => allowedFields.includes(key))
        );

        if (Object.keys(filtered).length === 0) {
            return apiError('No valid fields to update', 400);
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ ...filtered, updated_at: new Date().toISOString() })
            .eq('id', user.id);

        if (updateError) {
            return apiError(updateError.message, 500);
        }

        return NextResponse.json({ success: true });
    } catch {
        return apiError('Internal server error', 500);
    }
}
