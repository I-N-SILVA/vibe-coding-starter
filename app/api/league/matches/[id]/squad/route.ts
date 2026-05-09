import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError, parseBody } from '@/lib/api/helpers';
import { z } from 'zod';
import { sendEmail, APP_URL } from '@/lib/email/send';
import { convocationEmail } from '@/lib/email/templates';

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

    // Fire convocation emails in the background — non-blocking
    try {
        const { data: matchData } = await supabase
            .from('matches')
            .select(
                'scheduled_at, venue, home_team_id, away_team_id, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)',
            )
            .eq('id', matchId)
            .single();

        if (matchData) {
            const homeTeam = Array.isArray(matchData.home_team)
                ? matchData.home_team[0]
                : matchData.home_team;
            const awayTeam = Array.isArray(matchData.away_team)
                ? matchData.away_team[0]
                : matchData.away_team;

            const emailPromises = parsed.data.selections.map(async (s) => {
                const { data: player } = await supabase
                    .from('players')
                    .select('name, profiles(email, full_name)')
                    .eq('id', s.player_id)
                    .single();

                if (!player) return;
                const profiles = Array.isArray(player.profiles)
                    ? player.profiles[0]
                    : player.profiles;
                const email = profiles?.email;
                if (!email) return;

                const playerTeamId = s.team_id;
                const isHomeTeam = playerTeamId === matchData.home_team_id;
                const opponent = isHomeTeam
                    ? (awayTeam?.name ?? 'Opponent')
                    : (homeTeam?.name ?? 'Opponent');
                const matchDate = matchData.scheduled_at
                    ? new Date(matchData.scheduled_at).toLocaleString('en-GB', {
                          dateStyle: 'full',
                          timeStyle: 'short',
                      })
                    : 'TBD';
                const matchUrl = `${APP_URL}/league/matches/${matchId}`;

                const { subject, html } = convocationEmail({
                    playerName: profiles?.full_name ?? player.name,
                    status: s.selection_status,
                    matchDate,
                    opponent,
                    venue: matchData.venue,
                    matchUrl,
                });

                await sendEmail({ to: email, subject, html });
            });

            Promise.allSettled(emailPromises).catch(() => {});
        }
    } catch {
        // Email failure must never affect the response
    }

    return NextResponse.json({ ok: true });
}
