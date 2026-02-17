import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Organization = Database['public']['Tables']['organizations']['Row'];
type Competition = Database['public']['Tables']['competitions']['Row'];

/**
 * Organization Service
 * Centralizes all league and organization related data calls.
 */
export const orgService = {
    /**
     * Map database organization to UI organization
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
     * Map database competition to UI competition
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
            organization: comp.organization ? orgService.mapOrganization(comp.organization) : undefined,
        };
    },

    /**
     * Create a new organization and link it to the current profile
     */
    async createOrganization(name: string, slug: string) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('User not authenticated');

        // 1. Insert Org with owner_id
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name,
                slug,
                owner_id: user.id
            })
            .select()
            .single();

        if (orgError) throw orgError;

        // 2. Update current user's profile with the organization_id
        await supabase
            .from('profiles')
            .update({
                organization_id: org.id,
                role: 'organizer'
            })
            .eq('id', user.id);

        return orgService.mapOrganization(org);
    },

    /**
     * Get organization by ID or current
     */
    async getOrganization(idOrCurrent: string) {
        const supabase = createClient();
        let orgId = idOrCurrent;

        if (idOrCurrent === 'current') {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();
            if (!profile?.organization_id) return null;
            orgId = profile.organization_id;
        }

        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', orgId)
            .single();

        if (error) throw error;
        return orgService.mapOrganization(data);
    },

    /**
     * Get a single competition
     */
    async getCompetition(id: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('competitions')
            .select('*, organization:organizations(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return orgService.mapCompetition(data);
    },

    /**
     * Update a competition
     */
    async updateCompetition(id: string, data: Partial<Competition>) {
        const supabase = createClient();
        const { data: updated, error } = await supabase
            .from('competitions')
            .update(data as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return orgService.mapCompetition(updated);
    },

    /**
     * Delete a competition
     */
    async deleteCompetition(id: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('competitions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    /**
     * Create an initial competition for an organization
     */
    async createCompetition(orgId: string, name: string, type: string) {
        const supabase = createClient();
        let targetOrgId = orgId;

        if (orgId === 'current') {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();
            if (!profile?.organization_id) throw new Error('No organization found for current user');
            targetOrgId = profile.organization_id;
        }

        const { data, error } = await supabase
            .from('competitions')
            .insert({
                organization_id: targetOrgId,
                name,
                type: type as any,
                status: 'draft'
            })
            .select()
            .single();

        if (error) throw error;
        return orgService.mapCompetition(data);
    },

    /**
     * Get all competitions for the organization
     */
    async getCompetitions(orgId?: string) {
        const supabase = createClient();
        let query = supabase.from('competitions').select('*');

        if (orgId && orgId !== 'current') {
            query = query.eq('organization_id', orgId);
        } else {
            // Get current user's org
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (profile?.organization_id) {
                    query = query.eq('organization_id', profile.organization_id);
                }
            }
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(c => orgService.mapCompetition(c));
    },

    /**
     * Get recent activity for the organization
     */
    async getActivity() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('match_events')
            .select('*, matches(home_team_id, away_team_id, competitions(name))')
            .limit(10)
            .order('created_at', { ascending: false });

        if (error) return [];
        return data; // activity mapping might be needed if UI consumes it specifically
    }
};
