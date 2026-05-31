import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserOrgId, apiError } from '@/lib/api/helpers';
import { log } from '@/lib/logger';
import { sendEmail, APP_URL } from '@/lib/email/send';
import { matchResultEmail } from '@/lib/email/templates';
import { recalculateCompetitionStandings } from '@/lib/standings/recalculate';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';

type RouteParams = { params: Promise<{ id: string }> };

async function fireWhatsAppNotifications(
    matchId: string,
    orgId: string,
    type: 'match_start' | 'full_time',
    message: string,
) {
    try {
        const supabase = await createClient();

        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('phone')
            .eq('organization_id', orgId)
            .not('phone', 'is', null);

        if (error || !profiles?.length) return;

        // Send directly in-process — no unauthenticated HTTP self-call.
        await Promise.allSettled(
            profiles
                .filter((p) => p.phone)
                .map((p) =>
                    sendWhatsAppNotification({
                        matchId,
                        type,
                        recipientPhone: p.phone as string,
                        message,
                    }),
                ),
        );
    } catch (err) {
        log.warn('[WhatsApp] Failed to query profiles for notifications', {
            error: err instanceof Error ? err.message : String(err),
            matchId,
        });
    }
}

export async function POST(_request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await getUserOrgId(supabase);
    if (auth.error) return auth.error;

    // Verify match is live before ending AND belongs to user's org
    const { data: match } = await supabase
        .from('matches')
        .select('status, organization_id')
        .eq('id', id)
        .single();

    if (!match) return apiError('Match not found', 404);
    if (match.organization_id !== auth.orgId) {
        return apiError('Forbidden: Match belongs to another organization', 403);
    }

    if (match.status !== 'live') {
        return apiError(`Cannot end match with status "${match.status}". Match must be live.`, 409);
    }

    const { data, error } = await supabase
        .from('matches')
        .update({
            status: 'completed',
            ended_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    // Fire match result emails in the background (non-blocking)
    void (async () => {
        try {
            const { data: matchFull } = await supabase
                .from('matches')
                .select(
                    'home_team_id, away_team_id, home_score, away_score, venue, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)',
                )
                .eq('id', id)
                .single();

            if (!matchFull) return;

            const { data: events } = await supabase
                .from('match_events')
                .select('type, player_name, minute')
                .eq('match_id', id)
                .order('minute', { ascending: true });

            const topEvents = (events ?? []).map((e) => ({
                type: e.type,
                playerName: e.player_name,
                minute: e.minute,
            }));

            const homeTeam = Array.isArray(matchFull.home_team)
                ? matchFull.home_team[0]
                : matchFull.home_team;
            const awayTeam = Array.isArray(matchFull.away_team)
                ? matchFull.away_team[0]
                : matchFull.away_team;
            const matchUrl = `${APP_URL}/league/matches/${id}`;

            const sendTeamEmails = async (teamId: string, isHome: boolean) => {
                const teamName = isHome
                    ? (homeTeam?.name ?? 'Home Team')
                    : (awayTeam?.name ?? 'Away Team');
                const opponent = isHome
                    ? (awayTeam?.name ?? 'Opponent')
                    : (homeTeam?.name ?? 'Opponent');

                const { data: players } = await supabase
                    .from('players')
                    .select('name, profiles(email, full_name)')
                    .eq('team_id', teamId)
                    .eq('organization_id', auth.orgId!);

                if (!players) return;

                const playerEmails = players.flatMap((p) => {
                    const profiles = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
                    const email = profiles?.email;
                    if (!email) return [];
                    return [email];
                });

                if (playerEmails.length === 0) return;

                const { subject, html } = matchResultEmail({
                    teamName,
                    opponent,
                    homeScore: matchFull.home_score,
                    awayScore: matchFull.away_score,
                    isHome,
                    topEvents,
                    matchUrl,
                });

                await Promise.allSettled(
                    playerEmails.map((email) => sendEmail({ to: email, subject, html })),
                );
            };

            await Promise.allSettled([
                sendTeamEmails(matchFull.home_team_id, true),
                sendTeamEmails(matchFull.away_team_id, false),
            ]);
        } catch (err) {
            log.warn('[email] Match result email failed', {
                error: err instanceof Error ? err.message : String(err),
                matchId: id,
            });
        }
    })();

    // Fire WhatsApp notifications in the background (non-blocking)
    void fireWhatsAppNotifications(
        id,
        auth.orgId!,
        'full_time',
        'Full time! The match has ended. Check the app for results. 🏁',
    );

    // Recalculate standings in-process (non-blocking) for this competition.
    // Uses the service-role client directly — no public HTTP recalculation route.
    void (async () => {
        try {
            const { createAdminClient } = await import('@/lib/supabase/server');
            await recalculateCompetitionStandings(createAdminClient(), data.competition_id);
        } catch (err) {
            log.warn('[Standings] Background recalculation failed', {
                error: err instanceof Error ? err.message : String(err),
                matchId: id,
            });
        }
    })();

    return NextResponse.json(data);
}
