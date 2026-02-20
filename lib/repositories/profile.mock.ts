/**
 * Profile Mock Repository — PLYAZ League Manager
 */

import { LocalStore } from '@/lib/mock/store';
import { BaseMockRepository } from './base.mock';
import { IProfileRepository } from './types';
import type { Profile } from '@/lib/supabase/types';

export class ProfileMockRepository extends BaseMockRepository<Profile> implements IProfileRepository {
    constructor() {
        super('profiles');
    }

    async findByUserId(userId: string): Promise<Profile | null> {
        return LocalStore.findOne<Profile>(this.storeKey, p => p.id === userId);
    }
}
