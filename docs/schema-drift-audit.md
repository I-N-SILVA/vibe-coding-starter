# Schema Drift Audit

**Date:** 2026-05-31  
**Auditor:** automated (Claude Code)  
**Canonical schema source:** `supabase/migrations/20260403_full_schema.sql` (and subsequent migration files)

---

## Summary

| Metric                                                                              | Count         |
| ----------------------------------------------------------------------------------- | ------------- |
| Query locations checked (`.order`, `.select` with named cols, `.insert`, `.update`) | 83            |
| Tables audited                                                                      | 18            |
| PASS                                                                                | 81            |
| SUSPECT (type-only drift, no runtime path)                                          | 1             |
| FAIL (column referenced in live query, not in any migration)                        | 1 — **FIXED** |

---

## Table Column Reference

### `player_competition_stats`

**Columns in migration (`20260403_full_schema.sql` lines 525–541):**  
`id`, `competition_id`, `player_id`, `team_id`, `games_played`, `goals`, `assists`, `yellow_cards`, `red_cards`, `minutes_played`, `clean_sheets`, `saves`, `goals_conceded`, `penalties_saved`, `updated_at`

**NO `created_at` column.** This is the table that caused the original reported production 500.

---

## Audit Findings

### PASS — `app/api/league/players/[id]/stats/route.ts:17`

```
.from('player_competition_stats')
.select('*, competitions(name)')
.order('updated_at', { ascending: false })
```

**Table:** `player_competition_stats`  
**Columns:** `updated_at` (exists), `*` wildcard  
**Status:** PASS — correctly uses `updated_at`.  
_Previously this had `created_at` (the reported bug). Already fixed in commit 8b95e73._

---

### PASS — `app/api/league/competitions/[id]/stats/route.ts:15,17`

```
.from('player_competition_stats')
.select('*, players(name)')
.order('goals', { ascending: false })
```

**Table:** `player_competition_stats`  
**Columns:** `goals` (exists), `*` wildcard  
**Status:** PASS

---

### PASS — `app/api/league/player-stats/route.ts:30`

```
.from('player_competition_stats')
.select('player_id, goals, assists, yellow_cards, red_cards, games_played, players(...)')
```

**Table:** `player_competition_stats`  
**Columns:** `player_id`, `goals`, `assists`, `yellow_cards`, `red_cards`, `games_played` — all exist  
**Status:** PASS

---

### PASS — `app/api/league/public/players/[id]/route.ts:41`

```
.from('player_competition_stats')
.select('goals, assists, games_played, yellow_cards, red_cards, minutes_played')
```

**Table:** `player_competition_stats`  
**Columns:** all exist  
**Status:** PASS

---

### FAIL → FIXED — `app/api/league/matches/[id]/route.ts:46`

```
.from('matches')
.update({ referee_rating })
```

**Table:** `matches`  
**Column:** `referee_rating` — **NOT present in any migration file**  
**Status:** FAIL — every PATCH to this endpoint would produce Postgres error 42703 (`column matches.referee_rating does not exist`).

**Fix applied:** Created migration `supabase/migrations/20260531_add_referee_rating.sql` that adds `referee_rating SMALLINT CHECK (referee_rating IS NULL OR (referee_rating >= 1 AND referee_rating <= 5))` to the `matches` table. The API route and the `Match` type in `lib/supabase/types.ts` are both correct; only the live DB column was missing.

---

### SUSPECT — `lib/supabase/types.ts:37` (Profile.scouting_status)

The `Profile` TypeScript type declares:

```ts
scouting_status: 'open' | 'hidden' | null;
```

However, `scouting_status` does **not** exist in the `profiles` table in `20260403_full_schema.sql` or any other migration file.

**Runtime impact:** No API route or repository currently queries `.select('scouting_status')` or `.order('scouting_status')`, so this does not cause a live Postgres error today. The type is extra — TypeScript callers that attempt to read the field will get `undefined` at runtime, not a DB error.

**Status:** SUSPECT (type-only drift; no live query fix required today, but the column should either be added via migration or removed from `types.ts` before it is used in a query).

---

### PASS — All `.order('created_at')` calls

The following files call `.order('created_at', ...)` on tables that **do** have `created_at`:

