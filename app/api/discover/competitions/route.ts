import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 1), 100);
        const organizationId = searchParams.get('organizationId');

        let query = supabase
            .from('competitions')
            .select(`
                *,
                organization:organizations(id, name, logo_url)
            `)
            .eq('is_recruiting_referees', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }

        const { data: competitions, error } = await query;

        if (error) {
            console.error('Error fetching recruiting competitions:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: competitions });
    } catch (err) {
        console.error('Error in GET /api/discover/competitions:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
