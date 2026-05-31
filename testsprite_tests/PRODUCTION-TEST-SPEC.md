# PLYAZ — Production Test Specification (for TestSprite & manual QA)

> **Purpose:** everything TestSprite (or any QA tester) needs to exercise the PLYAZ
> league-management platform against the **live production deployment**.
> Hand this whole file to TestSprite as the project context / additional instruction.

- **Generated:** 2026-05-31
- **Target environment:** Production (Vercel)
- **Mutation policy for this run:** FULL mutating flows allowed (tests may create/edit/delete real rows in the shared production Supabase project). Reseed instructions are in §9.

---

## 1. Production environment

| Item                     | Value                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------ |
| **Base URL**             | `https://vibe-coding-starter-black.vercel.app`                                       |
| **Entry path requested** | `/league`                                                                            |
| **Backend**              | Supabase project `fjtizlmvchymtshjykev` (shared — same DB the prod app uses)         |
| **Auth**                 | Supabase Auth, **httpOnly cookie** session (`sb-*` cookies) set on the auth callback |
| **Health check**         | `GET /api/health` → 200                                                              |

> ⚠️ **`/league` is an AUTHENTICATED route.** Visiting it logged-out **redirects to `/login`**.
> TestSprite must log in first (see §3) before any `/league/*` assertion.
> The **public, no-login** fan surface lives under `/league/public/*` and `/discover`.

---

## 2. Auth model & hard constraints (READ FIRST)

1. **Sign-up is NOT automatable.** Registration requires Supabase email confirmation.
   **Tests must never attempt to register a new user — log in with the seeded accounts only.**
2. **Login flow:** go to `/login`, enter email + password, submit. Session is stored in
   httpOnly cookies; subsequent navigation to `/league/*` works in the same browser context.
3. **Role-based routing.** After login the app routes the user by their `role`
   (`organizer`, `player`, `coach`, `referee`). A given account only sees its role's pages.
   Logging in as the wrong role for a flow will 403/redirect.
4. **Public vs authenticated APIs.** Public fan pages call `/api/league/public/*`
   (no auth, uses admin client). Authenticated pages call `/api/league/*` (returns **401**
   without a session). Do not assert authenticated APIs while logged out.
5. **Cookie-only auth caveat for backend mode.** TestSprite _backend_ mode cannot replay
   the httpOnly `sb-*` cookies, so every protected route returns 401 there. **Use FRONTEND
   mode** (real browser) for all authenticated coverage. Backend mode is only useful for the
   public surface (§7) and negative-auth (401) assertions.

---

## 3. Test accounts

All accounts are pre-seeded and **email-confirmed**. Use them as-is; do not create users.

### Primary seeded accounts — password: `TestPlyaz123!`

