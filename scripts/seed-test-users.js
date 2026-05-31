/* eslint-disable no-console */
/**
 * Seeds confirmed test accounts + a full sample league for TestSprite / manual QA.
 * Idempotent: re-running wipes the seed org (by slug) and recreates it.
 *
 * Usage: node scripts/seed-test-users.js
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ---- load .env.local ----
const envPath = path.join(process.cwd(), '.env.local');
const env = {};
fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
        const i = line.indexOf('=');
        if (i > 0 && !line.trim().startsWith('#'))
            env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}
const db = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = 'TestPlyaz123!';
const ORG_SLUG = 'test-league-fc';

const USERS = [
    {
        key: 'organizer',
        email: 'organizer.test@plyaz.test',
        fullName: 'Olivia Organizer',
        role: 'organizer',
    },
    { key: 'player', email: 'player.test@plyaz.test', fullName: 'Pedro Player', role: 'player' },
    { key: 'referee', email: 'referee.test@plyaz.test', fullName: 'Riya Referee', role: 'referee' },
];

async function ensureUser(u) {
    // Try to find an existing user with this email (paginate a bit)
    let existing = null;
    for (let page = 1; page <= 5 && !existing; page++) {
        const { data } = await db.auth.admin.listUsers({ page, perPage: 1000 });
        existing = data?.users?.find((x) => x.email === u.email) || null;
        if (!data || data.users.length < 1000) break;
    }
    let id;
    if (existing) {
        id = existing.id;
        await db.auth.admin.updateUserById(id, {
            password: PASSWORD,
            email_confirm: true,
            user_metadata: { full_name: u.fullName, role: u.role },
        });
    } else {
        const { data, error } = await db.auth.admin.createUser({
            email: u.email,
            password: PASSWORD,
            email_confirm: true,
            user_metadata: { full_name: u.fullName, role: u.role },
        });
        if (error) throw new Error(`createUser ${u.email}: ${error.message}`);
        id = data.user.id;
    }
    // Upsert profile (works whether or not a DB trigger pre-created it)
    const { error: pErr } = await db.from('profiles').upsert(
        {
            id,
            email: u.email,
            full_name: u.fullName,
            role: u.role,
            approval_status: 'approved',
        },
        { onConflict: 'id' },
    );
    if (pErr) throw new Error(`profile upsert ${u.email}: ${pErr.message}`);
    return id;
}

async function wipeSeedOrg() {
    const { data, error: selErr } = await db
        .from('organizations')
        .select('id')
        .eq('slug', ORG_SLUG);
    if (selErr) throw new Error(`wipe: select org failed: ${selErr.message}`);

    for (const o of data || []) {
        // Deleting the org via cascade fails: competitions cascade tries to SET NULL on
        // player_competition_stats.competition_id, which is NOT NULL (Postgres 23502). Delete
        // the competitions explicitly first (clearing pcs defensively) to avoid the bad
        // cascade ordering, then detach profiles, then delete the org. Errors are checked —
        // the original swallowed the failure, so a stale org silently survived and the next
        // run collided on the unique slug.
        const { data: comps } = await db
            .from('competitions')
            .select('id')
            .eq('organization_id', o.id);
        const compIds = (comps || []).map((c) => c.id);

        if (compIds.length) {
            const { error: pcsErr } = await db
                .from('player_competition_stats')
                .delete()
                .in('competition_id', compIds);
            if (pcsErr && pcsErr.code !== '42P01')
                throw new Error(`wipe: clear player_competition_stats failed: ${pcsErr.message}`);

            const { error: compErr } = await db.from('competitions').delete().in('id', compIds);
            if (compErr) throw new Error(`wipe: delete competitions failed: ${compErr.message}`);
        }

        const { error: detachErr } = await db
            .from('profiles')
            .update({ organization_id: null })
            .eq('organization_id', o.id);
        if (detachErr) throw new Error(`wipe: detach profiles failed: ${detachErr.message}`);

        const { error: delErr } = await db.from('organizations').delete().eq('id', o.id);
        if (delErr) throw new Error(`wipe: delete org failed: ${delErr.message}`);
    }
}

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CM', 'CAM', 'ST'];
const NATIONS = ['Brazil', 'England', 'Spain', 'France', 'Portugal', 'Argentina', 'Germany'];

async function main() {
    console.log('Seeding test users…');
    const ids = {};
    for (const u of USERS) ids[u.key] = await ensureUser(u);
    console.log('  users ready:', ids);

    console.log('Wiping any previous seed org…');
    await wipeSeedOrg();

    console.log('Creating organization…');
    const { data: org, error: oErr } = await db
        .from('organizations')
        .insert({ name: 'Test League FC', slug: ORG_SLUG, owner_id: ids.organizer, plan: 'pro' })
        .select()
        .single();
    if (oErr) throw new Error(`org: ${oErr.message}`);

    await db
        .from('profiles')
        .update({ organization_id: org.id, role: 'organizer' })
        .eq('id', ids.organizer);
    // referee + player belong to the org too (so org-scoped views show them)
    await db
        .from('profiles')
        .update({ organization_id: org.id })
        .in('id', [ids.player, ids.referee]);

    const { data: category } = await db
        .from('categories')
        .insert({
            organization_id: org.id,
            name: 'Senior Men',
            description: 'Open age',
            min_age: 18,
            max_age: 45,
        })
        .select()
        .single();

    const { data: venue } = await db
        .from('venues')
        .insert({
            organization_id: org.id,
            name: 'Central Stadium',
            address: '1 Stadium Rd',
            city: 'Lisbon',
            capacity: 5000,
            surface_type: 'grass',
        })
        .select()
        .single();

    console.log('Creating competition…');
    const { data: comp, error: cErr } = await db
        .from('competitions')
        .insert({
            organization_id: org.id,
            name: 'Premier Test League 2026',
            description: 'Seeded sample league for QA',
            type: 'league',
            status: 'active',
            season: '2026',
            year: 2026,
            category_id: category?.id,
            start_date: '2026-05-01',
            end_date: '2026-08-30',
            max_teams: 8,
        })
        .select()
        .single();
    if (cErr) throw new Error(`competition: ${cErr.message}`);

    await db.from('championship_config').insert({
        competition_id: comp.id,
        format: 'round_robin',
        groups_count: 1,
        teams_per_group: 4,
        points_win: 3,
        points_draw: 1,
        points_loss: 0,
    });

    console.log('Creating teams…');
    const teamDefs = [
        { name: 'Lisbon Lions', short_name: 'LIS', primary_color: '#C8102E' },
        { name: 'Porto Panthers', short_name: 'POR', primary_color: '#003DA5' },
        { name: 'Madrid Mavericks', short_name: 'MAD', primary_color: '#FEBE10' },
        { name: 'Paris Phoenix', short_name: 'PAR', primary_color: '#0B3D91' },
    ];
    const teams = [];
    for (const t of teamDefs) {
        const { data, error } = await db
            .from('teams')
            .insert({
                ...t,
                organization_id: org.id,
                competition_id: comp.id,
                manager_id: ids.organizer,
                secondary_color: '#FFFFFF',
            })
            .select()
            .single();
        if (error) throw new Error(`team ${t.name}: ${error.message}`);
        teams.push(data);
    }

    console.log('Creating players…');
    const playersByTeam = {};
    for (let ti = 0; ti < teams.length; ti++) {
        playersByTeam[teams[ti].id] = [];
        for (let p = 0; p < 7; p++) {
            const linkProfile = ti === 0 && p === 6 ? ids.player : null; // link player test account to Lisbon Lions striker
            const { data, error } = await db
                .from('players')
                .insert({
                    team_id: teams[ti].id,
                    organization_id: org.id,
                    profile_id: linkProfile,
                    name: linkProfile
                        ? 'Pedro Player'
                        : `${teamDefs[ti].short_name} Player ${p + 1}`,
                    position: POSITIONS[p],
                    jersey_number: p + 1,
                    nationality: NATIONS[p % NATIONS.length],
                    status: 'active',
                })
                .select()
                .single();
            if (error) throw new Error(`player: ${error.message}`);
            playersByTeam[teams[ti].id].push(data);
        }
    }

    console.log('Creating matches + events…');
    // Round-robin of 4 teams = 6 pairings
    const pairs = [
        [0, 1],
        [2, 3],
        [0, 2],
        [1, 3],
        [0, 3],
        [1, 2],
    ];
    // Statuses: first 2 completed, next 1 live, rest upcoming
    const plan = ['completed', 'completed', 'live', 'upcoming', 'upcoming', 'upcoming'];
    const matches = [];
    for (let m = 0; m < pairs.length; m++) {
        const [h, a] = pairs[m];
        const status = plan[m];
        const hs = status === 'completed' ? [2, 1, 3][m % 3] : status === 'live' ? 1 : 0;
        const as = status === 'completed' ? [1, 1, 0][m % 3] : 0;
        const day = new Date('2026-05-10');
        day.setDate(day.getDate() + m * 7);
        const { data, error } = await db
            .from('matches')
            .insert({
                competition_id: comp.id,
                organization_id: org.id,
                home_team_id: teams[h].id,
                away_team_id: teams[a].id,
                matchday: m + 1,
                home_score: hs,
                away_score: as,
                status,
                venue: venue?.name,
                venue_id: venue?.id,
                referee_id: status !== 'upcoming' ? ids.referee : null,
                scheduled_at: day.toISOString(),
                match_time: '19:00',
            })
            .select()
            .single();
        if (error) throw new Error(`match: ${error.message}`);
        matches.push({ ...data, h, a, hs, as, status });

        if (status === 'completed' || status === 'live') {
            const homePlayers = playersByTeam[teams[h].id];
            for (let g = 0; g < hs; g++) {
                const scorer = homePlayers[6 - (g % homePlayers.length)];
                await db.from('match_events').insert({
                    match_id: data.id,
                    type: 'goal',
                    team_id: teams[h].id,
                    player_id: scorer.id,
                    player_name: scorer.name,
                    minute: 15 + g * 20,
                    half: g === 0 ? '1st' : '2nd',
                });
            }
            // one yellow card for flavour
            await db.from('match_events').insert({
                match_id: data.id,
                type: 'yellow_card',
                team_id: teams[a].id,
                player_id: playersByTeam[teams[a].id][1].id,
                player_name: playersByTeam[teams[a].id][1].name,
                minute: 55,
                half: '2nd',
            });
        }
    }

    console.log('Computing standings…');
    const table = {};
    for (const t of teams)
        table[t.id] = {
            team_id: t.id,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goals_for: 0,
            goals_against: 0,
            points: 0,
            form: [],
        };
    for (const mt of matches.filter((x) => x.status === 'completed')) {
        const H = table[teams[mt.h].id],
            A = table[teams[mt.a].id];
        H.played++;
        A.played++;
        H.goals_for += mt.hs;
        H.goals_against += mt.as;
        A.goals_for += mt.as;
        A.goals_against += mt.hs;
        if (mt.hs > mt.as) {
            H.won++;
            A.lost++;
            H.points += 3;
            H.form.push('W');
            A.form.push('L');
        } else if (mt.hs < mt.as) {
            A.won++;
            H.lost++;
            A.points += 3;
            A.form.push('W');
            H.form.push('L');
        } else {
            H.drawn++;
            A.drawn++;
            H.points++;
            A.points++;
            H.form.push('D');
            A.form.push('D');
        }
    }
    for (const t of teams) {
        await db.from('standings').insert({ competition_id: comp.id, ...table[t.id] });
    }

    console.log('Creating registrations, invites, applications…');
    // Register the linked player into the competition
    const lisbonPlayers = playersByTeam[teams[0].id];
    await db.from('competition_registrations').insert({
        competition_id: comp.id,
        player_id: lisbonPlayers[6].id,
        team_id: teams[0].id,
        organization_id: org.id,
        id_document_type: 'passport',
        id_document_number: 'P1234567',
        full_name: 'Pedro Player',
        date_of_birth: '1998-04-12',
        jersey_number: 7,
        position: 'ST',
        status: 'approved',
    });

    const future = new Date();
    future.setDate(future.getDate() + 14);
    await db.from('invites').insert([
        {
            organization_id: org.id,
            competition_id: comp.id,
            team_id: teams[1].id,
            type: 'player_join',
            email: 'invitee.player@plyaz.test',
            invited_role: 'player',
            expires_at: future.toISOString(),
        },
        {
            organization_id: org.id,
            competition_id: comp.id,
            type: 'referee_invite',
            email: 'invitee.ref@plyaz.test',
            invited_role: 'referee',
            expires_at: future.toISOString(),
        },
    ]);

    // Recruitment applications (table may not exist if that migration wasn't applied — tolerate failure)
    try {
        await db
            .from('teams')
            .update({
                is_recruiting_players: true,
                needed_positions: ['GK', 'CB'],
                recruitment_message: 'Looking for a keeper and defender.',
            })
            .eq('id', teams[2].id);
        await db
            .from('competitions')
            .update({
                is_recruiting_referees: true,
                recruitment_message: 'Referees wanted for weekend fixtures.',
            })
            .eq('id', comp.id);
        await db.from('applications').insert([
            {
                applicant_id: ids.player,
                applicant_role: 'player',
                target_id: teams[2].id,
                target_type: 'team',
                status: 'pending',
                message: 'I would love to join as a defender.',
            },
            {
                applicant_id: ids.referee,
                applicant_role: 'referee',
                target_id: comp.id,
                target_type: 'competition',
                status: 'pending',
                message: 'Available all weekends.',
            },
        ]);
        console.log('  recruitment + applications seeded.');
    } catch (e) {
        console.log('  recruitment/applications skipped:', e.message);
    }

    console.log('\n========================================');
    console.log('SEED COMPLETE — test credentials (password for all):', PASSWORD);
    for (const u of USERS) console.log(`  ${u.role.padEnd(10)} ${u.email}`);
    console.log(
        'Org:',
        org.name,
        '| Competition:',
        comp.name,
        '| Teams:',
        teams.length,
        '| Matches:',
        matches.length,
    );
    console.log('========================================');
}

main().catch((e) => {
    console.error('SEED FAILED:', e);
    process.exit(1);
});
