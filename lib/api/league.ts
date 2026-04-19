/**
 * League API - PLYAZ League Manager
 * API methods for competitions, matches, and standings
 */

import { apiClient } from './client';
import { mapMatchToUI } from '@/lib/mappers';
import type { MatchUI } from '@/lib/mappers';
import type { Match } from '@/lib/supabase/types';
import type {
    Competition,
    StandingsEntry,
    CreateCompetitionDto,
    CreateMatchDto,
    UpdateScoreDto,
    AddMatchEventDto,
    MatchEvent,
    Organization,
    CreateOrganizationDto,
    Invite,
    CreateInviteDto,
    ActivityItem,
} from '@/types';

export const leagueApi = {
    // ============================================
    // COMPETITIONS
    // ============================================

    getCompetitions: () =>
        apiClient.get<Competition[]>('/api/league/competitions'),

    getCompetition: (id: string) =>
        apiClient.get<Competition>(`/api/league/competitions/${id}`),

    createCompetition: (data: CreateCompetitionDto) =>
        apiClient.post<Competition>('/api/league/competitions', data),

    updateCompetition: (id: string, data: Partial<CreateCompetitionDto>) =>
        apiClient.patch<Competition>(`/api/league/competitions/${id}`, data),

    deleteCompetition: (id: string) =>
        apiClient.delete<void>(`/api/league/competitions/${id}`),

    // ============================================
    // MATCHES
    // ============================================

    getMatches: async (params?: { status?: string; competitionId?: string }) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set('status', params.status);
        if (params?.competitionId) searchParams.set('competitionId', params.competitionId);
        const query = searchParams.toString();
        const matches = await apiClient.get<Match[]>(`/api/league/matches${query ? `?${query}` : ''}`);
        return matches.map(mapMatchToUI);
    },

    getMatch: async (id: string) => {
        const match = await apiClient.get<Match>(`/api/league/matches/${id}`);
        return mapMatchToUI(match);
    },

    createMatch: async (data: CreateMatchDto) => {
        const match = await apiClient.post<Match>('/api/league/matches', data);
        return mapMatchToUI(match);
    },

    updateScore: async (data: UpdateScoreDto) => {
        const match = await apiClient.patch<Match>(`/api/league/matches/${data.matchId}/score`, {
            homeScore: data.homeScore,
            awayScore: data.awayScore,
        });
        return mapMatchToUI(match);
    },

    startMatch: async (matchId: string) => {
        const match = await apiClient.post<Match>(`/api/league/matches/${matchId}/start`);
        return mapMatchToUI(match);
    },

    endMatch: async (matchId: string) => {
        const match = await apiClient.post<Match>(`/api/league/matches/${matchId}/end`);
        return mapMatchToUI(match);
    },

    // ============================================
    // MATCH EVENTS
    // ============================================

    addMatchEvent: (data: AddMatchEventDto) =>
        apiClient.post<MatchEvent>(`/api/league/matches/${data.matchId}/events`, data),

    getMatchEvents: (matchId: string) =>
        apiClient.get<MatchEvent[]>(`/api/league/matches/${matchId}/events`),

    // ============================================
    // STANDINGS
    // ============================================

    getStandings: (competitionId: string) =>
        apiClient.get<StandingsEntry[]>(`/api/league/competitions/${competitionId}/standings`),

    getActivity: () =>
        apiClient.get<ActivityItem[]>('/api/league/activity'),

    // ============================================
    // ORGANIZATIONS
    // ============================================

    getOrganization: () =>
        apiClient.get<Organization | null>('/api/league/organizations'),

    createOrganization: (data: CreateOrganizationDto) =>
        apiClient.post<Organization>('/api/league/organizations', data),

    // ============================================
    // INVITES
    // ============================================

    getInvites: () =>
        apiClient.get<Invite[]>('/api/league/invites'),

    createInvite: (data: CreateInviteDto) =>
        apiClient.post<Invite>('/api/league/invites', data),
};

export default leagueApi;
