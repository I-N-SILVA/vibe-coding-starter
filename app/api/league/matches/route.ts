import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { DEFAULT_MATCHES } from '@/lib/constants/demo-data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get('competitionId');
    const status = searchParams.get('status'); // live, upcoming, completed

    const supabase = await createClient();

    try {
        let query = supabase.from('matches').select(`
      *,
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*)
    `);

        if (competitionId) {
            query = query.eq('competition_id', competitionId);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query.order('scheduled_at', { ascending: true });

        if (error) {
            console.warn('Supabase error, falling back to demo data:', error.message);
            // Basic filtering for demo data
            let filteredMatches = DEFAULT_MATCHES;
            if (status) {
                filteredMatches = filteredMatches.filter(m => m.status === status);
            }
            return NextResponse.json(filteredMatches);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error, falling back to demo data:', error);
        return NextResponse.json(DEFAULT_MATCHES);
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json();
        const { data, error } = await supabase
            .from('matches')
            .insert([body])
            .select();

        if (error) throw error;

        return NextResponse.json(data[0], { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json();
        const { id, ...updates } = body;

        const { data, error } = await supabase
            .from('matches')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;

        return NextResponse.json(data[0]);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
