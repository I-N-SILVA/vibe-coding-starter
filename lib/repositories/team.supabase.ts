/**
 * Team Supabase Repository — PLYAZ League Manager
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './supabase.base';
import { ITeamRepository } from './types';
import { Team } from '@/lib/supabase/types';

export class TeamSupabaseRepository extends SupabaseBaseRepository<Team> implements ITeamRepository {
    constructor(client?: SupabaseClient) {
        super('teams', client);
    }

    async findByCompetition(competitionId: string): Promise<Team[]> {
        // Teams are usually linked to competitions through group_teams or directly
        // Assuming there is a competition_id in teams, or we join group_teams
        const { data, error } = await this.client
            .from(this.tableName)
            .select('*')
            .eq('competition_id', competitionId);

        if (error) throw error;
        return data as Team[];
    }
}
