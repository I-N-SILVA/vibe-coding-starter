/**
 * Competition Mock Repository — PLYAZ League Manager
 */

import { LocalStore } from '@/lib/mock/store';
import { BaseMockRepository } from './base.mock';
import { ICompetitionRepository } from './types';
import type { Competition, StandingsEntry } from '@/lib/supabase/types';

export class CompetitionMockRepository extends BaseMockRepository<Competition> implements ICompetitionRepository {
    constructor() {
        super('competitions');
    }

    async findByOrganization(orgId: string): Promise<Competition[]> {
        return LocalStore.find<Competition>(this.storeKey, c => c.organization_id === orgId);
    }

    async getStandings(competitionId: string): Promise<StandingsEntry[]> {
        return LocalStore.find<StandingsEntry>('standings', s => s.competition_id === competitionId);
    }
}
