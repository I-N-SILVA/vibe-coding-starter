/**
 * Tournament Structure Supabase Repositories — PLYAZ League Manager
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './supabase.base';
import { IGroupRepository, IRegistrationRepository } from './types';
import { Group, CompetitionRegistration } from '@/lib/supabase/types';

export class GroupSupabaseRepository extends SupabaseBaseRepository<Group> implements IGroupRepository {
    constructor(client?: SupabaseClient) {
        super('groups', client);
    }

    async findByCompetition(competitionId: string): Promise<Group[]> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select('*')
            .eq('competition_id', competitionId)
            .order('name', { ascending: true });

        if (error) throw error;
        return data as Group[];
    }
}

export class RegistrationSupabaseRepository extends SupabaseBaseRepository<CompetitionRegistration> implements IRegistrationRepository {
    constructor(client?: SupabaseClient) {
        super('competition_registrations', client);
    }

    async findByCompetition(competitionId: string): Promise<CompetitionRegistration[]> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select('*')
            .eq('competition_id', competitionId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as CompetitionRegistration[];
    }
}
