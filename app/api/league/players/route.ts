import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { createPlayerApiSchema, updatePlayerApiSchema } from '@/lib/api/validation';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    let query = supabase
        .from('players')
        .select('*')
        .eq('organization_id', auth.orgId);

    if (teamId) {
        query = query.eq('team_id', teamId);
    }

    const { data, error } = await query.order('name');

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, createPlayerApiSchema);
    if (parsed.error) return parsed.error;

    const { data, error } = await supabase
        .from('players')
        .insert([{ ...parsed.data, organization_id: auth.orgId }])
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const raw = await request.json();
    const id = raw?.id;
    if (!id || typeof id !== 'string') {
        return apiError('Player ID is required', 400);
    }

    const parsed = updatePlayerApiSchema.safeParse(raw);
    if (!parsed.success) {
        const messages = parsed.error.issues.map((i) => `${String(i.path.join('.'))}: ${i.message}`).join('; ');
        return apiError(messages, 400);
    }

    const { data, error } = await supabase
        .from('players')
        .update(parsed.data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return apiError('Player ID required', 400);

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { error } = await supabase.from('players').delete().eq('id', id);

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json({ success: true });
}
