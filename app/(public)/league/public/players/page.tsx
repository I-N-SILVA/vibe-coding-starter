import React from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import PlayersGrid from './PlayersGrid';

interface PublicPlayer {
    id: string;
    name: string;
    position: string | null;
    jersey_number: number | null;
    nationality: string | null;
    team_id: string;
    team_name: string | null;
}

async function getPlayers(): Promise<PublicPlayer[]> {
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

    const { data: teams } = await supabase
        .from('teams')
        .select('id, name')
        .in('competition_id', activeCompetitionIds);

    const teamMap = new Map<string, string>(
        (teams ?? []).map((t: { id: string; name: string }) => [t.id, t.name] as [string, string]),
    );
    const activeTeamIds = Array.from(teamMap.keys());

    if (activeTeamIds.length === 0) {
        return [];
    }

    const { data: players } = await supabase
        .from('players')
        .select('id, name, position, jersey_number, nationality, team_id')
        .in('team_id', activeTeamIds)
        .order('name');

    return (players ?? []).map(
        (p: {
            id: string;
            name: string;
            position: string | null;
            jersey_number: number | null;
            nationality: string | null;
            team_id: string;
        }) => ({
            ...p,
            team_name: teamMap.get(p.team_id) ?? null,
        }),
    );
}

export default async function PublicPlayersPage() {
    const players = await getPlayers();
    return <PlayersGrid players={players} />;
}
