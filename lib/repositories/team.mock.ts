/**
 * Team Mock Repository — PLYAZ League Manager
 */

import { LocalStore } from '@/lib/mock/store';
import { BaseMockRepository } from './base.mock';
import { ITeamRepository } from './types';
import type { Team } from '@/lib/supabase/types';

export class TeamMockRepository extends BaseMockRepository<Team> implements ITeamRepository {
    constructor() {
        super('teams');
    }

    async findByCompetition(competitionId: string): Promise<Team[]> {
        return LocalStore.find<Team>(this.storeKey, t => t.competition_id === competitionId);
    }
}
