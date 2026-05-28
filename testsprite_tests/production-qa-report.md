# Production QA Sweep — vibe-coding-starter-black.vercel.app

- **Date:** 2026-05-27
- **Method:** Playwright browser sweep across roles (organizer, player, referee) + public view
- **Backend:** same Supabase project as local (`fjtizlmvchymtshjykev`) — seeded accounts/data work on prod
- **Note:** the production frontend is a **more advanced build** than local (grouped nav: Competition/People/Operations/Growth/Config, Português toggle, global search, notifications). Several behaviours differ from local.

## Route results

| Area      | Route                    | Result | Notes                                                                                                               |
| --------- | ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------- |
| Auth      | /login → /league         | ✅     | Organizer login works; 0 console errors on dashboard (local had a JSON-parse error here — **fixed/absent on prod**) |
| Organizer | /league/teams            | ✅     | All 4 seeded teams render under "Premier Test League 2026"                                                          |
| Organizer | /league/standings        | ⚠️     | Table renders correctly, but realtime WebSocket blocked by CSP (see Bug 1)                                          |
| Organizer | /league/matches          | ✅     | 2 FINAL, 1 LIVE, 3 UPCOMING + live ticker ("LIS 1-0 MAD • LIVE") + filter tabs                                      |
| Organizer | /league/players          | ✅     | All 28 seeded players render with search/filter                                                                     |
| Public    | /league/public/standings | ❌     | React hydration error #418 + no competition preselected (empty table)                                               |
| Player    | /league/player/dashboard | ⚠️     | Renders ("Athlete Dashboard", Pedro, Find a Team) but stats API 500s (Bug 4)                                        |
| Referee   | /league/referee          | ✅     | Fully populated: 2 matches, $90 fees, 1 LIVE today w/ RESUME, 2 past, seeded recruitment opportunity                |

## Bugs found (production)

### Bug 1 — Realtime WebSocket blocked by CSP (High)

On `/league/standings`, the app opens `wss://fjtizlmvchymtshjykev.supabase.co/realtime/v1/websocket?...` but the production **Content-Security-Policy `connect-src`** lists `https://*.supabase.co` and omits the `wss:` scheme, so the connection is blocked: _"violates the following Content Security Policy directive: connect-src ..."_. **Live/real-time standings and scores do not update on prod.**

- **Fix:** add `wss://*.supabase.co` to the `connect-src` CSP directive (likely in `next.config.js` headers or `middleware.ts`).

### Bug 2 — Anon key has a trailing newline (Medium)

The blocked WS URL ends with `...exp:2086483718}.A6i0...7Cc%0A&vsn=2.0.0` — the `%0A` is a URL-encoded newline appended to the apikey. The Vercel env var `NEXT_PUBLIC_SUPABASE_ANON_KEY` appears to contain a trailing newline.

- **Fix:** re-paste the anon key in Vercel without a trailing newline.

### Bug 3 — Public standings hydration mismatch + empty default (Medium)

`/league/public/standings` throws **React error #418** (server/client hydration text mismatch) and shows _"Select a competition to view standings."_ with nothing preselected, so a fan sees an empty table.

- **Fix:** preselect the active competition; resolve the hydration mismatch (usually locale/date or `Math.random`/`Date.now` rendered during SSR).

### Bug 4 — Player stats endpoint returns 500 (High)

`GET /api/league/players/{playerId}/stats` returns **HTTP 500** (fired 3×) on the player dashboard. The dashboard degrades gracefully ("Play in more competitions to see your trend") but the API is erroring.

- **Fix:** inspect `app/api/league/players/[id]/stats/route.ts` — likely a failing query/join when no `player_competition_stats` rows exist for the player.

### Bug 5 — Referee "Total Matches" count (Low)

Referee was assigned 3 matches (1 live + 2 completed) but the dashboard "Total Matches" stat shows **2**. Possible off-by-one / live-match exclusion in the count.

## What works well on prod

- Auth + role routing for all three roles.
- Organizer management pages (teams, matches, players, standings table) render seeded data accurately.
- Match lifecycle states (FINAL/LIVE/UPCOMING), live ticker, filter tabs.
- Referee dashboard: assignments, fees, live-match resume, recruitment opportunities.
- No dashboard JSON-parse error on prod (the local-only bug does not reproduce here).

---

## 2026-05-28 update — fixes committed (not yet deployed)

All 5 bugs above have code fixes committed to this repo. They land on prod the next time `origin/main` is deployed.

| Bug                                     | File                                               | Change                                                                                                                                           |
| --------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 — CSP blocks wss                      | `next.config.js`                                   | Added `wss://*.supabase.co` to `connect-src`.                                                                                                    |
| 2 — anon key newline                    | `lib/supabase/client.ts`, `lib/supabase/server.ts` | Trim env vars at read time so a trailing newline can't corrupt the realtime apikey.                                                              |
| 3 — standings hydration + empty default | `app/(public)/league/public/standings/page.tsx`    | Resolves competition list and preselects the active one; reads `window.location.origin` only after mount to remove the SSR/client text mismatch. |
| 4 — player stats 500                    | `app/api/league/players/[id]/stats/route.ts`       | `ORDER BY updated_at` — `created_at` doesn't exist on `player_competition_stats`.                                                                |
| 5 — referee Total Matches               | `app/(referee)/league/referee/page.tsx`            | Stat sums live + scheduled + upcoming + completed instead of just completed.                                                                     |

### Regression coverage shipped alongside the fixes

- `e2e/regression/public-bugs.spec.ts` — Bug 1 CSP header, Bug 3a empty-default copy gone, Bug 3b no React hydration errors on `/league/public/standings`.
- `e2e/authenticated/referee.spec.ts` — Bug 5: `Total Matches >= Today`.
- `e2e/authenticated/organizer.spec.ts` + `player.spec.ts` — Bug 4: authenticated `GET /api/league/players/:id/stats` is not 500.

Run against prod:

```bash
PLAYWRIGHT_BASE_URL=https://vibe-coding-starter-black.vercel.app npm run test:e2e
```

These 5 regression tests are expected to **fail until origin/main is deployed**. They pass after.
