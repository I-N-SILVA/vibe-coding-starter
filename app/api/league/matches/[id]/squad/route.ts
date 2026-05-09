import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { z } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    const { id: matchId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { data, error } = await supabase
        .from('match_lineups')
        .select('*, player:players(id, name, position, jersey_number, photo_url, team_id)')
        .eq('match_id', matchId);

    if (error) {
        if (error.code === '42P01') return NextResponse.json([]);
        return apiError(error.message, 500);
    }

    return NextResponse.json(data ?? []);
}

const upsertLineupSchema = z.object({
    selections: z.array(
        z.object({
            player_id: z.string().uuid(),
            team_id: z.string().uuid(),
            selection_status: z.enum(['starting', 'bench', 'not_called']),
            position_override: z.string().nullable().optional(),
            shirt_number: z.number().int().nullable().optional(),
        }),
    ),
});

export async function POST(request: Request, { params }: RouteParams) {
    const { id: matchId } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const parsed = await parseBody(request, upsertLineupSchema);
    if (parsed.error) return parsed.error;

    const rows = parsed.data.selections.map((s) => ({
        match_id: matchId,
        player_id: s.player_id,
        team_id: s.team_id,
        selection_status: s.selection_status,
        position_override: s.position_override ?? null,
        shirt_number: s.shirt_number ?? null,
        created_by: auth.userId ?? null,
        updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
        .from('match_lineups')
        .upsert(rows, { onConflict: 'match_id,player_id' });

    if (error) {
        if (error.code === '42P01') {
            return NextResponse.json(
                { error: 'Squad table not yet set up. Run the Supabase migration first.' },
                { status: 503 },
            );
        }
        return apiError(error.message, 500);
    }

    return NextResponse.json({ ok: true });
}
