import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { createTeamApiSchema } from '@/lib/api/validation';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get('competitionId');

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    let query = supabase
        .from('teams')
        .select('*')
        .eq('organization_id', auth.orgId);

    if (competitionId) {
        query = query.eq('competition_id', competitionId);
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

    const parsed = await parseBody(request, createTeamApiSchema);
    if (parsed.error) return parsed.error;

    const { data, error } = await supabase
        .from('teams')
        .insert([{ ...parsed.data, organization_id: auth.orgId }])
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data, { status: 201 });
}
