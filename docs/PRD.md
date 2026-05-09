# PLYAZ — Product Requirements Document

## 1. Product Overview

**Vision**: Democratize sports league management so any local organizer can run a professional operation with the same tools used by large federations.

**Problem**: Amateur and semi-professional leagues are managed through fragmented tools — WhatsApp groups for announcements, paper sign-up sheets, Google Sheets for standings, and verbal agreements with referees. Data is lost, mistakes happen, and players have no visibility into their own performance.

**Solution**: A single end-to-end platform covering the full lifecycle of a sports competition — from registration and team assembly, through match scheduling and live scoring, to final standings and player scouting. Every stakeholder (organizer, player, coach, referee, fan) gets a role-appropriate interface.

---

## 2. User Personas

### League Organizer (Manager / Admin)

Runs a local football league with 8–24 teams. Needs to:

- Configure the competition format (league table, knockout cup, or group stage + knockout)
- Register teams and players
- Schedule matches and assign referees
- Monitor live scores and standings
- Approve player registrations and handle guardian consent for minors

Pain points: chasing people on WhatsApp, manually recalculating standings, no audit trail for disputes.

### Player

Participates in one or more competitions. Needs to:

- Know their next match date, time, and venue
- See whether they are called up for the next game (convocation)
- Track personal stats (goals, assists, appearances)
- Have a shareable player card for scouting

Pain points: not knowing the schedule, no record of their performance, no way to get discovered.

### Coach

Manages a team within the league. Needs to:

- See their full roster and player details
- View the fixture schedule
- Track standings

Pain points: no single view of their squad, standings buried in a spreadsheet.

### Referee

Officiates assigned matches. Needs to:

- Know which matches they are assigned to
- Open a live console to record match events (goals, cards, substitutions)
- Track their earnings per match

Pain points: no structured assignment system, no digital record of their work.

### Fan / Scout (Public)

Follows the league without an account. Needs to:

- View live scores and standings
- Browse team rosters
- Find and profile individual players

Pain points: access locked behind login, no public-facing stats.

---

## 3. Core Features

### League & Competition Management

| Feature                      | Description                                                 | Roles   | Status   |
| ---------------------------- | ----------------------------------------------------------- | ------- | -------- |
| Organization creation        | Set up a multi-tenant org with slug and logo                | Manager | ✅ Built |
| Competition creation         | Create league, knockout, or group+knockout competitions     | Manager | ✅ Built |
| Competition configuration    | Set points system, match duration, extra time, group counts | Manager | ✅ Built |
| Competition status lifecycle | Draft → Active → Completed → Archived                       | Manager | ✅ Built |
| Category management          | Age/skill categories for competitions                       | Manager | ✅ Built |
| Subscription plans           | Free / Pro / Elite tiers via Stripe                         | Manager | ✅ Built |

### Team & Player Management

| Feature               | Description                                          | Roles            | Status   |
| --------------------- | ---------------------------------------------------- | ---------------- | -------- |
| Team creation         | Create teams with logo, colors, short name           | Manager          | ✅ Built |
| Team logo upload      | Upload to Supabase Storage (`logos` bucket)          | Manager          | ✅ Built |
| Player registration   | Register players with position, jersey number, DOB   | Manager / Player | ✅ Built |
| KYC fields            | ID document type and number captured at registration | Manager          | ✅ Built |
| Minor safeguarding    | Flag `is_minor`, capture guardian details            | Manager          | ✅ Built |
| Guardian consent flow | Email sent with token link; consent recorded in DB   | Manager          | ✅ Built |
| Player photo upload   | Upload to Supabase Storage (`avatars` bucket)        | Player           | ✅ Built |

### Invite & Onboarding System

| Feature                          | Description                                                      | Roles   | Status   |
| -------------------------------- | ---------------------------------------------------------------- | ------- | -------- |
| Link-based player invite         | Generate shareable token links for players to join               | Manager | ✅ Built |
| Link-based referee invite        | Generate shareable token links for referee onboarding            | Manager | ✅ Built |
| Team join via invite code        | Players join a team using a team `invite_code`                   | Player  | ✅ Built |
| Competition join via invite code | Players register for a competition via `invite_code`             | Player  | ✅ Built |
| Role selection at onboarding     | New users pick their role (organizer / player / referee / coach) | All     | ✅ Built |

