/**
 * Category & Venue Mock Repositories — PLYAZ League Manager
 */

import { BaseMockRepository } from './base.mock';
import type { Category, Venue } from '@/lib/supabase/types';
import { IVenueRepository, ICategoryRepository } from './types';

export class CategoryMockRepository extends BaseMockRepository<Category> implements ICategoryRepository {
    constructor() {
        super('categories');
    }
}

export class VenueMockRepository extends BaseMockRepository<Venue> implements IVenueRepository {
    constructor() {
        super('venues');
    }
}
