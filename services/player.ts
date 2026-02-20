import { LocalStore } from '@/lib/mock/store';
import { repositories } from '@/lib/repositories';
import type { Database, Player } from '@/lib/supabase/types';

/**
 * Player Service
 * Handles all player-related data operations using the repository layer.
 */
export const playerService = {
    /**
     * Map database player to UI player (Legacy support)
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
        let players: Player[] = [];

        if (teamId) {
            players = await repositories.player.findByTeam(teamId);
        } else {
            // Get all players for current org
            const user = LocalStore.findOne<any>('auth', u => u.isActive);
            if (user) {
                const profile = LocalStore.findOne<any>('profiles', p => p.id === user.id);
                if (profile?.organization_id) {
                    players = await repositories.player.findAll({ organization_id: profile.organization_id });
                }
            }
        }

        return players.sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(p => playerService.mapPlayer(p));
    },

    /**
     * Get a single player by ID
     */
    async getPlayer(id: string) {
        const player = await repositories.player.findById(id);
        return playerService.mapPlayer(player);
    }
};
