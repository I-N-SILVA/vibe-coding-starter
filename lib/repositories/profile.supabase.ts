/**
 * Profile Supabase Repository — PLYAZ League Manager
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './supabase.base';
import { IProfileRepository } from './types';
import { Profile } from '@/lib/supabase/types';

export class ProfileSupabaseRepository extends SupabaseBaseRepository<Profile> implements IProfileRepository {
    constructor(client?: SupabaseClient) {
        super('profiles', client);
    }

    async findByUserId(userId: string): Promise<Profile | null> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data as Profile;
    }
}