### Match Operations

| Feature                 | Description                                                                                       | Roles           | Status   |
| ----------------------- | ------------------------------------------------------------------------------------------------- | --------------- | -------- |
| Match scheduling        | Create matches with date, venue, and matchday number                                              | Manager         | ✅ Built |
| Fixture generation      | Auto-generate round-robin or knockout fixtures                                                    | Manager         | ✅ Built |
| Referee assignment      | Assign a referee to a match                                                                       | Manager         | ✅ Built |
| Live scoring console    | Referee opens a live console to manage an in-progress match                                       | Referee         | ✅ Built |
| Match events            | Record goals, own goals, penalties, yellow cards, red cards, substitutions, injuries, VAR reviews | Referee         | ✅ Built |
| Match lineup            | Set starting XI, bench, and not-called players per match                                          | Coach / Manager | ✅ Built |
| Substitution management | Record in-game substitutions with minute                                                          | Referee         | ✅ Built |
| Match status lifecycle  | upcoming → scheduled → live → completed / postponed / cancelled                                   | Referee         | ✅ Built |
| Automatic standings     | Standings recalculate when a match is completed                                                   | System          | ✅ Built |
| Player stats update     | Per-competition stats update from match events                                                    | System          | ✅ Built |

### Registration & Payments

| Feature                      | Description                                          | Roles   | Status   |
| ---------------------------- | ---------------------------------------------------- | ------- | -------- |
| Competition registration     | Players submit a registration form for a competition | Player  | ✅ Built |
| Custom registration fields   | Organizers define extra fields per competition       | Manager | ✅ Built |
| Registration approval        | Manager approves or rejects individual registrations | Manager | ✅ Built |
| Stripe checkout              | Optional registration fee collected via Stripe       | Player  | ✅ Built |
| Webhook payment confirmation | Stripe webhook marks registration as paid            | System  | ✅ Built |

### Player-Facing Features

| Feature             | Description                                           | Roles            | Status     |
| ------------------- | ----------------------------------------------------- | ---------------- | ---------- |
| Player dashboard    | Stats summary, next match, squad view                 | Player           | ✅ Built   |
| Player card         | Shareable visual card with stats and position         | Player           | ✅ Built   |
| Convocation status  | Player sees whether they are called up for next match | Player           | ✅ Built   |
| Player profile page | Edit personal details, position, jersey number        | Player           | ✅ Built   |
| Discovery board     | Browse recruiting teams and open competitions         | Player / Referee | ✅ Built   |
| Squad selection     | Coach picks starting XI and bench per match           | Coach            | ⚠️ Partial |

### Public League Hub

| Feature                | Description                               | Roles  | Status   |
| ---------------------- | ----------------------------------------- | ------ | -------- |
| Live scoreboard        | Real-time match scores, no login required | Public | ✅ Built |
| Public standings       | League table per competition              | Public | ✅ Built |
| Public teams           | Team roster and match history             | Public | ✅ Built |
| Public player profiles | Individual stats and player card          | Public | ✅ Built |
| Public matches         | Full match list with scores and events    | Public | ✅ Built |

### Planned Features

| Feature                             | Status     |
| ----------------------------------- | ---------- |
| WhatsApp match alerts via CallMeBot | 🔲 Planned |
| Mobile app (React Native)           | 🔲 Planned |
| Video highlights upload             | 🔲 Planned |
| Player marketplace                  | 🔲 Planned |
| Cross-org data API                  | 🔲 Planned |
| AI match analysis                   | 🔲 Planned |

---

## 4. User Flows

See `docs/user-flows.md` for Mermaid flow diagrams covering:

- New organizer onboarding
- Player journey (join, register, match day)
- Match day (referee live console)
- Manager operations
- Registration and payment
- Public fan experience

---

## 5. Data Model Overview

### Core tables

