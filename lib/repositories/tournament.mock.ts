/**
 * Group & Registration Mock Repositories — PLYAZ League Manager
 */

import { LocalStore } from '@/lib/mock/store';
import { BaseMockRepository } from './base.mock';
import type { Group, CompetitionRegistration } from '@/lib/supabase/types';
import { IGroupRepository, IRegistrationRepository } from './types';

export class GroupMockRepository extends BaseMockRepository<Group> implements IGroupRepository {
    constructor() {
        super('groups');
    }

    async findByCompetition(competitionId: string): Promise<Group[]> {
        return LocalStore.find<Group>(this.storeKey, g => g.competition_id === competitionId);
    }
}

export class RegistrationMockRepository extends BaseMockRepository<CompetitionRegistration> implements IRegistrationRepository {
    constructor() {
        super('competition_registrations');
    }

    async findByCompetition(competitionId: string): Promise<CompetitionRegistration[]> {
        return LocalStore.find<CompetitionRegistration>(this.storeKey, r => r.competition_id === competitionId);
    }
}