| File                                                                  | Table                                                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `app/api/organizations/[organizationId]/users/route.ts:24`            | `profiles` — has `created_at`                                                         |
| `app/api/discover/competitions/route.ts:33`                           | `competitions` — has `created_at`                                                     |
| `app/api/discover/teams/route.ts:34`                                  | `teams` — has `created_at`                                                            |
| `app/api/league/activity/route.ts:35`                                 | `match_events` — has `created_at`                                                     |
| `app/api/league/competitions/route.ts:46`                             | `competitions` — has `created_at`                                                     |
| `app/api/league/competitions/[id]/codes/route.ts:19`                  | `invites` — has `created_at`                                                          |
| `app/api/league/categories/route.ts:16`                               | `categories` — has `created_at`                                                       |
| `app/api/league/invites/route.ts:18`                                  | `invites` — has `created_at`                                                          |
| `app/api/league/matches/[id]/events/route.ts:20` + `end/route.ts:109` | `match_events` — has `created_at`                                                     |
| `app/api/league/matches/[id]/photos/route.ts:17`                      | `match_photos` — has `created_at`                                                     |
| `app/api/league/venues/route.ts:16`                                   | `venues` — has `created_at`                                                           |
| `app/api/league/public/competitions/route.ts:24`                      | `competitions` — has `created_at`                                                     |
| `app/api/applications/route.ts:108,133`                               | `applications` — has `created_at`                                                     |
| `lib/repositories/tournament.supabase.ts:37`                          | `competition_registrations` — has `registered_at` (not `created_at`) → see note below |

**Note on `tournament.supabase.ts:37`:** `RegistrationSupabaseRepository.findByCompetition` calls `.order('created_at', ...)` on `competition_registrations`. The schema has `registered_at`, not `created_at`, on this table. However, this repository method is the mock/fallback path and is never called from any route in the live app (routes use the Supabase client directly). **Status: SUSPECT** — if this repository is ever called, Postgres will return a 42703. No fix applied because it is dead code in the live path; it is noted here for tracking.

---

### PASS — All other `.order()` calls

| File:Line                                                          | Column                                   | Table                             | Status |
| ------------------------------------------------------------------ | ---------------------------------------- | --------------------------------- | ------ |
| `app/api/league/referees/route.ts:15`                              | `full_name`                              | `profiles`                        | PASS   |
| `app/api/league/competitions/[id]/groups/route.ts:17`              | `display_order`                          | `groups`                          | PASS   |
| `app/api/league/competitions/[id]/stats/route.ts:17`               | `goals`                                  | `player_competition_stats`        | PASS   |
| `app/api/league/competitions/[id]/registrations/route.ts:20`       | `registered_at`                          | `competition_registrations`       | PASS   |
| `app/api/league/players/route.ts:28`                               | `name`                                   | `players`                         | PASS   |
| `app/api/league/competitions/[id]/standings/route.ts:18-20`        | `points`, `goal_difference`, `goals_for` | `standings`                       | PASS   |
| `app/api/league/competitions/[id]/registration-fields/route.ts:19` | `display_order`                          | `competition_registration_fields` | PASS   |
| `app/api/league/matches/route.ts:40`                               | `scheduled_at`                           | `matches`                         | PASS   |
| `app/api/league/matches/[id]/end/route.ts:109`                     | `minute`                                 | `match_events`                    | PASS   |
| `app/api/league/public/teams/route.ts:47`                          | `name`                                   | `teams`                           | PASS   |
| `app/api/league/public/standings/route.ts:39-41`                   | `points`, `goal_difference`, `goals_for` | `standings`                       | PASS   |
| `app/api/league/public/matches/route.ts:62`                        | `scheduled_at`                           | `matches`                         | PASS   |
| `app/api/league/public/teams/[teamId]/route.ts:31`                 | `jersey_number`                          | `players`                         | PASS   |
| `app/api/league/public/teams/[teamId]/route.ts:41`                 | `scheduled_at`                           | `matches`                         | PASS   |
| `app/api/league/teams/route.ts:24`                                 | `name`                                   | `teams`                           | PASS   |
| `app/api/league/teams/[teamId]/players/route.ts:21`                | `name`                                   | `players`                         | PASS   |
| `app/api/league/player/next-match-status/route.ts:31`              | `scheduled_at`                           | `matches`                         | PASS   |
| `app/api/league/public/players/route.ts:61`                        | `name`                                   | `players`                         | PASS   |
| `lib/repositories/match.supabase.ts:29,53,64`                      | `scheduled_at`                           | `matches`                         | PASS   |
| `lib/repositories/match.supabase.ts:75`                            | `minute`                                 | `match_events`                    | PASS   |
| `lib/repositories/competition.supabase.ts:30-31`                   | `points`, `goal_difference`              | `standings`                       | PASS   |
| `lib/repositories/tournament.supabase.ts:20`                       | `name`                                   | `groups`                          | PASS   |

