import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { createTeamApiSchema } from '@/lib/api/validation';
import { rateLimit } from '@/lib/api/rate-limit';

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
    const limited = await rateLimit(request, 10, 60_000);
    if (limited) return limited;

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;
    const { orgId } = auth;

    // Plan Enforcement
    const { data: org } = await supabase.from('organizations').select('plan').eq('id', orgId).single();
    const { count } = await supabase.from('teams').select('*', { count: 'exact', head: true }).eq('organization_id', orgId);
    const { checkPlanLimit } = await import('@/lib/billing/check-limits');
    const limitCheck = await checkPlanLimit(org?.plan || 'free', 'teams', count ?? 0);
    
    if (!limitCheck.allowed) {
        return NextResponse.json({ 
            error: limitCheck.message + ' Upgrade at /pricing',
            upgrade_required: true 
        }, { status: 403 });
    }

    const parsed = await parseBody(request, createTeamApiSchema);
    if (parsed.error) return parsed.error;

    // Validate competition belongs to this org (if provided)
    if (parsed.data.competition_id) {
        const { data: comp, error: compErr } = await supabase
            .from('competitions')
            .select('id')
            .eq('id', parsed.data.competition_id)
            .eq('organization_id', auth.orgId)
            .single();
        if (compErr || !comp) return apiError('Competition not found or access denied', 404);
    }

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
