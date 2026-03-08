/**
 * Player Supabase Repository — PLYAZ League Manager
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './supabase.base';
import { IPlayerRepository } from './types';
import { Player } from '@/lib/supabase/types';

export class PlayerSupabaseRepository extends SupabaseBaseRepository<Player> implements IPlayerRepository {
    constructor(client?: SupabaseClient) {
        super('players', client);
    }

    async findByTeam(teamId: string): Promise<Player[]> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select('*')
            .eq('team_id', teamId);

        if (error) throw error;
        return data as Player[];
    }

    async findByCompetition(competitionId: string): Promise<Player[]> {
        // Players are usually linked via their teams
        const { data, error } = await this.client
            .from(this.tableName)
            .select('*, teams!inner(*)')
            .eq('teams.competition_id', competitionId);

        if (error) throw error;
        return data as Player[];
    }
}
