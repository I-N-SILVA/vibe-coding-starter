import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Player = Database['public']['Tables']['players']['Row'];

/**
 * Player Service
 * Handles all player-related data operations.
 */
export const playerService = {
    /**
     * Map database player to UI player
     */
    mapPlayer(player: any) {
        if (!player) return null;
        return {
            ...player,
            teamId: player.team_id,
            profileId: player.profile_id,
            organizationId: player.organization_id,
            jerseyNumber: player.jersey_number,
            dateOfBirth: player.date_of_birth,
            photoUrl: player.photo_url,
        };
    },

    /**
     * Get all players in the organization (or specific team)
     */
    async getPlayers(teamId?: string) {
        const supabase = createClient();
        let query = supabase.from('players').select('*');

        if (teamId) {
            query = query.eq('team_id', teamId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(p => playerService.mapPlayer(p));
    },

    /**
     * Get a single player by ID
     */
    async getPlayer(id: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return playerService.mapPlayer(data);
    }
};
