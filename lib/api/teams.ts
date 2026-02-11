/**
 * Teams API - PLYAZ League Manager
 * API methods for team management
 */

import { apiClient } from './client';
import type { Team, Player, CreateTeamDto } from '@/types';

export const teamsApi = {
    // ============================================
    // TEAMS
    // ============================================

    getTeams: (competitionId?: string) => {
        const query = competitionId ? `?competitionId=${competitionId}` : '';
        return apiClient.get<Team[]>(`/api/league/teams${query}`);
    },

    getTeam: (id: string) =>
        apiClient.get<Team>(`/api/league/teams/${id}`),

    createTeam: (data: CreateTeamDto) =>
        apiClient.post<Team>('/api/league/teams', data),

    updateTeam: (id: string, data: Partial<CreateTeamDto>) =>
        apiClient.patch<Team>(`/api/league/teams/${id}`, data),

    deleteTeam: (id: string) =>
        apiClient.delete<void>(`/api/league/teams/${id}`),

    // ============================================
    // PLAYERS
    // ============================================

    getPlayers: (teamId: string) =>
        apiClient.get<Player[]>(`/api/league/teams/${teamId}/players`),

    getPlayer: (teamId: string, playerId: string) =>
        apiClient.get<Player>(`/api/league/teams/${teamId}/players/${playerId}`),

    addPlayer: (teamId: string, data: Omit<Player, 'id' | 'teamId' | 'createdAt' | 'updatedAt'>) =>
        apiClient.post<Player>(`/api/league/teams/${teamId}/players`, data),

    updatePlayer: (teamId: string, playerId: string, data: Partial<Player>) =>
        apiClient.patch<Player>(`/api/league/teams/${teamId}/players/${playerId}`, data),

    removePlayer: (teamId: string, playerId: string) =>
        apiClient.delete<void>(`/api/league/teams/${teamId}/players/${playerId}`),
};

export default teamsApi;
