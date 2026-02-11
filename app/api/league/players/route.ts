import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const DEFAULT_PLAYERS = [
    { id: '1', name: 'James Smith', position: 'ST', jersey_number: 9, team_id: '1', status: 'active', stats: { goals: 12, assists: 5, yellow_cards: 2, red_cards: 0, appearances: 14 } },
    { id: '2', name: 'Marcus Johnson', position: 'CM', jersey_number: 8, team_id: '1', status: 'active', stats: { goals: 3, assists: 9, yellow_cards: 4, red_cards: 1, appearances: 16 } },
    { id: '3', name: 'David Williams', position: 'GK', jersey_number: 1, team_id: '2', status: 'active', stats: { goals: 0, assists: 0, yellow_cards: 1, red_cards: 0, appearances: 16 } },
    { id: '4', name: 'Carlos Rodriguez', position: 'LW', jersey_number: 11, team_id: '2', status: 'active', stats: { goals: 8, assists: 7, yellow_cards: 3, red_cards: 0, appearances: 15 } },
    { id: '5', name: 'Ryan Thompson', position: 'CB', jersey_number: 4, team_id: '3', status: 'active', stats: { goals: 1, assists: 0, yellow_cards: 5, red_cards: 1, appearances: 14 } },
    { id: '6', name: 'Ahmed Hassan', position: 'CAM', jersey_number: 10, team_id: '3', status: 'active', stats: { goals: 7, assists: 11, yellow_cards: 2, red_cards: 0, appearances: 16 } },
    { id: '7', name: 'Luke Wilson', position: 'RB', jersey_number: 2, team_id: '4', status: 'active', stats: { goals: 0, assists: 4, yellow_cards: 3, red_cards: 0, appearances: 13 } },
    { id: '8', name: 'Patrick O\'Brien', position: 'CF', jersey_number: 7, team_id: '4', status: 'injured', stats: { goals: 6, assists: 3, yellow_cards: 1, red_cards: 0, appearances: 10 } },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    const supabase = await createClient();

    try {
        let query = supabase.from('players').select('*');

        if (teamId) {
            query = query.eq('team_id', teamId);
        }

        const { data, error } = await query.order('name');

        if (error) {
            console.warn('Supabase error, falling back to demo data:', error.message);
            const filtered = teamId ? DEFAULT_PLAYERS.filter(p => p.team_id === teamId) : DEFAULT_PLAYERS;
            return NextResponse.json(filtered);
        }

        return NextResponse.json(data && data.length > 0 ? data : DEFAULT_PLAYERS);
    } catch (error) {
        console.error('API Error:', error);
        const filtered = teamId ? DEFAULT_PLAYERS.filter(p => p.team_id === teamId) : DEFAULT_PLAYERS;
        return NextResponse.json(filtered);
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json();
        const { data, error } = await supabase
            .from('players')
            .insert([body])
            .select();

        if (error) throw error;

        return NextResponse.json(data[0], { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json();
        const { id, ...updates } = body;

        const { data, error } = await supabase
            .from('players')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;

        return NextResponse.json(data[0]);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Player ID required' }, { status: 400 });

    const supabase = await createClient();

    try {
        const { error } = await supabase.from('players').delete().eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
