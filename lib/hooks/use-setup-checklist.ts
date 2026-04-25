import { useCompetitions, useChampionshipConfig, useTeams, useMatches } from './useQueries';
import { useInvites } from './use-organizations';

export interface ChecklistStep {
    id: string;
    label: string;
    done: boolean;
    href: string | null;
    cta: string;
}

export function useSetupChecklist(competitionId: string | null) {
    const { data: competitions = [] } = useCompetitions();
    const { data: teams = [] } = useTeams();
    const { data: matches = [] } = useMatches();
    const { data: invites = [] } = useInvites();
    const { data: config } = useChampionshipConfig(competitionId ?? '');

    const compsArray = Array.isArray(competitions) ? competitions : [];
    const teamsArray = Array.isArray(teams) ? teams : [];
    const matchesArray = Array.isArray(matches) ? matches : [];
    const invitesArray = Array.isArray(invites) ? invites : [];

    const primaryComp = compsArray.find((c) => c.id === competitionId) ?? compsArray[0];
    const configDone = !!config && typeof config === 'object' && 'format' in (config as object);

    const steps: ChecklistStep[] = [
        {
            id: 'created',
            label: 'Create league',
            done: compsArray.length > 0,
            href: null,
            cta: 'Done',
        },
        {
            id: 'configured',
            label: 'Configure rules & format',
            done: configDone,
            href: primaryComp ? `/league/competitions/${primaryComp.id}/config` : null,
            cta: 'Set up rules',
        },
        {
            id: 'teams',
            label: 'Add first team',
            done: teamsArray.length > 0,
            href: '/league/teams',
            cta: 'Add team',
        },
        {
            id: 'invites',
            label: 'Invite managers or players',
            done: invitesArray.length > 0,
            href: '/league/invites',
            cta: 'Send invite',
        },
        {
            id: 'matches',
            label: 'Schedule first match',
            done: matchesArray.length > 0,
            href: '/league/matches/schedule',
            cta: 'Schedule match',
        },
        {
            id: 'published',
            label: 'Publish league',
            done: primaryComp?.status === 'active' || primaryComp?.status === 'completed',
            href: primaryComp ? `/league/competitions/${primaryComp.id}` : null,
            cta: 'Go live',
        },
    ];

    const completed = steps.filter((s) => s.done).length;
    const total = steps.length;
    const percentage = Math.round((completed / total) * 100);
    const nextStep = steps.find((s) => !s.done) ?? null;

    return { steps, completed, total, percentage, nextStep, primaryComp };
}
