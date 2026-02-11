import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { DEFAULT_COMPETITIONS } from '@/lib/constants/demo-data';

export async function GET() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('competitions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('Supabase error, falling back to demo data:', error.message);
            return NextResponse.json(DEFAULT_COMPETITIONS);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error, falling back to demo data:', error);
        return NextResponse.json(DEFAULT_COMPETITIONS);
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json();
        const { data, error } = await supabase
            .from('competitions')
            .insert([body])
            .select();

        if (error) throw error;

        return NextResponse.json(data[0], { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
