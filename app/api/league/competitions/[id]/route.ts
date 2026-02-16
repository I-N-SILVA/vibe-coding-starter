import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { updateCompetitionApiSchema } from '@/lib/api/validation';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return apiError(error.message, error.code === 'PGRST116' ? 404 : 500);
    }

    return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, updateCompetitionApiSchema);
    if (parsed.error) return parsed.error;

    // ------------------------------------------------------------------
    // 3.5  Competition lifecycle: require >= 2 teams to activate
    // ------------------------------------------------------------------
    if (parsed.data.status === 'active') {
        const { count, error: countErr } = await supabase
            .from('teams')
            .select('id', { count: 'exact', head: true })
            .eq('competition_id', id);

        if (countErr) {
            return apiError(countErr.message, 500);
        }

        if ((count ?? 0) < 2) {
            return apiError(
                'Cannot activate competition: at least 2 teams are required',
                400
            );
        }
    }

    const { data, error } = await supabase
        .from('competitions')
        .update(parsed.data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { error } = await supabase
        .from('competitions')
        .delete()
        .eq('id', id);

    if (error) {
        return apiError(error.message, 500);
    }

    return new NextResponse(null, { status: 204 });
}
