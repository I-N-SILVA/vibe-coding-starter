import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId } from '@/lib/api/helpers';

interface MatchEventWithJoin {
    id: string;
    type: string;
    player_name?: string;
    created_at: string;
    match?: {
        organization_id: string;
        home_team: { name: string; short_name: string } | null;
        away_team: { name: string; short_name: string } | null;
    } | null;
}

export async function GET() {
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);

    // If not authenticated, return empty — activity is org-scoped
    if (auth.error) return NextResponse.json([]);

    const { data, error } = await supabase
        .from('match_events')
        .select(`
            *,
            match:matches(
                organization_id,
                home_team:teams!home_team_id(name, short_name),
                away_team:teams!away_team_id(name, short_name)
            )
        `)
        .eq('match.organization_id', auth.orgId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        return NextResponse.json([]);
    }

    const activity = ((data || []) as MatchEventWithJoin[])
        .filter((event) => event.match?.home_team && event.match?.away_team)
        .map((event) => {
            const homeName = event.match!.home_team!.name;
            const awayName = event.match!.away_team!.name;

            let action = '';
            let detail = '';

            switch (event.type) {
                case 'goal':
                    action = 'Goal Scored';
                    detail = `${event.player_name} (${homeName} vs ${awayName})`;
                    break;
                case 'yellow_card':
                    action = 'Yellow Card';
                    detail = `${event.player_name} (${homeName} vs ${awayName})`;
                    break;
                case 'red_card':
                    action = 'Red Card';
                    detail = `${event.player_name} (${homeName} vs ${awayName})`;
                    break;
                case 'substitution':
                    action = 'Substitution';
                    detail = `${homeName} vs ${awayName}`;
                    break;
                default:
                    action = event.type;
                    detail = `${homeName} vs ${awayName}`;
            }

            return {
                id: event.id,
                action,
                detail,
                time: formatDate(event.created_at),
                type: event.type,
            };
        });

    return NextResponse.json(activity);
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}
