import { LocalStore } from '@/lib/mock/store';
import { repositories } from '@/lib/repositories';
import type { Database, Team } from '@/lib/supabase/types';

/**
 * Team Service
 * Handles team creation, roster management, and statistics using the repository layer.
 */
export const teamService = {
    /**
     * Map database team to UI team (Legacy support)
     */
    mapTeam(team: any) {
        if (!team) return null;
        return {
            ...team,
            logoUrl: team.logo_url,
            shortName: team.short_name,
            organizationId: team.organization_id,
        };
    },

    /**
     * Get teams for an organization or competition
     */
    async getTeams(competitionId?: string) {
        let teams: Team[] = [];

        if (competitionId) {
            teams = await repositories.team.findByCompetition(competitionId);
        } else {
            // Get current user's org teams
            const user = LocalStore.findOne<any>('auth', u => u.isActive);
            if (user) {
                const profile = LocalStore.findOne<any>('profiles', p => p.id === user.id);
                if (profile?.organization_id) {
                    teams = await repositories.team.findAll({ organization_id: profile.organization_id });
                }
            }
        }

        return teams.sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(t => teamService.mapTeam(t));
    },

    /**
     * Get a single team
     */
    async getTeam(id: string) {
        const team = await repositories.team.findById(id);
        return teamService.mapTeam(team);
    },

    /**
     * Create a new team
     */
    async createTeam(data: any) {
        const team = await repositories.team.create({
            name: data.name,
            short_name: data.shortName,
            logo_url: data.logoUrl,
            organization_id: data.organizationId
        });

        return teamService.mapTeam(team);
    },

    /**
     * Update a team
     */
    async updateTeam(id: string, data: Partial<Team>) {
        const updated = await repositories.team.update(id, data);
        return teamService.mapTeam(updated);
    },

    /**
     * Delete a team
     */
    async deleteTeam(id: string) {
        return repositories.team.delete(id);
    }
};
