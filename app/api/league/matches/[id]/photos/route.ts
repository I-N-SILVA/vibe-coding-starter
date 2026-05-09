import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    const { id: matchId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { data, error } = await supabase
        .from('match_photos')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false });

    if (error) {
        if (error.code === '42P01') return NextResponse.json([]);
        return apiError(error.message, 500);
    }
    return NextResponse.json(data ?? []);
}

export async function POST(request: Request, { params }: RouteParams) {
    const { id: matchId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { photo_url, caption } = await request.json();
    if (!photo_url) return apiError('photo_url required', 400);

    const { error } = await supabase.from('match_photos').insert({
        match_id: matchId,
        photo_url,
        caption: caption ?? null,
        uploaded_by: auth.userId ?? null,
        organization_id: auth.orgId,
    });

    if (error) {
        if (error.code === '42P01') {
            return NextResponse.json(
                { error: 'Run match_photos migration first' },
                { status: 503 },
            );
        }
        return apiError(error.message, 500);
    }
    return NextResponse.json({ ok: true });
}
