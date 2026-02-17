import { LocalStore } from '@/lib/mock/store';
import type { Database } from '@/lib/supabase/types';

type Team = Database['public']['Tables']['teams']['Row'];

/**
 * Team Service (Mock)
 * Handles team creation, roster management, and statistics using localStorage.
 */
export const teamService = {
    /**
     * Map database team to UI team
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
        let teams: any[] = [];

        if (competitionId) {
            // Teams are usually linked to competitions through groups or registrations
            // For mock, let's look at all teams that might be in this competition
            // This is a bit simplified for now
            teams = LocalStore.get<any>('teams');
            // If we had a group_teams store, we would filter here.
        } else {
            // Get current user's org teams
            const user = LocalStore.findOne<any>('auth', u => u.isActive);
            if (user) {
                const profile = LocalStore.findOne<any>('profiles', p => p.id === user.id);
                if (profile?.organization_id) {
                    teams = LocalStore.find<any>('teams', t => t.organization_id === profile.organization_id);
                }
            }
        }

        return teams.sort((a, b) => a.name.localeCompare(b.name)).map(t => teamService.mapTeam(t));
    },

    /**
     * Get a single team
     */
    async getTeam(id: string) {
        const team = LocalStore.findOne<any>('teams', t => t.id === id);
        return teamService.mapTeam(team);
    },

    /**
     * Create a new team
     */
    async createTeam(data: any) {
        const team = LocalStore.addItem<any>('teams', {
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
        const updated = LocalStore.updateItem<any>('teams', id, data);
        return teamService.mapTeam(updated);
    },

    /**
     * Delete a team
     */
    async deleteTeam(id: string) {
        return LocalStore.deleteItem('teams', id);
    }
};
