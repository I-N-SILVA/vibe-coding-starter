import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';

interface TrendItem {
    label: string;
    goals: number;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get('competitionId');

    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    try {
        // 1. Fetch Matches for basic stats
        let matchesQuery = supabase
            .from('matches')
            .select('*')
            .eq('organization_id', auth.orgId)
            .eq('status', 'completed');

        if (competitionId) {
            matchesQuery = matchesQuery.eq('competition_id', competitionId);
        }

        const { data: matches, error: matchesError } = await matchesQuery;
        if (matchesError) throw matchesError;

        const totalMatches = (matches || []).length;
        const totalGoals = (matches || []).reduce((acc, m) => acc + (m.home_score || 0) + (m.away_score || 0), 0);
        const avgGoalsPerMatch = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '0';

        // 2. Fetch Clean Sheets
        const cleanSheets = (matches || []).reduce((acc, m) => {
            let count = 0;
            if (m.home_score === 0) count++;
            if (m.away_score === 0) count++;
            return acc + count;
        }, 0);

        // 3. Goals Trend (grouped by matchday or week)
        const goalsTrend = (matches || []).reduce((acc: TrendItem[], m) => {
            const label = m.matchday ? `R${m.matchday}` : (m.scheduled_at ? new Date(m.scheduled_at).toLocaleDateString() : 'TBD');
            const existing = acc.find(item => item.label === label);
            const goals = (m.home_score || 0) + (m.away_score || 0);
            
            if (existing) {
                existing.goals += goals;
            } else {
                acc.push({ label, goals });
            }
            return acc;
        }, []).sort((a, b) => a.label.localeCompare(b.label)).slice(-10);

        // 4. Team Comparison (Top 5 teams by goals)
        let teamsQuery = supabase
            .from('teams')
            .select(`
                id,
                name,
                standings:standings(goals_for, goals_against)
            `)
            .eq('organization_id', auth.orgId);
        
        if (competitionId) {
            teamsQuery = teamsQuery.eq('competition_id', competitionId);
        }

        const { data: teamsData, error: teamsError } = await teamsQuery;
        if (teamsError) throw teamsError;

        const teamComparison = (teamsData || []).map(t => {
            // @ts-ignore - Supabase join type can be complex
            const s = t.standings?.[0] || { goals_for: 0, goals_against: 0 };
            return {
                name: t.name,
                goals: s.goals_for || 0,
                conceded: s.goals_against || 0
            };
        }).sort((a, b) => b.goals - a.goals).slice(0, 5);

        return NextResponse.json({
            stats: {
                totalGoals,
                avgGoalsPerMatch,
                cleanSheets,
                totalMatches
            },
            goalsTrend,
            teamComparison
        });
    } catch (err: unknown) {
        console.error('Analytics API Error:', err);
        return apiError(err instanceof Error ? err.message : 'Failed to fetch analytics', 500);
    }
}
