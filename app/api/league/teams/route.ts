import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { DEFAULT_TEAMS } from '@/lib/constants/demo-data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get('competitionId');

    const supabase = await createClient();

    try {
        let query = supabase.from('teams').select('*');

        if (competitionId) {
            query = query.eq('competition_id', competitionId);
        }

        const { data, error } = await query.order('name');

        if (error) {
            console.warn('Supabase error, falling back to demo data:', error.message);
            return NextResponse.json(DEFAULT_TEAMS);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error, falling back to demo data:', error);
        return NextResponse.json(DEFAULT_TEAMS);
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json();
        const { data, error } = await supabase
            .from('teams')
            .insert([body])
            .select();

        if (error) throw error;

        return NextResponse.json(data[0], { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