| Table                       | Key fields                                                                                        | Relationships                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `organizations`             | id, name, slug, owner_id, plan, stripe_customer_id                                                | Owner → profiles                                     |
| `profiles`                  | id, email, full_name, role, organization_id, approval_status                                      | Belongs to organization                              |
| `competitions`              | id, organization_id, name, type, status, registration_fee, invite_code                            | Belongs to organization                              |
| `teams`                     | id, organization_id, competition_id, name, manager_id, invite_code, is_recruiting_players         | Belongs to org; optional competition                 |
| `players`                   | id, organization*id, team_id, profile_id, name, position, stats, is_minor, guardian*\*            | Belongs to team and profile                          |
| `matches`                   | id, organization_id, competition_id, home_team_id, away_team_id, status, referee_id, scheduled_at | Belongs to competition; references teams and referee |
| `match_events`              | id, match_id, type, player_id, minute, half                                                       | Belongs to match                                     |
| `match_lineups`             | id, match_id, player_id, team_id, selection_status                                                | Links players to matches                             |
| `standings`                 | id, competition_id, team_id, group_id, played, won, drawn, lost, points, form                     | One row per team per competition                     |
| `invites`                   | id, organization_id, type, token, status, expires_at                                              | Belongs to org; optional team or competition         |
| `competition_registrations` | id, competition_id, player_id, team_id, status, id_document_type                                  | Player → competition enrollment                      |
| `player_competition_stats`  | id, competition_id, player_id, goals, assists, yellow_cards, minutes_played                       | Per-competition player stats                         |
| `venues`                    | id, organization_id, name, address, city, surface_type                                            | Belongs to organization                              |
| `categories`                | id, organization_id, name, min_age, max_age                                                       | Age/skill brackets                                   |
| `championship_config`       | id, competition_id, format, groups_count, points_win, match_duration_minutes                      | Detailed competition rules                           |
| `groups` + `group_teams`    | Group stage structure                                                                             | Linked to competition and teams                      |
| `applications`              | id, applicant_id, target_id, target_type, status                                                  | Player/referee applying to team or competition       |
| `audit_logs`                | id, organization_id, user_id, action, details                                                     | Immutable event log                                  |

### Multi-tenancy

Every table that holds org-specific data includes `organization_id`. RLS policies enforce that users can only read and write rows belonging to their own organization. Public routes use the service role client with explicit filtering.

---

## 6. Non-Functional Requirements

### Performance

- React Query caches API responses; stale-while-revalidate prevents loading spinners on repeat visits
- Supabase indexes on `organization_id`, `competition_id`, `status`, `scheduled_at` for common query patterns
- Framer Motion animations are GPU-composited (transform/opacity only)

### Security

- RLS enabled on all Supabase tables — no table has public read/write
- All authenticated API routes validate the user's org session server-side
- Guardian consent tokens are single-use UUIDs stored in `players.guardian_token`
- Stripe webhooks verified with `STRIPE_WEBHOOK_SECRET` before any DB mutation
- Upstash Redis rate limiting on mutation endpoints
- Audit log written for sensitive actions (role changes, registration approvals, etc.)

### Scalability

- Multi-tenant by design: one Supabase project serves all organizations
- Upstash Redis handles rate limiting without a separate server
- Supabase Realtime used for live match score updates

### Internationalization

- Full translation system at `lib/i18n/translations.ts` and `lib/i18n/useLanguage.tsx`
- Translation files: `messages/en.json`, `messages/pt.json`, `messages/es.json`, `messages/fr.json`
- Language toggle available in the Sidebar and UserMenu

---

## 7. Future Roadmap

| Item                  | Description                                                                   |
| --------------------- | ----------------------------------------------------------------------------- |
| Mobile app            | React Native app for players and referees (offline-capable for match console) |
| WhatsApp integration  | Match alerts and squad announcement via CallMeBot / WhatsApp Business API     |
| Video highlights      | Upload and attach clip to match events                                        |
| Player marketplace    | Cross-league player discovery and transfer requests                           |
| Cross-org data API    | Public API for federations to aggregate stats across organizations            |
| AI match analysis     | Automated summary and heatmap generation from match event data                |
| Referee rating system | Post-match rating submitted by teams                                          |
| Tournament brackets   | Visual knockout bracket UI                                                    |
