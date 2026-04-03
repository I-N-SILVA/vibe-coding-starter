/**
 * Match Supabase Repository — PLYAZ League Manager
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './supabase.base';
import { IMatchRepository } from './types';
import { Match, MatchEvent } from '@/lib/supabase/types';

// Joined select — fetches home/away team inline, eliminating N+1 in match service
const MATCH_WITH_TEAMS_SELECT = `
    *,
    home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url),
    away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url)
`.trim();

export class MatchSupabaseRepository extends SupabaseBaseRepository<Match> implements IMatchRepository {
    constructor(client?: SupabaseClient) {
        super('matches', client);
    }

    override async findAll(filters?: Record<string, unknown>): Promise<Match[]> {
        let query = this.client.from(this.tableName).select(MATCH_WITH_TEAMS_SELECT);
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        const { data, error } = await query.order('scheduled_at', { ascending: true });
        if (error) throw error;
        return data as unknown as Match[];
    }

    override async findById(id: string): Promise<Match | null> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select(MATCH_WITH_TEAMS_SELECT)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data as unknown as Match;
    }

    async findByCompetition(competitionId: string): Promise<Match[]> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select(MATCH_WITH_TEAMS_SELECT)
            .eq('competition_id', competitionId)
            .order('scheduled_at', { ascending: true });

        if (error) throw error;
        return data as unknown as Match[];
    }

    async findByTeam(teamId: string): Promise<Match[]> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select(MATCH_WITH_TEAMS_SELECT)
            .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
            .order('scheduled_at', { ascending: true });

        if (error) throw error;
        return data as unknown as Match[];
    }

    async getEvents(matchId: string): Promise<MatchEvent[]> {
        const { data, error } = await this.client
            .from('match_events')
            .select('*')
            .eq('match_id', matchId)
            .order('minute', { ascending: true });

        if (error) throw error;
        return data as MatchEvent[];
    }

    async addEvent(event: Partial<MatchEvent>): Promise<MatchEvent> {
        const { data, error } = await this.client
            .from('match_events')
            .insert(event)
            .select()
            .single();

        if (error) throw error;
        return data as MatchEvent;
    }
}
