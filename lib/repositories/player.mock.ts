/**
 * Player Mock Repository — PLYAZ League Manager
 */

import { LocalStore } from '@/lib/mock/store';
import { BaseMockRepository } from './base.mock';
import { IPlayerRepository } from './types';
import type { Player } from '@/lib/supabase/types';

export class PlayerMockRepository extends BaseMockRepository<Player> implements IPlayerRepository {
    constructor() {
        super('players');
    }

    async findByTeam(teamId: string): Promise<Player[]> {
        return LocalStore.find<Player>(this.storeKey, p => p.team_id === teamId);
    }

    async findByCompetition(competitionId: string): Promise<Player[]> {
        // First find teams in competition, then players in those teams
        const teams = LocalStore.find<any>('teams', t => t.competition_id === competitionId);
        const teamIds = teams.map(t => t.id);
        return LocalStore.find<Player>(this.storeKey, p => teamIds.includes(p.team_id as string));
    }
}
