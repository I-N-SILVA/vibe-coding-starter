# TestSprite Backend Testing Report (PLYAZ)

---

## 1️⃣ Document Metadata
- **Project:** vibe-coding-starter (PLYAZ League Manager)
- **Date:** 2026-05-27
- **Test Type:** Backend API (codebase scope)
- **Environment:** http://localhost:6006/api (Next.js route handlers, Supabase cookie-based auth)
- **Result:** 0 / 1 passed — the single generated test failed on session-cookie acquisition (harness limitation, not a product defect).

---

## 2️⃣ Requirement Validation Summary

### Authentication & Session
| Test | Name | Status |
|------|------|--------|
| TC001 | PATCH /api/profile — update authenticated user profile | ❌ Failed |

- **Failure:** `AssertionError: Authentication failed: no Supabase auth cookies found after login.`
- **Root cause:** The backend test harness performs an HTTP login and then expects to read the auth token, but Supabase SSR stores the session in **httpOnly `sb-*` cookies** that the harness did not capture/replay. The protected route correctly requires that cookie, so the request was unauthenticated.
- **Not a product bug:** The identical login succeeds in the frontend run (TC001) and in manual browser verification — the organizer reaches `/league` and the authenticated `/api/league/*` calls return 200. The failure is the test harness's inability to carry httpOnly cookies, which is the documented constraint below.

---

## 3️⃣ Coverage & Matching Metrics
- **0%** passed (0/1). TestSprite generated only one backend case for this run.

| Requirement | Total | ✅ | ❌ |
|-------------|-------|----|----|
| Authentication & Session | 1 | 0 | 1 |

---

## 4️⃣ Key Gaps / Risks
1. **Cookie-only auth blocks HTTP backend testing.** `lib/supabase/server.ts` authenticates via httpOnly cookies with no bearer-token path. TestSprite's HTTP backend runner can't acquire/replay those cookies, so protected routes are untestable via pure HTTP.
   - **Options:** (a) test protected routes through the browser (frontend mode, which already passed); (b) add a test-only bearer-token acceptance path guarded by env flag; (c) run authenticated API tests with a script that logs in via `supabase.auth.signInWithPassword` and replays the session, outside TestSprite.
2. **Thin generated plan.** Only 1 backend case was produced. Public endpoints that need no auth — `GET /api/discover/teams`, `GET /api/discover/competitions`, `POST /api/newsletter`, `POST /api/league/invites/verify` — and negative-auth assertions (401 on protected routes when unauthenticated) are the highest-value backend tests and should be added explicitly.
3. **Stripe endpoints** were intentionally not exercised against live charges; only signature/auth behavior is worth asserting.

### Recommendation
Backend coverage is best achieved here by (a) keeping the **frontend** suite as the primary integration check (it exercises the API through the UI and passed 100%), and (b) adding a small standalone authenticated-API test script using the Supabase JS client for direct contract testing. The cookie-only design makes TestSprite's HTTP backend mode a poor fit for protected routes without a test-mode token path.
