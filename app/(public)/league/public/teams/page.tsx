import React from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import TeamsGrid from './TeamsGrid';

interface PublicTeam {
    id: string;
    name: string;
    short_name: string | null;
    competition_id: string | null;
    logo_url: string | null;
    primary_color: string | null;
}

async function getTeams(): Promise<PublicTeam[]> {
    let supabase;
    try {
        supabase = createAdminClient();
    } catch {
        return [];
    }

    const { data: activeComps } = await supabase
        .from('competitions')
        .select('id')
        .eq('status', 'active');

    const activeCompetitionIds = (activeComps ?? []).map((c: { id: string }) => c.id);

    if (activeCompetitionIds.length === 0) {
        return [];
    }

    const { data } = await supabase
        .from('teams')
        .select('id, name, short_name, logo_url, primary_color, competition_id')
        .in('competition_id', activeCompetitionIds)
        .order('name');

    return (data ?? []) as PublicTeam[];
}

export default async function PublicTeams() {
    const teams = await getTeams();
    return <TeamsGrid teams={teams} />;
}
