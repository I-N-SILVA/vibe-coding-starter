/**
 * Match Supabase Repository — PLYAZ League Manager
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './supabase.base';
import { IMatchRepository } from './types';
import { Match, MatchEvent } from '@/lib/supabase/types';

export class MatchSupabaseRepository extends SupabaseBaseRepository<Match> implements IMatchRepository {
    constructor(client?: SupabaseClient) {
        super('matches', client);
    }

    async findByCompetition(competitionId: string): Promise<Match[]> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select('*')
            .eq('competition_id', competitionId)
            .order('scheduled_at', { ascending: true });

        if (error) throw error;
        return data as Match[];
    }

    async findByTeam(teamId: string): Promise<Match[]> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select('*')
            .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
            .order('scheduled_at', { ascending: true });

        if (error) throw error;
        return data as Match[];
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
