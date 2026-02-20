import { LocalStore } from '@/lib/mock/store';
import { repositories } from '@/lib/repositories';
import { toCamelCase } from '@/lib/mappers';
import type { Database, Competition, Organization } from '@/lib/supabase/types';

/**
 * Organization Service
 * Orchestrates domain operations using the repository layer.
 */
export const orgService = {
    /**
     * Map database organization to UI representation (Legacy support)
     */
    mapOrganization(org: any) {
        if (!org) return null;
        return {
            ...org,
            ownerId: org.owner_id,
            logoUrl: org.logo_url,
        };
    },

    /**
     * Map database competition to UI representation (Legacy support)
     */
    mapCompetition(comp: any) {
        if (!comp) return null;
        return {
            ...comp,
            organizationId: comp.organization_id,
            categoryId: comp.category_id,
            startDate: comp.start_date,
            endDate: comp.end_date,
            maxTeams: comp.max_teams,
            inviteCode: comp.invite_code,
            // Re-fetch organization if needed for legacy support
            organization: comp.organization_id ? orgService.mapOrganization(LocalStore.findOne('organizations', o => (o as any).id === comp.organization_id)) : undefined,
        };
    },

    /**
     * Create a new organization and link it to the current profile
     */
    async createOrganization(name: string, slug: string) {
        const user = LocalStore.findOne<any>('auth', u => u.isActive);
        if (!user) throw new Error('User not authenticated');

        // 1. Insert Org via Repo
        const org = await repositories.organization.create({
            name,
            slug,
            owner_id: user.id
        });

        // 2. Update current user's profile (still using LocalStore for auth/profile shim)
        LocalStore.updateItem<any>('profiles', user.id, {
            organization_id: org.id,
            role: 'organizer'
        });

        return orgService.mapOrganization(org);
    },

    /**
     * Get organization by ID or current
     */
    async getOrganization(idOrCurrent: string) {
        let orgId = idOrCurrent;

        if (idOrCurrent === 'current') {
            const user = LocalStore.findOne<any>('auth', u => u.isActive);
            if (!user) return null;
            const profile = LocalStore.findOne<any>('profiles', p => p.id === user.id);
            if (!profile?.organization_id) return null;
            orgId = profile.organization_id;
        }

        const org = await repositories.organization.findById(orgId);
        return orgService.mapOrganization(org);
    },

    /**
     * Get a single competition
     */
    async getCompetition(id: string) {
        const comp = await repositories.competition.findById(id);
        return orgService.mapCompetition(comp);
    },

    /**
     * Update a competition
     */
    async updateCompetition(id: string, data: Partial<Competition>) {
        const updated = await repositories.competition.update(id, data);
        return orgService.mapCompetition(updated);
    },

    /**
     * Delete a competition
     */
    async deleteCompetition(id: string) {
        return repositories.competition.delete(id);
    },

    /**
     * Create an initial competition for an organization
     */
    async createCompetition(orgId: string, name: string, type: string) {
        let targetOrgId = orgId;

        if (orgId === 'current') {
            const user = LocalStore.findOne<any>('auth', u => u.isActive);
            if (!user) throw new Error('User not authenticated');
            const profile = LocalStore.findOne<any>('profiles', p => p.id === user.id);
            if (!profile?.organization_id) throw new Error('No organization found for current user');
            targetOrgId = profile.organization_id;
        }

        const comp = await repositories.competition.create({
            organization_id: targetOrgId,
            name,
            type: type as any,
            status: 'draft'
        });

        return orgService.mapCompetition(comp);
    },

    /**
     * Get all competitions for the organization
     */
    async getCompetitions(orgId?: string) {
        let targetOrgId = orgId;

        if (!orgId || orgId === 'current') {
            const user = LocalStore.findOne<any>('auth', u => u.isActive);
            if (user) {
                const profile = LocalStore.findOne<any>('profiles', p => p.id === user.id);
                targetOrgId = profile?.organization_id;
            }
        }

        if (!targetOrgId) return [];

        const comps = await repositories.competition.findByOrganization(targetOrgId);
        return comps.map(c => orgService.mapCompetition(c));
    },

    /**
     * Get recent activity for the organization
     */
    async getActivity() {
        // This remains slightly complex as it joins match_events, matches, and competitions
        // In a real repo, this would be a single query.
        // For now, we'll keep the mock logic but use repos if possible.
        const events = await repositories.match.findAll();
        // Actually, we need match_events. The MatchRepo has getEvents(matchId) but not a generic list.
        // Let's use LocalStore for this complex mock join for now.
        const allEvents = LocalStore.get<any>('match_events');

        return allEvents
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10)
            .map((e: any) => {
                const match = LocalStore.findOne<any>('matches', m => m.id === e.match_id);
                const competition = match ? LocalStore.findOne<any>('competitions', c => c.id === match.competition_id) : null;
                return {
                    ...e,
                    matches: match ? {
                        ...match,
                        competitions: competition
                    } : null
                };
            });
    }
};
