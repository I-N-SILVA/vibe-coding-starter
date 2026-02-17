import { LocalStore } from '@/lib/mock/store';
import type { Database } from '@/lib/supabase/types';

type Player = Database['public']['Tables']['players']['Row'];

/**
 * Player Service (Mock)
 * Handles all player-related data operations using localStorage.
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
        let players: any[] = [];

        if (teamId) {
            players = LocalStore.find<any>('players', p => p.team_id === teamId);
        } else {
            // Get all players for current org
            const user = LocalStore.findOne<any>('auth', u => u.isActive);
            if (user) {
                const profile = LocalStore.findOne<any>('profiles', p => p.id === user.id);
                if (profile?.organization_id) {
                    players = LocalStore.find<any>('players', p => p.organization_id === profile.organization_id);
                }
            }
        }

        return players.sort((a, b) => a.name.localeCompare(b.name)).map(p => playerService.mapPlayer(p));
    },

    /**
     * Get a single player by ID
     */
    async getPlayer(id: string) {
        const player = LocalStore.findOne<any>('players', p => p.id === id);
        return playerService.mapPlayer(player);
    }
};
