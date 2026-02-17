import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Team = Database['public']['Tables']['teams']['Row'];

/**
 * Team Service
 * Handles team creation, roster management, and statistics.
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
        const supabase = createClient();
        let query = supabase.from('teams').select('*');

        if (competitionId) {
            // Need to join via group_teams? 
            // The existing leagueApi might have a more complex query.
            // For now, let's just get all teams if no competitionId, 
            // or filter by organization if we can identify it.
            // Actually, competitions have teams linked via group_teams in knockout or group stage.
            // But teams also belong to an organization.
            query = query.eq('organization_id', 'current'); // Placeholder logic
        }

        const { data, error } = await query.order('name');
        if (error) throw error;

        return (data || []).map(t => teamService.mapTeam(t));
    },

    /**
     * Get a single team
     */
    async getTeam(id: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return teamService.mapTeam(data);
    },

    /**
     * Create a new team
     */
    async createTeam(data: any) {
        const supabase = createClient();
        const { data: team, error } = await supabase
            .from('teams')
            .insert({
                name: data.name,
                short_name: data.shortName,
                logo_url: data.logoUrl,
                organization_id: data.organizationId
            } as any)
            .select()
            .single();

        if (error) throw error;
        return teamService.mapTeam(team);
    },

    /**
     * Update a team
     */
    async updateTeam(id: string, data: Partial<Team>) {
        const supabase = createClient();
        const { data: updated, error } = await supabase
            .from('teams')
            .update(data as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return teamService.mapTeam(updated);
    },

    /**
     * Delete a team
     */
    async deleteTeam(id: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('teams')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
