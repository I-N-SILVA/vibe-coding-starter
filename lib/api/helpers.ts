import { NextResponse } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { ZodSchema } from 'zod';

/**
 * Standardized API error response
 */
export function apiError(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
}

/**
 * Get the authenticated user or return a 401 response.
 * Returns the user object or a NextResponse error.
 */
export async function getAuthUser(supabase: SupabaseClient) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        return { user: null, error: apiError('Unauthorized', 401) };
    }
    return { user, error: null };
}

/**
 * Get the authenticated user's organization_id.
 * Returns the org ID or a NextResponse error.
 */
export async function getUserOrgId(supabase: SupabaseClient) {
    const auth = await getAuthUser(supabase);
    if (auth.error) return { orgId: null, userId: null, error: auth.error };

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', auth.user!.id)
        .single();

    if (error || !profile?.organization_id) {
        return { orgId: null, userId: auth.user!.id, error: apiError('No organization found. Please create or join one first.', 403) };
    }

    return { orgId: profile.organization_id as string, userId: auth.user!.id, error: null };
}

/**
 * Parse and validate a request body against a Zod schema.
 * Returns typed data on success or a 400 error response on failure.
 */
export async function parseBody<T>(
    request: Request,
    schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
    try {
        const raw = await request.json();
        const result = schema.safeParse(raw);
        if (!result.success) {
            const messages = result.error.issues
                .map((i) => `${i.path.join('.')}: ${i.message}`)
                .join('; ');
            return { data: null, error: apiError(messages, 400) };
        }
        return { data: result.data, error: null };
    } catch {
        return { data: null, error: apiError('Invalid JSON body', 400) };
    }
}