| Role          | Email                       | Display name             | Notes                                                                              |
| ------------- | --------------------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| **Organizer** | `organizer.test@plyaz.test` | Test League FC Organizer | Owner of org **"Test League FC"** (slug `test-league-fc`, plan `pro`). Full admin. |
| **Player**    | `player.test@plyaz.test`    | Pedro Player             | Linked to **Lisbon Lions** as a striker (squad #7).                                |
| **Referee**   | `referee.test@plyaz.test`   | Riya Referee             | Assigned to the completed + live matches in the seed.                              |

### Backup demo accounts — password: `Demo1234!`

| Role              | Email                |
| ----------------- | -------------------- |
| Manager/Organizer | `manager@plyaz.demo` |
| Player            | `player1@plyaz.demo` |
| Player            | `player2@plyaz.demo` |
| Referee           | `referee@plyaz.demo` |

Both sets are valid against the same Supabase project. Prefer the `*.test` accounts.

---

## 4. Seeded data inventory (what the accounts can see)

Created by `scripts/seed-test-users.js` under org **Test League FC** (`test-league-fc`):

- **Organization:** Test League FC — plan `pro`, owner = organizer account.
- **Category:** "Senior Men".
- **Venue:** "Central Stadium".
- **Competition:** **"Premier Test League 2026"** — `start_date 2026-05-01`, `end_date 2026-08-30`, `max_teams 8`, group stage with `teams_per_group 4`.
- **Teams (4):** Lisbon Lions (LIS), Porto Panthers (POR), Madrid Mavericks (MAD), Paris Phoenix (PAR). Each team has a roster; the player test account is the Lisbon Lions striker.
- **Matches (6):** statuses in order → `completed, completed, live, upcoming, upcoming, upcoming`.
    - The 2 completed + 1 live match have `referee_id` = referee account and recorded `match_events` (goals).
    - Standings are recalculated from the completed matches.
- **Recruiting:** org is flagged recruiting referees; sample pending player/referee applications exist.

> Because matches include a **live** one and **completed** ones with events, the scoreboard,
> standings, player-stats, and referee live-scoring flows all have real data to render.

---

## 5. Route map — pages (group by role)

The `(group)` segments below are Next.js route groups and **do not appear in the URL**.
e.g. `(manager)/league` is reachable at **`/league`**.

### Auth / onboarding (public)

- `/login`
- `/onboarding`
- `/update-password`

### Public marketing site (no login)

`/` (home) · `/about` · `/features` · `/pricing` · `/faq` · `/help` · `/contact`
· `/careers` · `/press` · `/security` · `/status` · `/privacy` · `/terms` · `/cookies`

### Public fan pages (no login) — see §6 for addressing

- `/league/public` (fan hub — lists competitions)
- `/league/public/standings?competitionId=…`
- `/league/public/matches`
- `/league/public/teams` · `/league/public/teams/[id]`
- `/league/public/players` · `/league/public/players/[id]`
- `/league/public/scoreboard?competitionId=…`
- `/league/public/embed/scoreboard` (embeddable widget)
- `/discover` (public discovery of competitions & teams)

### Organizer / Manager (login as `organizer.test@plyaz.test`)

- `/league` (manager dashboard — **the requested entry point**)
- `/league/categories`
- `/league/venues`
- `/league/invites`
- `/league/organizations`
- `/league/organizations/[organizationId]/users`
- `/league/organizations/[organizationId]/invitations`

### Shared league management (organizer + coach where permitted)

- `/league/create` (create a competition)
- `/league/competitions` · `/league/competitions/[id]`
- `/league/competitions/[id]/config` · `/draw` · `/codes` · `/registrations`
- `/league/fixtures` · `/league/fixtures/generate`
- `/league/matches` · `/league/matches/schedule`
- `/league/matches/[id]` · `/[id]/lineup` · `/[id]/substitutions`
- `/league/teams`
- `/league/players` · `/league/players/[id]/stats`
- `/league/standings`
- `/league/statistics` · `/league/analytics`
- `/league/settings`

### Player & Coach (login as `player.test@plyaz.test`)

- `/league/player/dashboard`
- `/league/player/profile`
- `/league/player/card`
- `/league/player/registration`
- `/league/player/convocation`
- `/league/join/player` · `/league/join/team`
- `/league/coach/dashboard`
- `/league/coach/roster`
- `/league/coach/matches/[id]/squad`

### Referee (login as `referee.test@plyaz.test`)

- `/league/referee` (assigned matches)
- `/league/referee/[id]` (match detail)
- `/league/referee/live/[id]` (live scoring)
- `/league/referee/payouts`

---

## 6. How to reach the public fan pages

`/league/public` lists the org's competitions. Competition-scoped pages require a
`competitionId` query param (returns **400** without it):

1. Open `/league/public`.
2. Click a competition (use **"Premier Test League 2026"**) → routes to
   `/league/public/scoreboard?competitionId=<id>`.
3. Standings: `/league/public/standings?competitionId=<id>`.

The `competitionId` is a runtime UUID — discover it by clicking through the UI, or via
`GET /api/league/public/competitions`.

---

## 7. API surface (69 routes)

### Public (no auth — safe for backend-mode contract tests)

- `GET /api/health`
- `GET /api/league/public/competitions`
- `GET /api/league/public/standings?competitionId=…`
- `GET /api/league/public/matches`
- `GET /api/league/public/teams` · `/teams/[teamId]`
- `GET /api/league/public/players` · `/players/[id]`
- `GET /api/discover/competitions` · `/api/discover/teams`
- `POST /api/newsletter`
- `POST /api/league/invites/verify`

### Authenticated (require session cookie — frontend mode only; 401 otherwise)

League core: `/api/league/competitions(/[id]/{config,draw,codes,groups,registrations,standings,stats,registration-fields})`,
`/api/league/matches(/[id]/{start,end,score,events,squad,photos})`,
`/api/league/teams(/[teamId]/players/[playerId])`, `/api/league/players(/[id]/stats)`,
`/api/league/categories`, `/api/league/venues`, `/api/league/standings/recalculate`,
`/api/league/referees`, `/api/league/player-stats`, `/api/league/player/next-match-status`,
`/api/league/activity`, `/api/league/analytics`, `/api/league/consent`,
`/api/league/invites(/accept,/join)`, `/api/league/organizations`.
Profile/org: `/api/profile`, `/api/organizations/[organizationId]/users(/[userId]/{approve,update-role})`,
`/api/applications(/[id])`.
Payments: `/api/stripe/{checkout,portal,registration-checkout}` (+ webhooks `/api/stripe/webhook`,
`/api/stripe/registration-webhook` — **do not call webhooks from tests**).
Admin: `/api/admin/{enable-demo-recruiting,link-demo-org,recalculate-all-standings}`.
Notifications: `/api/notifications/whatsapp`.

### Do NOT test against production

- `POST /api/stripe/*` checkout/webhooks (real billing side-effects).
- `POST /api/notifications/whatsapp` (sends real messages).

---

## 8. User flows to test (step-by-step)

### Flow A — Public fan experience (no login)

1. Load `/` → marketing home renders, no console errors.
2. Navigate `/features`, `/pricing`, `/faq` → all 200, content present.
3. Open `/league/public` → competition list shows "Premier Test League 2026".
4. Click into scoreboard → live + completed scores render.
5. Open standings (with `competitionId`) → 4 teams ranked, points reflect completed matches.
6. Open `/league/public/teams` → 4 teams; open Lisbon Lions → roster + Pedro Player visible.
7. Open `/league/public/players/[id]` for the striker → stats render.
8. `/discover` → competitions & teams listed.

### Flow B — Organizer (login `organizer.test@plyaz.test` / `TestPlyaz123!`)

1. Login → lands on `/league` (manager dashboard) with org "Test League FC".
2. Visit `/league/competitions` → "Premier Test League 2026" listed; open it.
3. Visit `/league/teams`, `/league/players`, `/league/standings`, `/league/statistics`,
   `/league/analytics` → data renders, no 401/500.
4. `/league/categories`, `/league/venues`, `/league/invites` → existing seed data shows.
5. **Mutating:** `/league/create` → create a throwaway competition; verify it appears, then
   delete it. `/league/fixtures/generate` → generate fixtures for a competition.
6. `/league/settings` → load + save a setting.
7. Org users: `/league/organizations/[organizationId]/users` → list members; review a pending
   application approve/reject (mutating).

### Flow C — Player (login `player.test@plyaz.test` / `TestPlyaz123!`)

1. Login → `/league/player/dashboard`.
2. `/league/player/profile` → Pedro Player; **mutating:** edit a field, save, confirm persist.
3. `/league/player/card` → player card renders.
4. `/league/player/convocation` → next-match / call-up status.
5. `/league/join/team` & `/league/join/player` → join-by-code UI loads.

### Flow D — Referee (login `referee.test@plyaz.test` / `TestPlyaz123!`)

1. Login → `/league/referee` → assigned matches (completed + live) listed.
2. Open the **live** match → `/league/referee/live/[id]`.
3. **Mutating:** record a goal/event via the live scoring UI → score updates; verify it shows
   on the public scoreboard.
4. `/league/referee/payouts` → payout summary renders.

### Flow E — Auth & negative cases

1. Logged-out visit to `/league` → redirects to `/login`.
2. Logged-out `GET /api/league/competitions` → 401.
3. Wrong password on `/login` → error shown, no session.
4. Public API without required param, e.g. `/api/league/public/standings` (no `competitionId`)
   → 400.

---

## 9. After mutating tests — cleanup / reseed

The seed is **idempotent**. To restore the org to a clean state after destructive tests:

```bash
cd /Users/bhujoy/vibe-coding-starter/vibe-coding-starter
npm run seed:test-users      # wipes org slug 'test-league-fc' and recreates everything
```

Requires `.env.local` with the Supabase service-role key (present on the dev machine, not in the repo).

---

## 10. Known gotchas / expected behaviors (don't file these as bugs)

- Mock/simulation repositories exist behind a toggle (`localStorage 'plyaz_simulation_enabled'`
  or `NEXT_PUBLIC_USE_MOCK_REPOS`). **Production has these OFF** — ignore them for prod testing.
- i18n (PT/EN/ES/FR) is live; a language toggle is in the sidebar/user menu. Switching language
  should not break navigation.
- Match `start_date 2026-05-01` → some "upcoming" matches may have past dates relative to the
  test date; that's seed data, not a bug.
- Empty states (e.g. a brand-new competition with no fixtures) are valid, not failures.

---

## 11. Suggested TestSprite configuration

- **Mode:** `frontend` (required for all authenticated coverage — see §2.5).
- **Type:** frontend / Next.js App Router.
- **needLogin:** `true`.
- **Entry pathname:** `/league` (will redirect to `/login` → log in → resume).
- **additionalInstruction (paste this):**
    > "Target the production deployment. Use pre-seeded confirmed accounts:
    > organizer.test@plyaz.test, player.test@plyaz.test, referee.test@plyaz.test — password
    > TestPlyaz123!. Sign-up is NOT automatable (Supabase email confirmation); tests must NOT
    > register new users — log in only. `/league` is authenticated and redirects logged-out
    > users to `/login`. Public fan pages are under `/league/public/*` and need a competitionId
    > query param. Do not call Stripe checkout/webhook or WhatsApp endpoints. Full mutating
    > flows are permitted against the seed org 'test-league-fc'."

---

## 12. Quick reference card

```
PROD URL : https://vibe-coding-starter-black.vercel.app
LOGIN    : /login
ENTRY    : /league   (auth — redirects to /login if logged out)
PUBLIC   : /league/public , /discover  (no login)

ACCOUNTS (password TestPlyaz123!)
  organizer.test@plyaz.test   → organizer / admin
  player.test@plyaz.test      → Pedro Player (Lisbon Lions striker)
  referee.test@plyaz.test     → Riya Referee (live + completed matches)

SEED ORG : Test League FC  (slug: test-league-fc)
COMP     : Premier Test League 2026  (4 teams, 6 matches: 2 done / 1 live / 3 upcoming)

DO NOT TEST : Stripe checkout/webhooks, WhatsApp notifications, user sign-up
RESEED      : npm run seed:test-users
```
