import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { createMatchApiSchema, updateMatchApiSchema } from '@/lib/api/validation';
import { rateLimit } from '@/lib/api/rate-limit';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get('competitionId');
    const status = searchParams.get('status');

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    let query = supabase.from('matches').select(`
        *,
        home_team:teams!home_team_id(*),
        away_team:teams!away_team_id(*)
    `);

    query = query.eq('organization_id', auth.orgId);

    if (competitionId) {
        query = query.eq('competition_id', competitionId);
    }

    if (status) {
        query = query.eq('status', status as 'completed' | 'upcoming' | 'live' | 'postponed' | 'cancelled');
    }

    const { data, error } = await query.order('scheduled_at', { ascending: true });

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const limited = rateLimit(request, 20, 60_000);
    if (limited) return limited;

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, createMatchApiSchema);
    if (parsed.error) return parsed.error;

    const { data, error } = await supabase
        .from('matches')
        .insert([{ ...parsed.data, organization_id: auth.orgId }])
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const raw = await request.json();
    const id = raw?.id;
    if (!id || typeof id !== 'string') {
        return apiError('Match ID is required', 400);
    }

    const parsed = updateMatchApiSchema.safeParse(raw);
    if (!parsed.success) {
        const messages = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        return apiError(messages, 400);
    }

    const { data, error } = await supabase
        .from('matches')
        .update(parsed.data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}
