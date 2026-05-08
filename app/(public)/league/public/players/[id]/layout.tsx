import { ReactNode } from 'react';
import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';

type Props = {
    children: ReactNode;
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://plyaz.co.uk';

    // Try to get player info for metadata
    let playerName = 'Player Card';
    let teamName = 'PLYAZ';
    let position = 'Player';
    let jersey = '0';
    let goals = '0';
    let assists = '0';
    let games = '0';
    let nationality = '';
    let teamColor = '#FF4D00';

    try {
        const supabase = createAdminClient();

        const { data: player } = await supabase
            .from('players')
            .select('name, position, jersey_number, nationality, team_id')
            .eq('id', id)
            .single();

        if (player) {
            playerName = player.name;
            position = player.position || 'Player';
            jersey = String(player.jersey_number ?? 0);
            nationality = player.nationality || '';

            const { data: team } = await supabase
                .from('teams')
                .select('name, primary_color')
                .eq('id', player.team_id)
                .single();

            if (team) {
                teamName = team.name;
                teamColor = team.primary_color || '#FF4D00';
            }

            const { data: statsRows } = await supabase
                .from('player_competition_stats')
                .select('goals, assists, games_played')
                .eq('player_id', id);

            type StatRow = { goals: number; assists: number; games_played: number };
            if (statsRows) {
                const totals = (statsRows as StatRow[]).reduce(
                    (acc, row) => ({
                        goals: acc.goals + (row.goals ?? 0),
                        assists: acc.assists + (row.assists ?? 0),
                        games_played: acc.games_played + (row.games_played ?? 0),
                    }),
                    { goals: 0, assists: 0, games_played: 0 },
                );
                goals = String(totals.goals);
                assists = String(totals.assists);
                games = String(totals.games_played);
            }
        }
    } catch {
        // Silently fall back to defaults if DB unavailable
    }

    const ogImageUrl =
        `${appUrl}/api/og/player?` +
        new URLSearchParams({
            name: playerName,
            position,
            jersey,
            team: teamName,
            goals,
            assists,
            games,
            nationality,
            teamColor,
        }).toString();

    const title = `${playerName} — PLYAZ Player Card`;
    const description = `${playerName} plays ${position} for ${teamName}. ${goals} goals, ${assists} assists across ${games} games. View the full player card on PLYAZ.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                { url: ogImageUrl, width: 1200, height: 630, alt: `${playerName} Player Card` },
            ],
            type: 'profile',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImageUrl],
        },
    };
}

export default function PublicPlayerLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