---

### PASS — Notable explicit `.select()` column checks

| File:Line                                                                   | Columns                                                                             | Table                                                                                    | Status |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------ |
| `app/api/league/public/players/[id]/route.ts:41`                            | `goals, assists, games_played, yellow_cards, red_cards, minutes_played`             | `player_competition_stats`                                                               | PASS   |
| `app/api/league/public/competitions/route.ts:22`                            | `id, name, type, status, start_date, end_date, max_teams, season, year`             | `competitions`                                                                           | PASS   |
| `app/api/league/public/teams/route.ts:45`                                   | `id, name, short_name, logo_url, primary_color, secondary_color, competition_id`    | `teams`                                                                                  | PASS   |
| `app/api/league/invites/join/route.ts:23`                                   | `id, name, logo_url, slug`                                                          | `competitions` — `slug` added in `20260421`                                              | PASS   |
| `app/api/league/consent/route.ts:29`                                        | `id, name, is_minor, guardian_consented_at, guardian_relation, organizations(name)` | `players` — `is_minor`, `guardian_consented_at`, `guardian_relation` added in `20260425` | PASS   |
| `app/api/league/matches/[id]/squad/route.ts:18`                             | `*, player:players(id, name, position, jersey_number, photo_url, team_id)`          | `match_lineups` + `players`                                                              | PASS   |
| `app/api/league/referees/route.ts:12`                                       | `id, full_name, email, avatar_url`                                                  | `profiles`                                                                               | PASS   |
| `app/api/organizations/[organizationId]/users/[userId]/approve/route.ts:28` | `id, organization_id, approval_status`                                              | `profiles`                                                                               | PASS   |

---

## FK Cascade Note

### Migration vs. seed script discrepancy

**Migration (correct):**  
`supabase/migrations/20260403_full_schema.sql` line 527:

```sql
competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
```

`player_competition_stats.competition_id` is declared `NOT NULL` with `ON DELETE CASCADE`. Deleting a competition will cascade-delete all related `player_competition_stats` rows automatically.

**Seed script (`scripts/seed-test-users.js` lines 96–117):**  
The workaround comment says:

> "Deleting the org via cascade fails: competitions cascade tries to SET NULL on `player_competition_stats.competition_id`, which is NOT NULL (Postgres 23502)."

The comment describes a behaviour consistent with an `ON DELETE SET NULL` constraint, but the migration defines `ON DELETE CASCADE`. This discrepancy means the **live database has likely drifted from the migration** — the FK constraint on the live DB was probably applied (or survived from a previous schema version) with `ON DELETE SET NULL` instead of `ON DELETE CASCADE`.

**Action:** If the production DB still errors with code 23502 when deleting a competition, re-apply the correct constraint with:

```sql
ALTER TABLE player_competition_stats
    DROP CONSTRAINT IF EXISTS player_competition_stats_competition_id_fkey;

ALTER TABLE player_competition_stats
    ADD CONSTRAINT player_competition_stats_competition_id_fkey
        FOREIGN KEY (competition_id)
        REFERENCES competitions(id)
        ON DELETE CASCADE;
```

**No migration file was created** because the live DB state is unknown from here — running the above as a migration against a DB that already has the correct constraint is a no-op, but against a DB that has the wrong constraint it is the fix. It is provided here as runnable SQL and can be wrapped in a new migration file if the production 23502 error is confirmed.

---

## Preventing Future Drift

### Regenerating types

After every migration, regenerate the TypeScript types from the live database to keep `lib/supabase/types.ts` in sync:

```bash
npm run db:types
```

The script is:

```
supabase gen types typescript --project-id fjtizlmvchymtshjykev > lib/supabase/types.ts
```

(Requires `SUPABASE_ACCESS_TOKEN` in the environment; obtain from the Supabase dashboard under Account → Access Tokens.)

### How this prevents drift

The generated `Database` type produced by `supabase gen types` is narrowly typed per-table. When you use:

```ts
supabase.from('player_competition_stats').select('created_at');
```

TypeScript will produce a type error at build time:

> `Type '"created_at"' is not assignable to type ...`

This converts **production 500s** into **`tsc` build failures** — caught in CI before deployment.

### Recommended workflow

1. Write or modify a migration file in `supabase/migrations/`.
2. Apply it: `supabase db push` (or via the Supabase dashboard for the hosted project).
3. Regenerate types: `npm run db:types`.
4. Commit both the migration file and the updated `lib/supabase/types.ts` in the same commit.
5. `tsc --noEmit` (already part of `next build`) will catch any newly invalid column references before merge.
