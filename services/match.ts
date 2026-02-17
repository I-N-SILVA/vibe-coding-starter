import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type MatchRow = Database['public']['Tables']['matches']['Row'];

/**
 * Match Service
 * Handles match scheduling, live updates, and results.
 */
export const matchService = {
    /**
     * Map database match to UI match
     */
    mapMatch(match: any) {
        if (!match) return null;
        return {
            ...match,
            homeTeam: match.homeTeam || match.home_team,
            awayTeam: match.awayTeam || match.away_team,
            homeScore: match.home_score,
            awayScore: match.away_score,
            matchTime: match.match_time,
            scheduledDate: match.scheduled_at,
        };
    },

    /**
     * Get matches with optional status/competition filters
     */
    async getMatches(params?: { status?: string; competitionId?: string }) {
        const supabase = createClient();
        let query = supabase.from('matches').select(`
            *,
            homeTeam:teams!matches_home_team_id_fkey(name, short_name, logo_url),
            awayTeam:teams!matches_away_team_id_fkey(name, short_name, logo_url)
        `);

        if (params?.status) {
            query = query.eq('status', params.status as any);
        }
        if (params?.competitionId) {
            query = query.eq('competition_id', params.competitionId);
        }

        const { data, error } = await query.order('scheduled_at', { ascending: true });
        if (error) throw error;

        return (data || []).map(m => matchService.mapMatch(m));
    },

    /**
     * Get a single match with details
     */
    async getMatch(id: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('matches')
            .select(`
                *,
                homeTeam:teams!matches_home_team_id_fkey(*),
                awayTeam:teams!matches_away_team_id_fkey(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return matchService.mapMatch(data);
    },

    /**
     * Update match score
     */
    async updateScore(matchId: string, homeScore: number, awayScore: number) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('matches')
            .update({
                home_score: homeScore,
                away_score: awayScore,
                status: 'live' // Automatically move to live if score is updated
            } as any)
            .eq('id', matchId)
            .select()
            .single();

        if (error) throw error;
        return matchService.mapMatch(data);
    },

    /**
     * Start a match
     */
    async startMatch(matchId: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('matches')
            .update({
                status: 'live',
                match_time: 0
            } as any)
            .eq('id', matchId)
            .select()
            .single();

        if (error) throw error;
        return matchService.mapMatch(data);
    },

    /**
     * End a match
     */
    async endMatch(matchId: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('matches')
            .update({ status: 'completed' } as any)
            .eq('id', matchId)
            .select()
            .single();

        if (error) throw error;
        return matchService.mapMatch(data);
    },

    /**
     * Create a new match
     */
    async createMatch(data: any) {
        const supabase = createClient();
        const { data: match, error } = await supabase
            .from('matches')
            .insert({
                competition_id: data.competitionId,
                home_team_id: data.homeTeamId,
                away_team_id: data.awayTeamId,
                scheduled_at: data.scheduledDate,
                venue_id: data.venueId,
                status: 'scheduled'
            } as any)
            .select()
            .single();

        if (error) throw error;
        return matchService.mapMatch(match);
    },

    /**
     * Get events for a match
     */
    async getMatchEvents(matchId: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('match_events')
            .select('*, player:players(full_name)')
            .eq('match_id', matchId)
            .order('minute', { ascending: true });

        if (error) throw error;
        return data; // Mapping might be needed for UI
    },

    /**
     * Add an event to a match
     */
    async addMatchEvent(data: any) {
        const supabase = createClient();
        const { data: event, error } = await supabase
            .from('match_events')
            .insert({
                match_id: data.matchId,
                player_id: data.playerId,
                event_type: data.type,
                minute: data.minute,
                notes: data.notes
            } as any)
            .select()
            .single();

        if (error) throw error;
        return event;
    }
};
