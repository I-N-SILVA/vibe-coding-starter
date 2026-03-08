/**
 * Organization Supabase Repository — PLYAZ League Manager
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './supabase.base';
import { IOrganizationRepository } from './types';
import { Organization, Profile } from '@/lib/supabase/types';

export class OrganizationSupabaseRepository extends SupabaseBaseRepository<Organization> implements IOrganizationRepository {
    constructor(client?: SupabaseClient) {
        super('organizations', client);
    }

    async findBySlug(slug: string): Promise<Organization | null> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data as Organization;
    }

    async getMembers(orgId: string): Promise<Profile[]> {
        const { data, error } = await this.client
            .from('profiles')
            .select('*')
            .eq('organization_id', orgId);

        if (error) throw error;
        return data as Profile[];
    }
}
