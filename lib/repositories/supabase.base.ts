/**
 * Base Supabase Repository — PLYAZ League Manager
 * 
 * Provides a base class for all Supabase repositories.
 * Can be instantiated with a specific Supabase client for server-side use,
 * or defaults to the browser client.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase as browserClient } from '@/lib/supabase/client';
import { IRepository } from './types';

export abstract class SupabaseBaseRepository<T extends { id: string }> implements IRepository<T> {
    protected client: SupabaseClient;

    constructor(protected tableName: string, client?: SupabaseClient) {
        this.client = client || browserClient!;
        if (!this.client) {
            // This might happen during SSR if createClient haven't been called correctly
            // but usually SupabaseBaseRepository is used within a context that has the client.
        }
    }

    async findAll(filters?: Record<string, unknown>): Promise<T[]> {
        let query = this.client.from(this.tableName).select('*');

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as T[];
    }

    async findById(id: string): Promise<T | null> {
        const { data, error } = await this.client
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data as T;
    }

    async create(data: Partial<T>): Promise<T> {
        const { data: created, error } = await this.client
            .from(this.tableName)
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return created as T;
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        const { data: updated, error } = await this.client
            .from(this.tableName)
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return updated as T;
    }

    async delete(id: string): Promise<boolean> {
        const { error } = await this.client
            .from(this.tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}
