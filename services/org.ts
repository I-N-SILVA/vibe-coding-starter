import { repositories } from '@/lib/repositories';
import { toCamelCase } from '@/lib/mappers';
import type { Competition, Organization } from '@/lib/supabase/types';

/**
 * Organization Service
 * Orchestrates domain operations using the repository layer.
 * All org IDs must be resolved by the caller (e.g. from useAuth) —
 * this service never reads from local auth state.
 */
export const orgService = {
    async createOrganization(name: string, slug: string, ownerId: string): Promise<Organization> {
        return repositories.organization.create({ name, slug, owner_id: ownerId });
    },

    async getOrganization(orgId: string): Promise<Organization | null> {
        return repositories.organization.findById(orgId);
    },

    async getCompetition(id: string): Promise<Competition | null> {
        return repositories.competition.findById(id);
    },

    async updateCompetition(id: string, data: Partial<Competition>): Promise<Competition> {
        return repositories.competition.update(id, data);
    },

    async deleteCompetition(id: string): Promise<boolean> {
        return repositories.competition.delete(id);
    },

    async createCompetition(orgId: string, name: string, type: Competition['type']): Promise<Competition> {
        return repositories.competition.create({
            organization_id: orgId,
            name,
            type,
            status: 'draft',
        });
    },

    async getCompetitions(orgId: string): Promise<Competition[]> {
        return repositories.competition.findByOrganization(orgId);
    },

    /**
     * Get recent match events for an org's activity feed.
     * Returns last 10 events sorted by recency, with match context.
     */
    async getActivity(orgId: string) {
        const matches = await repositories.match.findAll({ organization_id: orgId });
        const recentMatches = matches
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);

        const eventsNested = await Promise.all(
            recentMatches.map(async (match) => {
                const events = await repositories.match.getEvents(match.id);
                return events.map(e => ({
                    ...toCamelCase(e),
                    match: toCamelCase(match),
                }));
            })
        );

        return eventsNested
            .flat()
            .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())
            .slice(0, 10);
    },
};
