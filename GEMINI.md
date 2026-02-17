# PLYAZ League Manager — Full Webapp Capabilities

## Overview

PLYAZ is a comprehensive championship management platform built with Next.js 15 (App Router), Supabase, React Query, and Framer Motion. It enables organizers to create, configure, and run multi-format tournaments end-to-end.

---

## User Roles

| Role | How They Join | Capabilities |
|------|--------------|--------------|
| **Organizer** | Direct signup | Full access: create leagues, manage teams, schedule matches, configure championships, run draws, manage registrations |
| **Referee** | Invited by organizer | Live match scoring, event recording (goals, cards, substitutions) |
| **Coach** | Invited by organizer | View team roster, view match schedule, manage player registrations |
| **Player** | Invited by organizer/coach | View personal stats, view schedule, register for competitions |
| **Fan** | Invited by organizer | Public view: standings, fixtures, match results |

Only organizers sign up directly. All other roles are onboarded via email invitation with a unique token.

---

## Core Features

### League & Organization Management
- Create organizations with unique slugs
- Invite members with role-based access (organizer, referee, coach, player, fan)
- Multi-organization support per user

### Competition Management
- Create competitions (name, type, season, year, category)
- Three tournament formats:
  - **Round Robin (League)**: All teams play each other, configurable point system
  - **Knockout (Cup)**: Single-elimination bracket with optional third-place playoff
  - **Group Stage + Knockout**: Group phase followed by elimination rounds

### Championship Configurator
Per-competition settings including:
- **Format selection**: round_robin, knockout, group_knockout
- **Group stage**: number of groups, teams per group, advancement count
- **Points system**: configurable win/draw/loss points (default 3/1/0)
- **Finals**: gold final (championship match), silver final (consolation), third-place playoff
- **Match rules**: duration, half-time, max substitutions, extra time, penalty shootouts
- **Custom rules**: extensible JSONB field for additional configuration

### Categories
- Age-based categories (e.g., U-8, U-12, U-16)
- Skill-based categories (e.g., Elite, Academy)
- Min/max age ranges for eligibility

### Team Management
- Create and manage teams within an organization
- Assign players to teams
- Team rosters with jersey numbers and positions

### Venue Management
- Create and manage match venues
- Track venue details: name, address, city, capacity, surface type (grass, artificial, indoor, futsal)
- Assign venues to matches

### Draw & Seeding
- Create groups for group-stage tournaments
- Random draw: Fisher-Yates shuffle distributes teams evenly across groups
- Manual seeding: assign specific teams to groups with seed positions
- Visual group display with team assignments

### Player Registration
- Per-competition registration system
- Mandatory fields: full name, date of birth, ID document type
- Optional configurable fields per competition
- Registration status workflow: pending -> approved/rejected
- Admin approve/reject interface with filter pills

### Match Management
- Schedule matches with date, time, venue, and group assignment
- Live match scoring with real-time updates
- Match events: goals, assists, yellow/red cards, substitutions
- Match state machine: scheduled -> in_progress -> completed/cancelled/postponed
- Referee match interface for live scoring

### Standings
- Automatic standings calculation via database triggers
- Per-group standings for group_knockout format
- Sortable by points, goal difference, goals scored
- Tiebreaker support

### Player Statistics
- Per-competition stats: games played, goals, assists, yellow/red cards, minutes played
- Goalkeeper-specific stats: clean sheets, saves, goals conceded, penalties saved
- Career stats aggregation across all competitions
- Per-competition breakdown table

### Fixture Generation
- Round-robin fixture generation using circle method algorithm
- Knockout bracket generation
- Group-stage fixture generation per group

---

## Technical Architecture

### Frontend
- **Framework**: Next.js 15.5.9 with App Router
- **UI Library**: Custom PLYAZ design system (components in `components/plyaz/`)
- **Design**: Black/white/orange (#F97316) palette, Nunito Sans font
- **Animations**: Framer Motion with shared variants (`stagger`, `fadeUp`)
- **State Management**: React Query (TanStack Query) for server state
- **Styling**: Tailwind CSS

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with email/password
- **API**: Next.js Route Handlers (REST)
- **Validation**: Zod v4 schemas
- **Security**: Row Level Security (RLS) policies, rate limiting, structured logging

### Type System
- Dual-type architecture:
  - `lib/supabase/types.ts`: snake_case types for database/API layer
  - `types/models.ts`: camelCase types for UI components
  - `types/api.ts`: API response wrapper types

### Key Directories
```
app/                          # Next.js App Router pages
  api/league/                 # REST API routes
  league/                     # Authenticated league pages
  login/                      # Auth pages
components/
  plyaz/                      # Design system components
  landing/                    # Public landing page components
  providers/                  # Context providers (auth, toast, theme)
lib/
  api/                        # API helpers, validation, rate limiting
  auth/                       # Auth provider
  domain/                     # Business logic (match state machine, knockout bracket, draw engine, stats aggregator)
  hooks/                      # React Query hooks
  supabase/                   # Supabase client & types
  constants/                  # Navigation, config constants
  animations.ts               # Shared Framer Motion variants
  logger.ts                   # Structured logging
types/                        # TypeScript type definitions
supabase/                     # Database schema (reset_database.sql)
```

### Database Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with roles |
| `organizations` | League organizations |
| `org_members` | Organization membership |
| `invites` | Role-based invitations |
| `competitions` | Tournaments/championships |
| `teams` | Team entities |
| `players` | Player profiles |
| `team_players` | Team-player junction |
| `matches` | Scheduled/completed matches |
| `match_events` | Goals, cards, substitutions |
| `standings` | Calculated league standings |
| `venues` | Match locations |
| `categories` | Age/skill categories |
| `championship_config` | Per-competition rules |
| `groups` | Tournament groups |
| `group_teams` | Group-team assignments |
| `competition_registrations` | Player registrations |
| `competition_registration_fields` | Custom registration fields |
| `player_competition_stats` | Per-competition player statistics |

---

## User Flows

### Organizer Flow
1. Sign up (automatically assigned organizer role)
2. Create organization
3. Create categories (age groups)
4. Create competition (select format, year, category)
5. Configure championship rules (points, match duration, finals)
6. Create teams and add players
7. Create venues
8. Set up groups and run draw (for group/knockout formats)
9. Open player registration
10. Approve/reject player registrations
11. Generate fixtures
12. Assign referees to matches
13. Monitor live matches and standings
14. View player statistics

### Referee Flow
1. Accept invitation link
2. View assigned matches
3. Start match (transition to in_progress)
4. Record match events (goals, cards, substitutions)
5. End match (transition to completed)

### Player Flow
1. Accept invitation link
2. Register for competitions (submit ID, personal details)
3. View personal stats across competitions
4. View match schedule and results

### Public View
- Live standings and scoreboard
- Match results and upcoming fixtures
- Team rosters
- Player profiles and statistics
