/**
 * Competition Supabase Repository — PLYAZ League Manager
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './supabase.base';
import { ICompetitionRepository } from './types';
import { Competition, StandingsEntry } from '@/lib/supabase/types';

export class CompetitionSupabaseRepository extends SupabaseBaseRepository<Competition> implements ICompetitionRepository {
    constructor(client?: SupabaseClient) {
        super('competitions', client);
    }

    async findByOrganization(orgId: string): Promise<Competition[]> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select('*')
            .eq('organization_id', orgId);

        if (error) throw error;
        return data as Competition[];
    }

    async getStandings(competitionId: string): Promise<StandingsEntry[]> {
        const { data, error } = await this.client
            .from('standings')
            .select('*')
            .eq('competition_id', competitionId)
            .order('points', { ascending: false })
            .order('goal_difference', { ascending: false });

        if (error) throw error;
        return data as StandingsEntry[];
    }
}
