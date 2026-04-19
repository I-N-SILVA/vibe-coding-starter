import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';

type RouteParams = { params: Promise<{ id: string }> };

// GET - list invite codes for this competition
export async function GET(_request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('competition_id', id)
        .eq('organization_id', auth.orgId)
        .order('created_at', { ascending: false });

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

// POST - generate a new invite code for this competition
export async function POST(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    let body: { type?: string };
    try {
        body = await request.json();
    } catch {
        return apiError('Invalid request body', 400);
    }

    const type = body.type as 'team' | 'player';
    if (type !== 'team' && type !== 'player') {
        return apiError('type must be "team" or "player"', 400);
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let token = 'PLY-';
    for (let i = 0; i < 6; i++) token += chars[Math.floor(Math.random() * chars.length)];

    const { data, error } = await supabase
        .from('invites')
        .insert([{
            competition_id: id,
            organization_id: auth.orgId,
            type: type === 'team' ? 'team_join' : 'player_join',
            token,
            invited_role: type === 'team' ? 'manager' : 'player',
            status: 'pending',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }])
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data, { status: 201 });
}
