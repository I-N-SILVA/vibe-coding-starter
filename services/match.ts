import { repositories } from '@/lib/repositories';
import { toCamelCase } from '@/lib/mappers';
import type { Database, Match, MatchEvent } from '@/lib/supabase/types';

type MatchRow = Database['public']['Tables']['matches']['Row'];

/**
 * Match Service
 * Handles match scheduling, live updates, and results using the repository layer.
 */
export const matchService = {
    /**
     * Map database match to UI representation (Legacy support)
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
        let matches: Match[] = [];

        if (params?.competitionId) {
            matches = await repositories.match.findByCompetition(params.competitionId);
        } else {
            matches = await repositories.match.findAll();
        }

        if (params?.status) {
            matches = matches.filter(m => m.status === params.status);
        }

        // Add team info (joining logic in service for now)
        const matchesWithTeams = await Promise.all(matches.map(async (m) => {
            const homeTeam = await repositories.team.findById(m.home_team_id);
            const awayTeam = await repositories.team.findById(m.away_team_id);
            return {
                ...m,
                homeTeam: homeTeam ? { name: homeTeam.name, short_name: homeTeam.short_name, logo_url: homeTeam.logo_url } : null,
                awayTeam: awayTeam ? { name: awayTeam.name, short_name: awayTeam.short_name, logo_url: awayTeam.logo_url } : null
            };
        }));

        return matchesWithTeams
            .sort((a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime())
            .map(m => matchService.mapMatch(m));
    },

    /**
     * Get a single match with details
     */
    async getMatch(id: string) {
        const match = await repositories.match.findById(id);
        if (!match) return null;

        const homeTeam = await repositories.team.findById(match.home_team_id);
        const awayTeam = await repositories.team.findById(match.away_team_id);

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
        const updated = await repositories.match.update(matchId, {
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
        const updated = await repositories.match.update(matchId, {
            status: 'live',
            match_time: '0'
        });
        return matchService.mapMatch(updated);
    },

    /**
     * End a match
     */
    async endMatch(matchId: string) {
        const updated = await repositories.match.update(matchId, { status: 'completed' });
        return matchService.mapMatch(updated);
    },

    /**
     * Create a new match
     */
    async createMatch(data: any) {
        const match = await repositories.match.create({
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
        const events = await repositories.match.getEvents(matchId);

        const eventsWithPlayers = await Promise.all(events.map(async (e) => {
            if (!e.player_id) return e;
            const player = await repositories.player.findById(e.player_id);
            return {
                ...e,
                player: player ? { full_name: player.name || player.full_name } : null
            };
        }));

        return eventsWithPlayers.sort((a: any, b: any) => (a.minute || 0) - (b.minute || 0));
    },

    /**
     * Add an event to a match
     */
    async addMatchEvent(data: any) {
        const event = await repositories.match.addEvent({
            match_id: data.matchId,
            player_id: data.playerId,
            event_type: data.type,
            minute: data.minute,
            notes: data.notes
        });
        return event;
    }
};
