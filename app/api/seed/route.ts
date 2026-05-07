import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ─── Seed data ────────────────────────────────────────────────────────────────

const USERS = [
    {
        email: 'manager@plyaz.demo',
        password: 'Demo1234!',
        full_name: 'Alex Manager',
        role: 'organizer',
    },
    {
        email: 'referee@plyaz.demo',
        password: 'Demo1234!',
        full_name: 'Sam Referee',
        role: 'referee',
    },
    {
        email: 'player1@plyaz.demo',
        password: 'Demo1234!',
        full_name: 'Jordan Player',
        role: 'player',
    },
    {
        email: 'player2@plyaz.demo',
        password: 'Demo1234!',
        full_name: 'Casey Player',
        role: 'player',
    },
];

const TEAMS_DATA = [
    { name: 'Phoenix FC', short_name: 'PHX', primary_color: '#FF4500', secondary_color: '#1A1A2E' },
    {
        name: 'City Rangers',
        short_name: 'CRG',
        primary_color: '#0057A8',
        secondary_color: '#FFFFFF',
    },
    { name: 'FC United', short_name: 'FCU', primary_color: '#CC0000', secondary_color: '#FFFFFF' },
    { name: 'Eagles SC', short_name: 'EGL', primary_color: '#006400', secondary_color: '#FFD700' },
    {
        name: 'Riverside FC',
        short_name: 'RVS',
        primary_color: '#4B0082',
        secondary_color: '#FFFFFF',
    },
    { name: 'North City', short_name: 'NCY', primary_color: '#FF8C00', secondary_color: '#000000' },
];

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF'];
const NATIONALITIES = [
    'Brazilian',
    'Spanish',
    'French',
    'German',
    'English',
    'Italian',
    'Portuguese',
    'Argentine',
    'Dutch',
    'Belgian',
];

