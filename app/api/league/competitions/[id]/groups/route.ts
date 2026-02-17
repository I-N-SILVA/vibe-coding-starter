import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { createGroupApiSchema } from '@/lib/api/validation';
import { rateLimit } from '@/lib/api/rate-limit';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('competition_id', id)
        .order('display_order', { ascending: true });

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const limited = rateLimit(request, 5, 60_000);
    if (limited) return limited;

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, createGroupApiSchema);
    if (parsed.error) return parsed.error;

    const { data, error } = await supabase
        .from('groups')
        .insert([{ ...parsed.data, competition_id: id }])
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data, { status: 201 });
}
