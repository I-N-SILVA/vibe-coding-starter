import { useCompetitions, useMatches } from './useQueries';
import { useInvites } from './use-organizations';

export interface AppNotification {
    id: string;
    type: 'warning' | 'info' | 'urgent';
    title: string;
    description: string;
    href: string;
    cta: string;
}

export function useNotifications() {
    const { data: competitions = [] } = useCompetitions();
    const { data: invites = [] } = useInvites();
    const { data: upcomingMatches = [] } = useMatches({ status: 'upcoming' });

    const compsArray = Array.isArray(competitions) ? competitions : [];
    const invitesArray = Array.isArray(invites) ? invites : [];
    const matchesArray = Array.isArray(upcomingMatches) ? upcomingMatches : [];

    const notifications: AppNotification[] = [];

    // Draft competitions not published
    const draftComps = compsArray.filter((c) => c.status === 'draft');
    if (draftComps.length > 0) {
        notifications.push({
            id: 'draft-comps',
            type: 'warning',
            title: `${draftComps.length} unpublished league${draftComps.length > 1 ? 's' : ''}`,
            description: 'Draft competitions are not visible to teams or players.',
            href: `/league/competitions/${draftComps[0].id}`,
            cta: 'Review & publish',
        });
    }

    // Pending invites
    const pendingInvites = invitesArray.filter(
        (inv) => (inv as { status: string }).status === 'pending'
    );
    if (pendingInvites.length > 0) {
        notifications.push({
            id: 'pending-invites',
            type: 'info',
            title: `${pendingInvites.length} pending invite${pendingInvites.length > 1 ? 's' : ''}`,
            description: 'Invitations sent but not yet accepted.',
            href: '/league/invites',
            cta: 'View invites',
        });
    }

    // Matches without referee
    const unassigned = matchesArray.filter(
        (m) => !(m as { referee_id?: string | null }).referee_id
    );
    if (unassigned.length > 0) {
        notifications.push({
            id: 'no-referee',
            type: 'urgent',
            title: `${unassigned.length} match${unassigned.length > 1 ? 'es' : ''} without referee`,
            description: 'Upcoming matches need a referee assigned.',
            href: '/league/matches',
            cta: 'Assign referees',
        });
    }

    return { notifications, count: notifications.length };
}
