import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';

export async function GET() {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    const { data: player } = await supabase
        .from('players')
        .select('id, team_id, name')
        .eq('profile_id', auth.userId)
        .eq('organization_id', auth.orgId)
        .maybeSingle();

    if (!player) return NextResponse.json({ status: 'no_player' });

    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select(
            `
            id, scheduled_at, venue, status, matchday,
            home_team:teams!home_team_id(id, name, short_name, logo_url),
            away_team:teams!away_team_id(id, name, short_name, logo_url)
        `,
        )
        .eq('organization_id', auth.orgId)
        .or(`home_team_id.eq.${player.team_id},away_team_id.eq.${player.team_id}`)
        .in('status', ['upcoming', 'scheduled'])
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (matchError) {
        return apiError(matchError.message, 500);
    }

    if (!match) return NextResponse.json({ status: 'no_match', player });

    const { data: lineup } = await supabase
        .from('match_lineups')
        .select('selection_status')
        .eq('match_id', match.id)
        .eq('player_id', player.id)
        .maybeSingle();

    return NextResponse.json({
        status: lineup?.selection_status ?? 'pending',
        match,
        player,
    });
}