const PLAYER_NAMES = [
    ['Lucas', 'Silva'],
    ['Mateus', 'Santos'],
    ['Gabriel', 'Costa'],
    ['Rafael', 'Lima'],
    ['Diego', 'Alves'],
    ['Bruno', 'Ferreira'],
    ['Carlos', 'Mendes'],
    ['André', 'Rodrigues'],
    ['Felipe', 'Oliveira'],
    ['Marcos', 'Pereira'],
    ['Vitor', 'Nunes'],
    ['Thiago', 'Carvalho'],
    ['Leandro', 'Gomes'],
    ['Eduardo', 'Souza'],
    ['Rodrigo', 'Teixeira'],
    ['Paulo', 'Machado'],
    ['Danilo', 'Barbosa'],
    ['Alex', 'Ramos'],
    ['Pedro', 'Moreira'],
    ['João', 'Campos'],
    ['Ricardo', 'Freitas'],
    ['Sergio', 'Monteiro'],
    ['Ivan', 'Castro'],
    ['Hugo', 'Correia'],
    ['Tiago', 'Pinto'],
    ['Nuno', 'Fonseca'],
    ['Marco', 'Ribeiro'],
    ['Fábio', 'Coelho'],
    ['Nelson', 'Simões'],
    ['Renato', 'Martins'],
    ['Henrique', 'Cruz'],
    ['Diogo', 'Lopes'],
    ['Duarte', 'Azevedo'],
    ['Sandro', 'Nascimento'],
    ['Rui', 'Miranda'],
    ['David', 'Tavares'],
    ['José', 'Marques'],
    ['Afonso', 'Rocha'],
    ['Gonçalo', 'Sousa'],
    ['Toni', 'Pires'],
    ['Kevin', 'Andrade'],
    ['Nélson', 'Cunha'],
    ['Sébastien', 'Dumont'],
    ['Antoine', 'Moreau'],
    ['Pierre', 'Lefebvre'],
    ['Julien', 'Bernard'],
    ['Nicolas', 'Girard'],
    ['Clément', 'Rousseau'],
    ['Théo', 'Laurent'],
    ['Maxime', 'Mercier'],
    ['Hugo', 'Simon'],
    ['Axel', 'Michel'],
    ['Valentin', 'Garcia'],
    ['Romain', 'Martinez'],
    ['Florian', 'Hernandez'],
    ['Quentin', 'Lopez'],
    ['Jordan', 'Gonzalez'],
    ['Enzo', 'Perez'],
    ['Lukas', 'Müller'],
    ['Tim', 'Schmidt'],
    ['Florian', 'Bauer'],
    ['Jonas', 'Wagner'],
    ['Philipp', 'Koch'],
    ['Moritz', 'Hofmann'],
    ['Leon', 'Weber'],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function daysFromNow(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
}

function dateOnly(isoString: string) {
    return isoString.split('T')[0];
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (token !== 'seed-plyaz-demo-2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const log: string[] = [];
    const err = (msg: string) => {
        log.push(`❌ ${msg}`);
    };
    const ok = (msg: string) => {
        log.push(`✅ ${msg}`);
    };
    const warn = (msg: string) => {
        log.push(`⚠️  ${msg}`);
    };

    try {
        // ── 1. Auth users ─────────────────────────────────────────────────────
        const userIds: Record<string, string> = {};
        const { data: existingUsers } = await supabase.auth.admin.listUsers();

        for (const u of USERS) {
            const found = existingUsers?.users?.find((eu) => eu.email === u.email);
            if (found) {
                warn(`${u.email} already exists — skipping`);
                userIds[u.email] = found.id;
                continue;
            }

            const { data, error } = await supabase.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true,
                user_metadata: { full_name: u.full_name, role: u.role },
            });

            if (error) {
                err(`${u.email}: ${error.message}`);
                continue;
            }
            userIds[u.email] = data.user.id;
            ok(`User: ${u.email} (${u.role})`);
            await new Promise((r) => setTimeout(r, 400));
        }

        const managerId = userIds[USERS[0].email];
        const refereeId = userIds[USERS[1].email];
        if (!managerId)
            return NextResponse.json({ error: 'Manager user not found', log }, { status: 500 });

        // ── 2. Profiles ───────────────────────────────────────────────────────
        for (const [email, userId] of Object.entries(userIds)) {
            const userData = USERS.find((u) => u.email === email)!;
            await supabase.from('profiles').upsert(
                {
                    id: userId,
                    email,
                    full_name: userData.full_name,
                    role: userData.role === 'organizer' ? 'organizer' : userData.role,
                    approval_status: 'approved',
                },
                { onConflict: 'id' },
            );
            ok(`Profile: ${email}`);
        }

        // ── 3. Organization ───────────────────────────────────────────────────
        const orgSlug = 'plyaz-demo-league';
        const { data: existingOrg } = await supabase
            .from('organizations')
            .select('id')
            .eq('slug', orgSlug)
            .single();
        let orgId: string;

        if (existingOrg) {
            orgId = existingOrg.id;
            warn(`Organization already exists (${orgId})`);
        } else {
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: 'PLYAZ Demo League',
                    slug: orgSlug,
                    owner_id: managerId,
                    plan: 'pro',
                })
                .select()
                .single();
            if (orgError)
                return NextResponse.json({ error: orgError.message, log }, { status: 500 });
            orgId = org.id;
            ok(`Organization: ${org.name}`);
        }

        await supabase
            .from('profiles')
            .update({ organization_id: orgId, role: 'admin' })
            .eq('id', managerId);
        await supabase.from('profiles').update({ organization_id: orgId }).eq('id', refereeId);
        ok('Users linked to organization');

        // ── 4. Category ───────────────────────────────────────────────────────
        const { data: existingCat } = await supabase
            .from('categories')
            .select('id')
            .eq('organization_id', orgId)
            .eq('name', 'Senior Men')
            .single();
        let categoryId: string;
        if (existingCat) {
            categoryId = existingCat.id;
            warn('Category already exists');
        } else {
            const { data: cat } = await supabase
                .from('categories')
                .insert({ name: 'Senior Men', organization_id: orgId })
                .select()
                .single();
            categoryId = cat!.id;
            ok('Category: Senior Men');
        }

        // ── 5. Venue ──────────────────────────────────────────────────────────
        const { data: existingVenue } = await supabase
            .from('venues')
            .select('id')
            .eq('organization_id', orgId)
            .eq('name', 'PLYAZ Arena')
            .single();
        let venueId: string;
        if (existingVenue) {
            venueId = existingVenue.id;
            warn('Venue already exists');
        } else {
            const { data: venue } = await supabase
                .from('venues')
                .insert({
                    organization_id: orgId,
                    name: 'PLYAZ Arena',
                    address: '1 Stadium Way',
                    city: 'São Paulo',
                    capacity: 45000,
                    surface_type: 'grass',
                })
                .select()
                .single();
            venueId = venue!.id;
            ok('Venue: PLYAZ Arena');
        }

        // ── 6. Competition ────────────────────────────────────────────────────
        const { data: existingComp } = await supabase
            .from('competitions')
            .select('id')
            .eq('organization_id', orgId)
            .eq('name', 'Premier Division 2026')
            .single();
        let competitionId: string;
        if (existingComp) {
            competitionId = existingComp.id;
            warn(`Competition already exists (${competitionId})`);
        } else {
            const { data: comp, error: compError } = await supabase
                .from('competitions')
                .insert({
                    organization_id: orgId,
                    category_id: categoryId,
                    name: 'Premier Division 2026',
                    description: 'The premier football competition for the 2026 season.',
                    type: 'league',
                    status: 'active',
                    season: '2025-2026',
                    year: 2026,
                    start_date: dateOnly(daysFromNow(-60)),
                    end_date: dateOnly(daysFromNow(90)),
                    max_teams: 8,
                    invite_code: 'DEMO2026',
                    rules: { points_win: 3, points_draw: 1, points_loss: 0 },
                    settings: { tiebreaker: 'goal_difference' },
                })
                .select()
                .single();
            if (compError)
                return NextResponse.json({ error: compError.message, log }, { status: 500 });
            competitionId = comp!.id;
            ok(`Competition: ${comp!.name}`);
        }

        // ── 7. Teams ──────────────────────────────────────────────────────────
        const teamIds: string[] = [];
        for (const team of TEAMS_DATA) {
            const { data: existingTeam } = await supabase
                .from('teams')
                .select('id')
                .eq('organization_id', orgId)
                .eq('name', team.name)
                .single();
            if (existingTeam) {
                teamIds.push(existingTeam.id);
                warn(`${team.name} already exists`);
                continue;
            }
            const { data: newTeam, error: teamError } = await supabase
                .from('teams')
                .insert({
                    ...team,
                    organization_id: orgId,
                    competition_id: competitionId,
                    invite_code:
                        team.short_name + Math.random().toString(36).slice(2, 6).toUpperCase(),
                })
                .select()
                .single();
            if (teamError) {
                err(`${team.name}: ${teamError.message}`);
                continue;
            }
            teamIds.push(newTeam!.id);
            ok(`Team: ${team.name}`);
        }

        // ── 8. Players ────────────────────────────────────────────────────────
        let playerIndex = 0;
        for (let t = 0; t < teamIds.length; t++) {
            const teamId = teamIds[t];
            const { count } = await supabase
                .from('players')
                .select('*', { count: 'exact', head: true })
                .eq('team_id', teamId);
            if ((count ?? 0) > 0) {
                warn(`${TEAMS_DATA[t].name} players already exist — skipping`);
                playerIndex += 11;
                continue;
            }
            const playersToInsert = [];
            for (let p = 0; p < 11; p++) {
                const nameData = PLAYER_NAMES[playerIndex % PLAYER_NAMES.length];
                playerIndex++;
                playersToInsert.push({
                    organization_id: orgId,
                    team_id: teamId,
                    name: `${nameData[0]} ${nameData[1]}`,
                    position: POSITIONS[p % POSITIONS.length],
                    jersey_number: p + 1,
                    nationality: randomItem(NATIONALITIES),
                    date_of_birth: `${randomInt(1990, 2003)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
                    status: p < 9 ? 'active' : randomItem(['active', 'active', 'injured']),
                    stats: {
                        goals: randomInt(0, 12),
                        assists: randomInt(0, 8),
                        yellow_cards: randomInt(0, 3),
                        red_cards: 0,
                        appearances: randomInt(5, 15),
                    },
                });
            }
            const { error: playerError } = await supabase.from('players').insert(playersToInsert);
            if (playerError) err(`${TEAMS_DATA[t].name} players: ${playerError.message}`);
            else ok(`${TEAMS_DATA[t].name}: 11 players created`);
        }

        // ── 9. Matches ────────────────────────────────────────────────────────
        const { count: existingMatchCount } = await supabase
            .from('matches')
            .select('*', { count: 'exact', head: true })
            .eq('competition_id', competitionId);
        if ((existingMatchCount ?? 0) > 0) {
            warn(`${existingMatchCount} matches already exist — skipping`);
        } else {
            const matchesToInsert = [];
            let matchday = 1;

            const completedPairs: [number, number][] = [
                [0, 1],
                [2, 3],
                [4, 5],
                [0, 2],
                [1, 4],
                [3, 5],
                [0, 3],
                [1, 5],
                [2, 4],
                [0, 4],
                [1, 3],
            ];

            for (let i = 0; i < completedPairs.length; i++) {
                const [hi, ai] = completedPairs[i];
                if (i % 3 === 0 && i > 0) matchday++;
                const homeScore = randomInt(0, 4);
                const awayScore = randomInt(0, 3);
                matchesToInsert.push({
                    competition_id: competitionId,
                    organization_id: orgId,
                    home_team_id: teamIds[hi],
                    away_team_id: teamIds[ai],
                    venue_id: venueId,
                    matchday,
                    home_score: homeScore,
                    away_score: awayScore,
                    status: 'completed',
                    scheduled_at: daysFromNow(-(completedPairs.length - i) * 5),
                    started_at: daysFromNow(-(completedPairs.length - i) * 5),
                    ended_at: daysFromNow(-(completedPairs.length - i) * 5 + 0.08),
                    match_time: '90',
                    venue: 'PLYAZ Arena',
                    referee_id: refereeId,
                });
            }

            // One live match
            matchesToInsert.push({
                competition_id: competitionId,
                organization_id: orgId,
                home_team_id: teamIds[0],
                away_team_id: teamIds[5],
                venue_id: venueId,
                matchday: matchday + 1,
                home_score: 1,
                away_score: 0,
                status: 'live',
                scheduled_at: daysFromNow(-0.05),
                started_at: daysFromNow(-0.05),
                match_time: '62',
                venue: 'PLYAZ Arena',
                referee_id: refereeId,
            });

            const upcomingPairs: [number, number, number][] = [
                [1, 2, 7],
                [3, 4, 10],
                [2, 5, 14],
                [0, 3, 17],
                [1, 4, 21],
            ];
            for (const [hi, ai, daysAhead] of upcomingPairs) {
                matchesToInsert.push({
                    competition_id: competitionId,
                    organization_id: orgId,
                    home_team_id: teamIds[hi],
                    away_team_id: teamIds[ai],
                    venue_id: venueId,
                    matchday: matchday + 2,
                    home_score: 0,
                    away_score: 0,
                    status: 'upcoming',
                    scheduled_at: daysFromNow(daysAhead),
                    venue: 'PLYAZ Arena',
                    referee_id: refereeId,
                });
            }

            const { data: insertedMatches, error: matchError } = await supabase
                .from('matches')
                .insert(matchesToInsert)
                .select();
            if (matchError) {
                err(`Matches: ${matchError.message}`);
            } else {
                ok(`${insertedMatches!.length} matches created (11 completed, 1 live, 5 upcoming)`);

                // ── 10. Match events ──────────────────────────────────────────
                const completedMatches = insertedMatches!.filter((m) => m.status === 'completed');
                let totalEvents = 0;
                for (const match of completedMatches) {
                    const eventsToInsert = [];
                    const totalGoals = match.home_score + match.away_score;
                    for (let g = 0; g < totalGoals; g++) {
                        eventsToInsert.push({
                            match_id: match.id,
                            type: 'goal',
                            team_id: g < match.home_score ? match.home_team_id : match.away_team_id,
                            minute: randomInt(5, 88),
                            description: randomItem([
                                'header',
                                'left foot',
                                'right foot',
                                'penalty',
                            ]),
                        });
                    }
                    for (let c = 0; c < randomInt(0, 3); c++) {
                        eventsToInsert.push({
                            match_id: match.id,
                            type: 'yellow_card',
                            team_id: randomItem([match.home_team_id, match.away_team_id]),
                            minute: randomInt(10, 85),
                        });
                    }
                    if (eventsToInsert.length > 0) {
                        const { error: evtError } = await supabase
                            .from('match_events')
                            .insert(eventsToInsert);
                        if (!evtError) totalEvents += eventsToInsert.length;
                    }
                }
                ok(`${totalEvents} match events created`);
            }
        }

        return NextResponse.json({
            success: true,
            log,
            summary: {
                accounts: [
                    'manager@plyaz.demo',
                    'referee@plyaz.demo',
                    'player1@plyaz.demo',
                    'player2@plyaz.demo',
                ],
                password: 'Demo1234!',
                organization: 'PLYAZ Demo League',
                competition: 'Premier Division 2026',
                invite_code: 'DEMO2026',
                teams: TEAMS_DATA.map((t) => t.name),
            },
        });
    } catch (e) {
        return NextResponse.json({ error: String(e), log }, { status: 500 });
    }
}
