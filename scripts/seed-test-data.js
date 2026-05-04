/* eslint-disable no-console */
/**
 * PLYAZ Test Data Seeder
 *
 * Creates realistic test users, an organization, competition, teams, players, and matches.
 *
 * Usage:
 *   node scripts/seed-test-data.js
 *
 * Requirements:
 *   .env.local must have:
 *     NEXT_PUBLIC_SUPABASE_URL
 *     SUPABASE_SERVICE_ROLE_KEY   (bypasses RLS for seeding)
 *
 * What it creates:
 *   - 4 user accounts (manager, referee, player x2)
 *   - 1 organization: "PLYAZ FC Demo League"
 *   - 1 active competition: "Premier Division 2026"
 *   - 6 teams with realistic colors and short names
 *   - 11 players per team (66 total)
 *   - 15 matches (mix of completed, live, upcoming)
 *   - Match events (goals, cards) for completed matches
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ─── Load .env.local ──────────────────────────────────────────────────────────
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌  .env.local not found. Copy .env.local.example and fill in your Supabase credentials.');
  process.exit(1);
}

const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const idx = trimmed.indexOf('=');
  if (idx === -1) return;
  const key = trimmed.slice(0, idx).trim();
  const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  env[key] = value;
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || supabaseUrl.includes('your-project')) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
  process.exit(1);
}
if (!serviceRoleKey || serviceRoleKey.includes('your-service')) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY is not set in .env.local (required for seeding)');
  process.exit(1);
}

// Admin client bypasses RLS
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Seed Data ────────────────────────────────────────────────────────────────

const USERS = [
  { email: 'manager@plyaz.demo', password: 'Demo1234!', full_name: 'Alex Manager', role: 'organizer' },
  { email: 'referee@plyaz.demo', password: 'Demo1234!', full_name: 'Sam Referee', role: 'referee' },
  { email: 'player1@plyaz.demo', password: 'Demo1234!', full_name: 'Jordan Player', role: 'player' },
  { email: 'player2@plyaz.demo', password: 'Demo1234!', full_name: 'Casey Player', role: 'player' },
];

const TEAMS_DATA = [
  { name: 'Phoenix FC', short_name: 'PHX', primary_color: '#FF4500', secondary_color: '#1A1A2E' },
  { name: 'City Rangers', short_name: 'CRG', primary_color: '#0057A8', secondary_color: '#FFFFFF' },
  { name: 'FC United', short_name: 'FCU', primary_color: '#CC0000', secondary_color: '#FFFFFF' },
  { name: 'Eagles SC', short_name: 'EGL', primary_color: '#006400', secondary_color: '#FFD700' },
  { name: 'Riverside FC', short_name: 'RVS', primary_color: '#4B0082', secondary_color: '#FFFFFF' },
  { name: 'North City', short_name: 'NCY', primary_color: '#FF8C00', secondary_color: '#000000' },
];

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF'];
const NATIONALITIES = ['Brazilian', 'Spanish', 'French', 'German', 'English', 'Italian', 'Portuguese', 'Argentine', 'Dutch', 'Belgian'];

const PLAYER_NAMES = [
  ['Lucas', 'Silva'], ['Mateus', 'Santos'], ['Gabriel', 'Costa'], ['Rafael', 'Lima'],
  ['Diego', 'Alves'], ['Bruno', 'Ferreira'], ['Carlos', 'Mendes'], ['André', 'Rodrigues'],
  ['Felipe', 'Oliveira'], ['Marcos', 'Pereira'], ['Vitor', 'Nunes'],
  ['Thiago', 'Carvalho'], ['Leandro', 'Gomes'], ['Eduardo', 'Souza'], ['Rodrigo', 'Teixeira'],
  ['Paulo', 'Machado'], ['Danilo', 'Barbosa'], ['Alex', 'Ramos'], ['Pedro', 'Moreira'],
  ['João', 'Campos'], ['Ricardo', 'Freitas'], ['Sergio', 'Monteiro'],
  ['Ivan', 'Castro'], ['Hugo', 'Correia'], ['Tiago', 'Pinto'], ['Nuno', 'Fonseca'],
  ['Marco', 'Ribeiro'], ['Fábio', 'Coelho'], ['Nelson', 'Simões'], ['Renato', 'Martins'],
  ['Henrique', 'Cruz'], ['Diogo', 'Lopes'], ['Duarte', 'Azevedo'], ['Sandro', 'Nascimento'],
  ['Rui', 'Miranda'], ['David', 'Tavares'], ['José', 'Marques'], ['Afonso', 'Rocha'],
  ['Gonçalo', 'Sousa'], ['Toni', 'Pires'], ['Kevin', 'Andrade'], ['Nélson', 'Cunha'],
  ['Sébastien', 'Dumont'], ['Antoine', 'Moreau'], ['Pierre', 'Lefebvre'], ['Julien', 'Bernard'],
  ['Nicolas', 'Girard'], ['Clément', 'Rousseau'], ['Théo', 'Laurent'], ['Maxime', 'Mercier'],
  ['Hugo', 'Simon'], ['Axel', 'Michel'], ['Valentin', 'Garcia'], ['Romain', 'Martinez'],
  ['Florian', 'Hernandez'], ['Quentin', 'Lopez'], ['Jordan', 'Gonzalez'], ['Enzo', 'Perez'],
  ['Lukas', 'Müller'], ['Tim', 'Schmidt'], ['Florian', 'Bauer'], ['Jonas', 'Wagner'],
  ['Philipp', 'Koch'], ['Moritz', 'Hofmann'], ['Leon', 'Weber'],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function dateOnly(isoString) {
  return isoString.split('T')[0];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱  PLYAZ Test Data Seeder');
  console.log('=' .repeat(50));

  // ── 1. Create Auth Users ──────────────────────────────────────────────────
  console.log('\n📧  Creating auth users...');
  const userIds = {};

  for (const u of USERS) {
    // Check if user already exists
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find(eu => eu.email === u.email);

    if (found) {
      console.log(`   ⚠️  ${u.email} already exists — skipping`);
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
      console.error(`   ❌  ${u.email}: ${error.message}`);
      continue;
    }

    userIds[u.email] = data.user.id;
    console.log(`   ✅  ${u.email} (${u.role})`);

    // Brief pause to let trigger create profile
    await new Promise(r => setTimeout(r, 500));
  }

  const managerId = userIds[USERS[0].email];
  const refereeId = userIds[USERS[1].email];

  if (!managerId) {
    console.error('❌  Could not get manager user ID. Aborting.');
    process.exit(1);
  }

  // ── 2. Ensure profiles exist and are approved ─────────────────────────────
  console.log('\n👤  Setting up profiles...');
  for (const [email, userId] of Object.entries(userIds)) {
    const userData = USERS.find(u => u.email === email);
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: userData.full_name,
      role: userData.role === 'organizer' ? 'organizer' : userData.role,
      approval_status: 'approved',
    }, { onConflict: 'id' });
    console.log(`   ✅  Profile: ${email}`);
  }

  // ── 3. Create Organization ────────────────────────────────────────────────
  console.log('\n🏢  Creating organization...');

  const orgSlug = 'plyaz-demo-league';
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single();

  let orgId;

  if (existingOrg) {
    orgId = existingOrg.id;
    console.log(`   ⚠️  Organization already exists (${orgId})`);
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

    if (orgError) {
      console.error('   ❌  Org creation failed:', orgError.message);
      process.exit(1);
    }
    orgId = org.id;
    console.log(`   ✅  Organization: ${org.name} (${orgId})`);
  }

  // Link manager to org
  await supabase.from('profiles').update({ organization_id: orgId, role: 'admin' }).eq('id', managerId);
  await supabase.from('profiles').update({ organization_id: orgId }).eq('id', refereeId);
  console.log('   ✅  Users linked to organization');

  // ── 4. Create Category ────────────────────────────────────────────────────
  console.log('\n📂  Creating category...');
  const { data: existingCat } = await supabase
    .from('categories')
    .select('id')
    .eq('organization_id', orgId)
    .eq('name', 'Senior Men')
    .single();

  let categoryId;
  if (existingCat) {
    categoryId = existingCat.id;
    console.log(`   ⚠️  Category exists`);
  } else {
    const { data: cat } = await supabase
      .from('categories')
      .insert({ name: 'Senior Men', organization_id: orgId })
      .select()
      .single();
    categoryId = cat.id;
    console.log(`   ✅  Category: Senior Men`);
  }

  // ── 5. Create Venue ───────────────────────────────────────────────────────
  console.log('\n🏟️  Creating venue...');
  const { data: existingVenue } = await supabase
    .from('venues')
    .select('id')
    .eq('organization_id', orgId)
    .eq('name', 'PLYAZ Arena')
    .single();

  let venueId;
  if (existingVenue) {
    venueId = existingVenue.id;
    console.log(`   ⚠️  Venue exists`);
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
    venueId = venue.id;
    console.log(`   ✅  Venue: PLYAZ Arena`);
  }

  // ── 6. Create Competition ─────────────────────────────────────────────────
  console.log('\n🏆  Creating competition...');
  const { data: existingComp } = await supabase
    .from('competitions')
    .select('id')
    .eq('organization_id', orgId)
    .eq('name', 'Premier Division 2026')
    .single();

  let competitionId;
  if (existingComp) {
    competitionId = existingComp.id;
    console.log(`   ⚠️  Competition exists (${competitionId})`);
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

    if (compError) {
      console.error('   ❌  Competition creation failed:', compError.message);
      process.exit(1);
    }
    competitionId = comp.id;
    console.log(`   ✅  Competition: ${comp.name}`);
  }

  // ── 7. Create Teams ───────────────────────────────────────────────────────
  console.log('\n⚽  Creating teams...');
  const teamIds = [];

  for (const team of TEAMS_DATA) {
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('organization_id', orgId)
      .eq('name', team.name)
      .single();

    if (existingTeam) {
      teamIds.push(existingTeam.id);
      console.log(`   ⚠️  ${team.name} exists`);
      continue;
    }

    const { data: newTeam, error: teamError } = await supabase
      .from('teams')
      .insert({
        ...team,
        organization_id: orgId,
        competition_id: competitionId,
        invite_code: team.short_name + Math.random().toString(36).slice(2, 6).toUpperCase(),
      })
      .select()
      .single();

    if (teamError) {
      console.error(`   ❌  ${team.name}: ${teamError.message}`);
      continue;
    }
    teamIds.push(newTeam.id);
    console.log(`   ✅  ${team.name}`);
  }

  // ── 8. Create Players ─────────────────────────────────────────────────────
  console.log('\n👥  Creating players (11 per team)...');
  let playerIndex = 0;

  for (let t = 0; t < teamIds.length; t++) {
    const teamId = teamIds[t];
    const { count } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId);

    if (count > 0) {
      console.log(`   ⚠️  Team ${t + 1} players exist — skipping`);
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
    if (playerError) {
      console.error(`   ❌  Team ${t + 1} players: ${playerError.message}`);
    } else {
      console.log(`   ✅  ${TEAMS_DATA[t].name}: 11 players created`);
    }
  }

  // ── 9. Create Matches ─────────────────────────────────────────────────────
  console.log('\n📅  Creating matches...');
  const { count: existingMatchCount } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('competition_id', competitionId);

  if (existingMatchCount > 0) {
    console.log(`   ⚠️  ${existingMatchCount} matches already exist — skipping`);
  } else {
    const matchesToInsert = [];
    let matchday = 1;

    // Completed matches (past)
    const completedPairs = [
      [0, 1], [2, 3], [4, 5],  // Matchday 1
      [0, 2], [1, 4], [3, 5],  // Matchday 2
      [0, 3], [1, 5], [2, 4],  // Matchday 3
      [0, 4], [1, 3],          // Matchday 4
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

    // Upcoming matches
    const upcomingPairs = [
      [1, 2, 7], [3, 4, 10], [2, 5, 14], [0, 3, 17], [1, 4, 21],
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
      console.error(`   ❌  Matches: ${matchError.message}`);
    } else {
      console.log(`   ✅  ${insertedMatches.length} matches created (${completedPairs.length} completed, 1 live, 5 upcoming)`);

      // ── 10. Create Match Events for completed matches ───────────────────
      console.log('\n⚡  Creating match events for completed matches...');
      const completedMatches = insertedMatches.filter(m => m.status === 'completed');
      const eventTypes = ['goal', 'yellow_card'];

      let totalEvents = 0;
      for (const match of completedMatches) {
        const eventsToInsert = [];
        const totalGoals = match.home_score + match.away_score;

        for (let g = 0; g < totalGoals; g++) {
          const isHome = g < match.home_score;
          eventsToInsert.push({
            match_id: match.id,
            type: 'goal',
            team_id: isHome ? match.home_team_id : match.away_team_id,
            minute: randomInt(5, 88),
            description: randomItem(['header', 'left foot', 'right foot', 'penalty']),
          });
        }

        // Random yellow cards
        const cards = randomInt(0, 3);
        for (let c = 0; c < cards; c++) {
          eventsToInsert.push({
            match_id: match.id,
            type: 'yellow_card',
            team_id: randomItem([match.home_team_id, match.away_team_id]),
            minute: randomInt(10, 85),
          });
        }

        if (eventsToInsert.length > 0) {
          const { error: evtError } = await supabase.from('match_events').insert(eventsToInsert);
          if (!evtError) totalEvents += eventsToInsert.length;
        }
      }
      console.log(`   ✅  ${totalEvents} match events created`);
    }
  }

  // ── 11. Summary ───────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log('✅  Seeding complete!\n');
  console.log('Test accounts (password: Demo1234!):');
  console.log('  Manager :  manager@plyaz.demo');
  console.log('  Referee :  referee@plyaz.demo');
  console.log('  Player 1:  player1@plyaz.demo');
  console.log('  Player 2:  player2@plyaz.demo');
  console.log('\nOrganization slug: plyaz-demo-league');
  console.log('Competition:       Premier Division 2026');
  console.log('Teams:             6 teams, 11 players each');
  console.log('Matches:           11 completed, 1 live, 5 upcoming\n');
}

seed().catch(err => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
