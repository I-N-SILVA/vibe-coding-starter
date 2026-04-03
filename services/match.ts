import { repositories } from '@/lib/repositories';
import { toCamelCase } from '@/lib/mappers';
import type { MatchUI, TeamSummary } from '@/lib/mappers';
import type { Match, MatchEvent, Team } from '@/lib/supabase/types';

function toTeamSummary(team: Team | null | undefined): TeamSummary {
    if (!team) return null;
    return { id: team.id, name: team.name, shortName: team.short_name ?? undefined, logoUrl: team.logo_url ?? undefined };
}

/**
 * Match Service
 * Handles match scheduling, live updates, and results using the repository layer.
 */
export const matchService = {
    /**
     * Map a DB match + enriched teams to a UI (camelCase) MatchUI.
     */
    mapMatch(match: Match, homeTeam?: Team | null, awayTeam?: Team | null): MatchUI {
        return {
            ...toCamelCase(match),
            homeTeam: toTeamSummary(homeTeam ?? match.home_team),
            awayTeam: toTeamSummary(awayTeam ?? match.away_team),
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

        const result = await Promise.all(matches.map(async (m) => {
            const [homeTeam, awayTeam] = await Promise.all([
                repositories.team.findById(m.home_team_id),
                repositories.team.findById(m.away_team_id),
            ]);
            return matchService.mapMatch(m, homeTeam, awayTeam);
        }));

        return result.sort((a, b) =>
            new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime()
        );
    },

    /**
     * Get a single match with details
     */
    async getMatch(id: string): Promise<MatchUI | null> {
        const match = await repositories.match.findById(id);
        if (!match) return null;

        const [homeTeam, awayTeam] = await Promise.all([
            repositories.team.findById(match.home_team_id),
            repositories.team.findById(match.away_team_id),
        ]);
        return matchService.mapMatch(match, homeTeam, awayTeam);
    },

    /**
     * Update match score
     */
    async updateScore(matchId: string, homeScore: number, awayScore: number): Promise<MatchUI> {
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
    async startMatch(matchId: string): Promise<MatchUI> {
        const updated = await repositories.match.update(matchId, {
            status: 'live',
            match_time: '0'
        });
        return matchService.mapMatch(updated);
    },

    /**
     * End a match
     */
    async endMatch(matchId: string): Promise<MatchUI> {
        const updated = await repositories.match.update(matchId, { status: 'completed' });
        return matchService.mapMatch(updated);
    },

    /**
     * Create a new match
     */
    async createMatch(data: { competitionId: string; homeTeamId: string; awayTeamId: string; scheduledDate?: string; venueId?: string }): Promise<MatchUI> {
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
     * Get events for a match, with player name enrichment
     */
    async getMatchEvents(matchId: string): Promise<(MatchEvent & { player?: { name: string } | null })[]> {
        const events = await repositories.match.getEvents(matchId);

        const eventsWithPlayers = await Promise.all(events.map(async (e) => {
            if (!e.player_id) return e;
            const player = await repositories.player.findById(e.player_id);
            return { ...e, player: player ? { name: player.name } : null };
        }));

        return eventsWithPlayers.sort((a, b) => (a.minute || 0) - (b.minute || 0));
    },

    /**
     * Add an event to a match
     */
    async addMatchEvent(data: { matchId: string; playerId?: string; type: MatchEvent['type']; minute?: number; details?: Record<string, unknown> }): Promise<MatchEvent> {
        return repositories.match.addEvent({
            match_id: data.matchId,
            player_id: data.playerId,
            type: data.type,
            minute: data.minute,
            details: data.details ?? {},
        });
    }
};
