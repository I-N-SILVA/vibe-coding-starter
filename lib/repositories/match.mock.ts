/**
 * Match Mock Repository — PLYAZ League Manager
 */

import { LocalStore } from '@/lib/mock/store';
import { BaseMockRepository } from './base.mock';
import { IMatchRepository } from './types';
import type { Match, MatchEvent } from '@/lib/supabase/types';

export class MatchMockRepository extends BaseMockRepository<Match> implements IMatchRepository {
    constructor() {
        super('matches');
    }

    async findByCompetition(competitionId: string): Promise<Match[]> {
        return LocalStore.find<Match>(this.storeKey, m => m.competition_id === competitionId);
    }

    async findByTeam(teamId: string): Promise<Match[]> {
        return LocalStore.find<Match>(this.storeKey, m => m.home_team_id === teamId || m.away_team_id === teamId);
    }

    async getEvents(matchId: string): Promise<MatchEvent[]> {
        return LocalStore.find<MatchEvent>('match_events', e => e.match_id === matchId);
    }

    async addEvent(event: Partial<MatchEvent>): Promise<MatchEvent> {
        return LocalStore.addItem('match_events', event as any) as unknown as MatchEvent;
    }
}
