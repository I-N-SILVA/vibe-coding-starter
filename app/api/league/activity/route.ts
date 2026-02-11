import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    try {
        // Fetch recent match events with match and team details
        const { data, error } = await supabase
            .from('match_events')
            .select(`
                *,
                match:matches(
                    home_team:teams!home_team_id(name, short_name),
                    away_team:teams!away_team_id(name, short_name)
                )
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.warn('Supabase error fetching activity:', error.message);
            return NextResponse.json([]);
        }

        // Format events for activity display
        const activity = data.map((event: any) => {
            const homeName = event.match.home_team.name;
            const awayName = event.match.away_team.name;

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
                type: event.type
            };
        });

        return NextResponse.json(activity);
    } catch (error) {
        console.error('Activity API Error:', error);
        return NextResponse.json([]);
    }
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
