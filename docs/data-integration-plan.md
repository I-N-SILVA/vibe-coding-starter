# Data Integration Plan — PLYAZ + External Apps

## Context

PLYAZ manages player profiles, match history, statistics, teams, and competitions.
The goal is to connect this data with other applications (e.g. scouting platforms, club management tools, mobile apps) without duplicating it or losing history.

---

## Core Data Entities to Expose

| Entity         | Key Fields                                                           | Lives In                    |
| -------------- | -------------------------------------------------------------------- | --------------------------- |
| Player profile | id, full_name, position, avatar_url, nationality, jersey_number, bio | `profiles` table            |
| Player stats   | goals, assists, cards, games_played, minutes_played per competition  | `player_competition_stats`  |
| Match history  | date, home/away teams, score, events (goals, cards)                  | `matches` + `match_events`  |
| Team           | name, logo_url, primary_color, competition                           | `teams`                     |
| Competition    | name, type, season, status                                           | `competitions`              |
| Registration   | player → competition mapping, payment status                         | `competition_registrations` |

---

## Integration Approaches (pick one per use case)

### Option A — Shared Supabase project (simplest, recommended first)

If the other app can connect to the same Supabase project:

- Use Row Level Security (RLS) to scope what each app can read/write
- Create a read-only service role or a dedicated Postgres role for the external app
- Zero data duplication, always in sync
- Best for apps you own and control

**Steps:**

1. Create a dedicated DB role in Supabase with SELECT on relevant tables
2. Share the connection string (not the service role key) with the other app
3. Define which tables are readable vs writable per app

---

### Option B — REST API (current PLYAZ endpoints, extend as needed)

PLYAZ already exposes public read endpoints:

```
GET /api/league/public/players          — player directory
GET /api/league/public/players/[id]     — player profile + career stats
GET /api/league/public/teams            — team list
GET /api/league/public/teams/[id]       — team + roster + matches
GET /api/league/public/standings        — league table
GET /api/league/public/matches          — live + upcoming matches
GET /api/league/public/competitions     — competition list
```

**To extend for cross-app use:**

- Add an `?org_slug=` query param to scope by league (currently uses cookie session)
- Add a read-only API token mechanism (simple: a `api_keys` table checked in middleware)
- Document the response shape for each endpoint as a stable contract

**Steps:**

1. Add `api_keys` table: `id, key_hash, org_id, description, created_at`
2. Create middleware to accept `Authorization: Bearer <key>` on public routes
3. Version the endpoints as `/api/v1/...` once the contract is stable

---

### Option C — Webhooks (event-driven, for real-time sync)

Fire events when key things happen so the other app can react:

| Trigger              | Payload                                              |
| -------------------- | ---------------------------------------------------- |
| Match ends           | `{ match_id, home_score, away_score, events[] }`     |
| Player registers     | `{ player_id, competition_id, team_id }`             |
| Player stats updated | `{ player_id, competition_id, goals, assists, ... }` |
| New team created     | `{ team_id, name, org_id }`                          |

**Steps:**

1. Add a `webhooks` table: `url, secret, events[]` — one row per subscriber
2. After each DB write, POST the event to registered URLs (use Supabase Edge Functions or a Next.js background job)
3. Sign each request with HMAC-SHA256 so the receiver can verify authenticity

---

## Player History — Specific Notes

Player history is the most portable data. Each player has:

- A stable `profiles.id` (UUID, never changes)
- Stats per competition via `player_competition_stats`
- Match-level events via `match_events` (who scored what in which match)

**For migration to another app:**

```sql
-- All stats for a player, across all competitions
SELECT
  p.full_name,
  c.name AS competition,
  c.season,
  pcs.goals,
  pcs.assists,
  pcs.yellow_cards,
  pcs.red_cards,
  pcs.games_played,
  pcs.minutes_played
FROM player_competition_stats pcs
JOIN profiles p ON p.id = pcs.player_id
JOIN competitions c ON c.id = pcs.competition_id
WHERE p.id = '<player_uuid>';
```

This query is the source of truth. Any migration script or API endpoint should use this shape.

---

## Recommended Sequence

1. **Now (MVP):** Use shared Supabase if possible. Fastest path, no new infrastructure.
2. **When you have a second live app:** Add the read-only API token system (Option B extension). Exposes a stable, versioned API without sharing DB credentials.
3. **When you need real-time sync:** Add webhooks for match events and player registrations.
4. **Later:** If apps diverge significantly (different tech stacks, different owners), move to an event bus (e.g. Supabase Realtime subscriptions, or a simple Redis pub/sub with Upstash — already configured in env vars).

---

## What Not To Do

- Do not copy player data between databases manually — divergence is inevitable
- Do not use the Supabase `service_role` key in any client-facing code
- Do not build a custom sync layer before validating the API approach works
