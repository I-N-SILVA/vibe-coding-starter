/**
 * Organization Mock Repository — PLYAZ League Manager
 */

import { LocalStore } from '@/lib/mock/store';
import { BaseMockRepository } from './base.mock';
import { IOrganizationRepository } from './types';
import type { Organization, Profile } from '@/lib/supabase/types';

export class OrganizationMockRepository extends BaseMockRepository<Organization> implements IOrganizationRepository {
    constructor() {
        super('organizations');
    }

    async findBySlug(slug: string): Promise<Organization | null> {
        return LocalStore.findOne<Organization>(this.storeKey, o => o.slug === slug);
    }

    async getMembers(orgId: string): Promise<Profile[]> {
        return LocalStore.find<Profile>('profiles', p => p.organization_id === orgId);
    }
}
