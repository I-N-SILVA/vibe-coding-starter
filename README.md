# PLYAZ

Sports league management SaaS — end-to-end platform for league organizers, players, coaches, and referees.

## What it is

PLYAZ replaces WhatsApp groups and spreadsheets with a structured digital platform for running sports leagues. Organizers create competitions, schedule matches, and manage registrations. Players track their stats and get scouted. Referees log live match events. Fans follow standings and scores in real time without an account.

## Tech Stack

| Layer         | Technology                           |
| ------------- | ------------------------------------ |
| Framework     | Next.js 15 (App Router)              |
| Language      | TypeScript                           |
| Database      | Supabase (Postgres + RLS)            |
| Auth          | Supabase Auth                        |
| Storage       | Supabase Storage                     |
| Realtime      | Supabase Realtime                    |
| Data fetching | TanStack React Query v5              |
| Styling       | Tailwind CSS v3                      |
| Components    | Radix UI primitives (Shadcn pattern) |
| Animations    | Framer Motion                        |
| Payments      | Stripe                               |
| Rate limiting | Upstash Redis                        |
| Email         | Resend                               |
| Deployment    | Vercel                               |

## Architecture

Routes are split into Next.js route groups by user role:

```
app/
  (auth)/           # Login, signup, onboarding, invite acceptance, consent
  (manager)/        # League organizer dashboard and management tools
  (player)/         # Player and coach dashboards
  (referee)/        # Referee match console and payouts
  (shared)/         # Pages accessible to multiple roles (competitions, fixtures, standings, etc.)
  (public)/         # Unauthenticated pages — landing, pricing, league hub
```

### API Routes

Authenticated API routes live under `app/api/league/` — they require an org session and return 401 for unauthenticated requests.

Public fan pages (`/league/public/*`) call `app/api/league/public/` endpoints, which use the Supabase admin client and require no auth.

### Data Access Pattern

UI components call React Query hooks → hooks call service methods → services call Supabase → data returns type-safe.

Repository pattern in `lib/repositories/`:

- Supabase implementations used by default
- Mock implementations toggle via `localStorage.getItem('plyaz_simulation_enabled') === 'true'` (client) or `NEXT_PUBLIC_USE_MOCK_REPOS=true` (server)
- Mock store uses localStorage and starts empty on fresh sessions

### Services Layer

```
services/
  auth.ts       — user authentication and session management
  org.ts        — organization and competition management
  team.ts       — team operations
  player.ts     — player operations
  match.ts      — match operations and live updates
```

## User Roles

| Role                            | What they can do                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Admin / Organizer (manager)** | Create competitions, manage teams, schedule matches, assign referees, approve registrations, view analytics |
| **Coach**                       | View roster, manage squad, check fixtures and standings                                                     |
| **Player**                      | View player card and stats, check match schedule, check convocation status, register for competitions       |
| **Referee**                     | View assigned matches, run live scoring console, log match events, view payouts                             |
| **Fan / Scout**                 | Browse public league hub — scoreboard, standings, teams, player profiles — no account required              |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Stripe account (for payments)
- A Resend account (for emails)
- An Upstash Redis instance (for rate limiting)

### Local development

There is no local `.env.local` — all credentials are stored in Vercel. To run locally you must create your own `.env.local` with the variables listed below.

```bash
npm install
npm run dev
```

### Vercel deployment

Connect the repo to Vercel and set all environment variables in the Vercel dashboard. The app deploys automatically on push to `main`.

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=
STRIPE_PRICE_ELITE_YEARLY=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_FROM_NAME=

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# WhatsApp alerts (coming soon)
CALLMEBOT_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

## Supabase Setup

### Storage buckets

Create two public buckets in your Supabase project:

| Bucket    | Visibility |
| --------- | ---------- |
| `avatars` | Public     |
| `logos`   | Public     |

### Database migrations

SQL migration files are in `supabase/migrations/`. Run them in order in the Supabase SQL editor or via the Supabase CLI:

```bash
supabase db push
```

### Row Level Security

RLS is enabled on all tables. Policies scope data to `organization_id` so tenants cannot access each other's data. Never disable RLS in production.

## Demo Accounts

All demo accounts use password `Demo1234!`.

| Role     | Email              |
| -------- | ------------------ |
| Manager  | manager@plyaz.demo |
| Referee  | referee@plyaz.demo |
| Player 1 | player1@plyaz.demo |
| Player 2 | player2@plyaz.demo |

### Seed endpoint

To populate the demo database:

```bash
curl -X POST "https://vibe-coding-starter-black.vercel.app/api/seed?token=seed-plyaz-demo-2026"
```

## Key User Flows

**Organizer onboarding** — Signs up, selects organizer role, creates an organization, creates a competition (league / knockout / group+knockout), adds teams, generates invite links for players and referees.

**Player journey** — Signs up or accepts an invite link, selects player role, joins a team via invite code or discovery board, registers for a competition (with optional Stripe payment), receives guardian consent email if under 18, checks convocation status before each match.

**Match day (referee)** — Opens the referee dashboard, sees today's assigned matches, taps START to open the live console, records goals / cards / substitutions in real time. Standings and player stats update automatically when the match ends.

**Scouting / public fan** — Visits `/league/public` without logging in, browses live scoreboard, standings, team rosters, and individual player profiles with career stats.

## Repository Patterns

Two implementations exist for every entity:

- `lib/repositories/*.supabase.ts` — production Supabase queries
- `lib/repositories/*.mock.ts` — in-memory mock using localStorage

The toggle is checked at runtime:

```typescript
// client-side
const useMock = localStorage.getItem('plyaz_simulation_enabled') === 'true';

// server-side
const useMock = process.env.NEXT_PUBLIC_USE_MOCK_REPOS === 'true';
```

## Contributing / Extending

### Adding a new page

1. Place it under the correct route group (`(manager)`, `(player)`, `(referee)`, `(shared)`, or `(public)`)
2. Add the nav entry in `lib/constants/navigation.tsx` for the relevant role
3. Add an API route under `app/api/league/` for authenticated access, or `app/api/league/public/` for unauthenticated access

### API conventions

- All authenticated API routes check `organization_id` from the user session — never trust client-provided org IDs
- Public routes use `createAdminClient()` (service role) with explicit data scoping
- Apply Upstash rate limiting on mutation endpoints
- Log sensitive actions to `audit_logs`

### Adding a new entity

1. Add the type to `lib/supabase/types.ts`
2. Write Supabase and mock repository implementations in `lib/repositories/`
3. Add React Query hooks in `lib/hooks/`
4. Write the SQL migration in `supabase/migrations/`
