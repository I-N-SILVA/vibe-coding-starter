import { LocalStore } from '@/lib/mock/store';
import type { Database } from '@/lib/supabase/types';

type MatchRow = Database['public']['Tables']['matches']['Row'];

/**
 * Match Service (Mock)
 * Handles match scheduling, live updates, and results using localStorage.
 */
export const matchService = {
    /**
     * Map database match to UI match
     */
    mapMatch(match: any) {
        if (!match) return null;
        return {
            ...match,
            homeTeam: match.homeTeam || match.home_team,
            awayTeam: match.awayTeam || match.away_team,
            homeScore: match.home_score,
            awayScore: match.away_score,
            matchTime: match.match_time,
            scheduledDate: match.scheduled_at,
        };
    },

    /**
     * Get matches with optional status/competition filters
     */
    async getMatches(params?: { status?: string; competitionId?: string }) {
        let matches = LocalStore.get<any>('matches');

        if (params?.status) {
            matches = matches.filter(m => m.status === params.status);
        }
        if (params?.competitionId) {
            matches = matches.filter(m => m.competition_id === params.competitionId);
        }

        // Add team info
        const matchesWithTeams = matches.map(m => {
            const homeTeam = LocalStore.findOne<any>('teams', t => t.id === m.home_team_id);
            const awayTeam = LocalStore.findOne<any>('teams', t => t.id === m.away_team_id);
            return {
                ...m,
                homeTeam: homeTeam ? { name: homeTeam.name, short_name: homeTeam.short_name, logo_url: homeTeam.logo_url } : null,
                awayTeam: awayTeam ? { name: awayTeam.name, short_name: awayTeam.short_name, logo_url: awayTeam.logo_url } : null
            };
        });

        return matchesWithTeams.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()).map(m => matchService.mapMatch(m));
    },

    /**
     * Get a single match with details
     */
    async getMatch(id: string) {
        const match = LocalStore.findOne<any>('matches', m => m.id === id);
        if (!match) return null;

        const homeTeam = LocalStore.findOne<any>('teams', t => t.id === match.home_team_id);
        const awayTeam = LocalStore.findOne<any>('teams', t => t.id === match.away_team_id);

        return matchService.mapMatch({
            ...match,
            homeTeam,
            awayTeam
        });
    },

    /**
     * Update match score
     */
    async updateScore(matchId: string, homeScore: number, awayScore: number) {
        const updated = LocalStore.updateItem<any>('matches', matchId, {
            home_score: homeScore,
            away_score: awayScore,
            status: 'live'
        });
        return matchService.mapMatch(updated);
    },

    /**
     * Start a match
     */
    async startMatch(matchId: string) {
        const updated = LocalStore.updateItem<any>('matches', matchId, {
            status: 'live',
            match_time: 0
        });
        return matchService.mapMatch(updated);
    },

    /**
     * End a match
     */
    async endMatch(matchId: string) {
        const updated = LocalStore.updateItem<any>('matches', matchId, { status: 'completed' });
        return matchService.mapMatch(updated);
    },

    /**
     * Create a new match
     */
    async createMatch(data: any) {
        const match = LocalStore.addItem<any>('matches', {
            competition_id: data.competitionId,
            home_team_id: data.homeTeamId,
            away_team_id: data.awayTeamId,
            scheduled_at: data.scheduledDate,
            venue_id: data.venueId,
            status: 'scheduled'
        });
        return matchService.mapMatch(match);
    },

    /**
     * Get events for a match
     */
    async getMatchEvents(matchId: string) {
        const events = LocalStore.find<any>('match_events', e => e.match_id === matchId);
        return events.sort((a: any, b: any) => (a.minute || 0) - (b.minute || 0)).map((e: any) => {
            const player = LocalStore.findOne<any>('players', p => p.id === e.player_id);
            return {
                ...e,
                player: player ? { full_name: player.name || player.full_name } : null
            };
        });
    },

    /**
     * Add an event to a match
     */
    async addMatchEvent(data: any) {
        const event = LocalStore.addItem<any>('match_events', {
            match_id: data.matchId,
            player_id: data.playerId,
            event_type: data.type,
            minute: data.minute,
            notes: data.notes
        });
        return event;
    }
};
