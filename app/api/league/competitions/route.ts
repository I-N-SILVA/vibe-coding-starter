import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { createCompetitionApiSchema } from '@/lib/api/validation';
import { rateLimit } from '@/lib/api/rate-limit';
import type { SupabaseClient } from '@supabase/supabase-js';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function generateUniqueSlug(supabase: SupabaseClient, name: string, orgId: string): Promise<string> {
    const base = slugify(name).slice(0, 90) || 'league';
    let slug = base;
    let counter = 2;
    while (counter < 1000) {
        const { data } = await supabase
            .from('competitions')
            .select('id')
            .eq('organization_id', orgId)
            .eq('slug', slug)
            .maybeSingle();
        if (!data) return slug;
        slug = `${base}-${counter++}`;
    }
    // Extremely unlikely — fall back to a timestamp suffix
    return `${base}-${Date.now()}`;
}

export async function GET() {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('organization_id', auth.orgId)
        .order('created_at', { ascending: false });

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const limited = await rateLimit(request, 5, 60_000);
    if (limited) return limited;

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;
    const { orgId } = auth;

    // Plan Enforcement
    const { data: org } = await supabase.from('organizations').select('plan').eq('id', orgId).single();
    const { count } = await supabase.from('competitions').select('*', { count: 'exact', head: true }).eq('organization_id', orgId);
    const { checkPlanLimit } = await import('@/lib/billing/check-limits');
    const limitCheck = await checkPlanLimit(org?.plan || 'free', 'competitions', count ?? 0);
    
    if (!limitCheck.allowed) {
        return NextResponse.json({ 
            error: limitCheck.message + ' Upgrade at /pricing',
            upgrade_required: true 
        }, { status: 403 });
    }

    const parsed = await parseBody(request, createCompetitionApiSchema);
    if (parsed.error) return parsed.error;

    const slug = await generateUniqueSlug(supabase, parsed.data.name, auth.orgId);

    const { data, error } = await supabase
        .from('competitions')
        .insert([{ ...parsed.data, organization_id: auth.orgId, slug }])
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return NextResponse.json(data, { status: 201 });
}
