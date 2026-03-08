/**
 * Shared entity Supabase Repositories — PLYAZ League Manager
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './supabase.base';
import { IVenueRepository, ICategoryRepository } from './types';
import { Venue, Category } from '@/lib/supabase/types';

export class VenueSupabaseRepository extends SupabaseBaseRepository<Venue> implements IVenueRepository {
    constructor(client?: SupabaseClient) {
        super('venues', client);
    }
}

export class CategorySupabaseRepository extends SupabaseBaseRepository<Category> implements ICategoryRepository {
    constructor(client?: SupabaseClient) {
        super('categories', client);
    }
}
