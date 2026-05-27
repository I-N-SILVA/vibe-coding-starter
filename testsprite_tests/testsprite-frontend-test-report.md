# TestSprite Frontend Testing Report (PLYAZ)

---

## 1️⃣ Document Metadata
- **Project:** vibe-coding-starter (PLYAZ League Manager)
- **Date:** 2026-05-27
- **Test Type:** Frontend (codebase scope)
- **Environment:** http://localhost:6006 (Next.js dev server, real Supabase backend)
- **Auth:** Pre-confirmed seeded accounts (organizer / player / referee), password `TestPlyaz123!`
- **Result:** 15 / 15 passed (100%)

---

## 2️⃣ Requirement Validation Summary

### Authentication & Onboarding
| Test | Name | Status |
|------|------|--------|
| TC001 | Sign in with valid credentials | ✅ |
| TC003 | Complete organizer onboarding and create a league | ✅ |
| TC009 | Complete onboarding with a selected role | ✅ |
| TC011 | Accept an invite and gain access | ✅ |

### League Setup & Management
| Test | Name | Status |
|------|------|--------|
| TC004 | Create a new league | ✅ |
| TC012 | Manage league venues and categories | ✅ |
| TC015 | Update league settings | ✅ |

### Competition Administration
| Test | Name | Status |
|------|------|--------|
| TC008 | Configure a competition and review registrations and standings | ✅ |
| TC010 | Configure a competition successfully | ✅ |
| TC013 | Run a competition draw successfully | ✅ |
| TC014 | Run a competition draw and view generated pairings | ✅ |

### Match Operations & Live Scoring
| Test | Name | Status |
|------|------|--------|
| TC002 | Record match events and end the match | ✅ |
| TC005 | Complete a match with live events | ✅ |
| TC006 | Check an assigned referee match and open live scoring | ✅ |
| TC007 | Record referee live events and close the match | ✅ |

---

## 3️⃣ Coverage & Matching Metrics
- **100%** passed (15/15)

| Requirement | Total | ✅ | ❌ |
|-------------|-------|----|----|
| Authentication & Onboarding | 4 | 4 | 0 |
| League Setup & Management | 3 | 3 | 0 |
| Competition Administration | 4 | 4 | 0 |
| Match Operations & Live Scoring | 4 | 4 | 0 |
| **Total** | **15** | **15** | **0** |

Dev-server mode caps execution at 15 high-priority tests. For more, run a production build (`npm run build && npm run serve`) and re-execute.

---

## 4️⃣ Key Gaps / Risks
1. **Dashboard stat-card bug (found manually).** `/league` console error `Unexpected token '<' ... is not valid JSON` — a summary fetch returns HTML instead of JSON; "Leagues" and "Teams" cards show 0 despite data existing. Functional tests passed because they use the dedicated Teams/Standings pages.
2. **Signup not automatable** (email confirmation) — tests rely on seeded accounts; keep `scripts/seed-test-users.js` current with schema changes.
3. **Dev-server cap** limited the run to 15 tests; no negative-auth or role-gate-enforcement cases yet.

Per-test result URLs are in `testsprite_tests/tmp/` artifacts and the TestSprite dashboard.
