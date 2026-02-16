# PLYAZ League Manager — Comprehensive Analysis & Optimization Plan

> Generated: 2026-02-16 | Build status: PASSING | ALL TASKS COMPLETE

---

## 1. CRITICAL BUGS FOUND (Must Fix Before Deploy)

### BUG-1: Invite Accept API — Wrong Date Filter (BREAKS ALL INVITES)
**File:** `app/api/league/invites/accept/route.ts:32`
```
.lte('expires_at', new Date().toISOString()) // Filter for expired invites
```
**Problem:** `.lte()` means "less than or equal to" — this returns invites that have ALREADY expired, not valid ones. Should be `.gte()` (greater than or equal to current time) to find invites that haven't expired yet.
**Impact:** No invitation can ever be accepted. The query always returns null → "Invalid or expired invitation token" for every valid invite.

### BUG-2: Sign Out Button Doesn't Sign Out
**File:** `components/plyaz/navigation/Sidebar.tsx:83`
```tsx
onClick={() => router.push('/')}
```
**Problem:** The "Sign Out" button in the sidebar just navigates to `/` without calling `signOut()` from AuthProvider. The user's session persists — they remain authenticated.
**Same issue in:** `components/plyaz/navigation/MobileNav.tsx` (needs verification)

### BUG-3: Auth Callback Missing Cookie Propagation
**File:** `app/auth/callback/route.ts:19-21`
```tsx
setAll(cookiesToSet) {
    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
},
```
**Problem:** Cookies are set on the request but NOT on the response. After email confirmation, the session cookie is lost → user appears logged out. Must create a `NextResponse` and set cookies on it (like middleware does).

### BUG-4: Missing `lib/email.ts` Module
**File:** `app/api/league/invites/route.ts:6`
```tsx
import { sendEmail, getInvitationEmailTemplate } from '@/lib/email';
```
**Problem:** `lib/email.ts` does not exist in the codebase. The invite creation API route will throw a runtime error when trying to send an email. Build passes because API routes are dynamically compiled.

### BUG-5: Invites Page Uses Demo Data (Not Connected to API)
**File:** `app/league/invites/page.tsx:25-30`
The invites management page uses hardcoded `DEMO_INVITES` and the "Send Invite" form doesn't call the API (`handleCreate` does nothing).

### BUG-6: Zod v4 `errorMap` Syntax (FIXED)
**File:** `lib/api/validation.ts:145` — Changed `errorMap` to `error` for Zod v4 compatibility. **Already fixed.**

---

## 2. ALL VIEWS BY USER ROLE

### 2.1 Unauthenticated User (Public)

| View | Route | Purpose |
|------|-------|---------|
| Landing Page | `/` | Marketing homepage |
| Login / Sign Up / Forgot | `/login` | Authentication forms |
| Auth Callback | `/auth/callback` | Email confirmation handler |
| Accept Invite | `/invites/accept?token=X` | Invitation acceptance |
| Public Scoreboard | `/league/public/scoreboard` | Live match scores |
| Public Matches | `/league/public/matches` | Match listings |
| Public Teams | `/league/public/teams` | Team directory |
| Public Team Detail | `/league/public/teams/[id]` | Individual team info |
| Public Player Profile | `/league/public/players/[id]` | Player stats |
| Public Standings | `/league/public/standings` | League table |
| Marketing Pages | `/about`, `/features`, `/pricing`, `/faq`, `/contact` | Info pages |
| Legal Pages | `/privacy`, `/terms`, `/cookies`, `/security` | Legal compliance |

### 2.2 Organizer / Admin

| View | Route | Purpose |
|------|-------|---------|
| Onboarding | `/onboarding` | First-time org + league creation |
| Admin Dashboard | `/league` | Overview: stats, live matches, activity |
| Match Management | `/league/matches` | View/manage all matches |
| Schedule Match | `/league/matches/schedule` | Create new matches |
| Team Management | `/league/teams` | Add/edit teams |
| Player Directory | `/league/players` | All players |
| Standings | `/league/standings` | League table (admin view) |
| Fixtures | `/league/fixtures` | Fixture browser |
| Generate Fixtures | `/league/fixtures/generate` | Auto-generate round robin/knockout |
| Invitations | `/league/invites` | Send & manage invites |
| Analytics | `/league/analytics` | Charts and metrics |
| Statistics | `/league/statistics` | Detailed stats |
| Referee Dashboard | `/league/referee` | Assign referees |
| Live Match Control | `/league/referee/[id]` | Real-time score updates |
| Settings | `/league/settings` | League configuration |
| Org Management | `/league/organizations` | Organization settings |
| User Management | `/league/organizations/[orgId]/users` | Approve/manage members |
| Org Invitations | `/league/organizations/[orgId]/invitations` | Organization invites |

### 2.3 Player

| View | Route | Purpose |
|------|-------|---------|
| Player Dashboard | `/league/player/dashboard` | Personal stats, schedule, team |
| Player Profile | `/league/player/profile` | Edit personal info |
| All Public Views | `/league/public/*` | View league as spectator |

### 2.4 Referee

| View | Route | Purpose |
|------|-------|---------|
| Referee Dashboard | `/league/referee` | Assigned matches |
| Live Match Control | `/league/referee/[id]` | Score entry, events, cards |
| All Public Views | `/league/public/*` | View league as spectator |

### 2.5 Manager

| View | Route | Purpose |
|------|-------|---------|
| Admin Dashboard | `/league` | (shares admin layout) |
| Team Management | `/league/teams` | Manage own team |
| All Public Views | `/league/public/*` | View league as spectator |

### 2.6 Fan

| View | Route | Purpose |
|------|-------|---------|
| All Public Views | `/league/public/*` | Full public access |
| Statistics | `/league/statistics` | Detailed league stats |

---

## 3. USER FLOWS

### Flow 1: New Organizer Sign-Up
```
Landing (/) → Sign Up (/login?mode=signup)
  → Select "League Organiser" role
  → Submit → "Check Your Email" confirmation screen
  → Click email link → /auth/callback → /onboarding
  → Enter league name + type → "LAUNCH DASHBOARD"
  → Creates org + competition → /league (Admin Dashboard)
```

### Flow 2: Invited User (e.g., Player)
```
Receives email with invite link
  → /invites/accept?token=XXX
  → If not logged in: redirect to /login?invite_token=XXX
  → Sign up form pre-filled with email + role from invite
  → Submit → email confirmation → /auth/callback
  → Profile auto-approved with org_id → /league
```

### Flow 3: Sign In (Existing User)
```
/login → Enter email + password → Submit
  → AuthProvider.signIn() → Supabase session
  → useEffect checks profile:
    - Has org_id? → /league
    - No org_id + organizer? → /onboarding
    - No org_id + other role? → /league/public/matches
```

### Flow 4: Sign Out
```
Sidebar "Sign Out" button → calls signOut()
  → Clears Supabase session → clears local state
  → Redirect to /
```
**BROKEN:** Currently just navigates to `/` without calling `signOut()`.

### Flow 5: Admin Sends Invitation
```
/league/invites → Click "Send Invite"
  → Enter email + select role → Submit
  → POST /api/league/invites → creates invite record
  → Sends email with link: /invites/accept?token=XXX
```
**BROKEN:** Invites page uses demo data, form doesn't call API.

### Flow 6: Forgot Password
```
/login → Click "Forgot your password?"
  → Enter email → Submit → "Password reset link sent"
  → Click email link → Supabase handles reset
```

### Flow 7: Admin Match Management
```
/league → "Schedule Match" quick action
  → /league/matches/schedule → fill form → create match
  → Match appears in /league/matches
  → Start match → /league/referee/[id] (live control)
  → Update scores, add events → End match
  → Results in /league/standings
```

### Flow 8: Referee Live Match
```
/league/referee → See assigned matches
  → Click match → /league/referee/[id]
  → Start match → Live score updates
  → Add events (goals, cards, subs)
  → End match → final score saved
```

---

## 4. MOBILE OPTIMIZATION AUDIT

### Currently Good
- Login page: `max-w-sm`, responsive text (`text-2xl md:text-3xl`)
- Dashboard: `grid-cols-2 md:grid-cols-4` stat cards
- Invites: `flex-col md:flex-row` header, scrollable filter pills
- Cards: proper padding (`p-3 md:p-4`), truncated text
- MobileNav component exists for hamburger menu

### Issues to Fix
| Issue | Location | Fix |
|-------|----------|-----|
| Tables overflow on mobile | standings, players, org users | Add `overflow-x-auto` wrapper or card-based mobile layout |
| No bottom navigation | Player/fan mobile views | Add fixed bottom nav for key actions |
| Sidebar hidden on mobile but no clear mobile nav trigger in league pages | PageLayout | Ensure MobileNav hamburger is always visible on small screens |
| Create League modal may be too wide | `/league` dashboard modal | Add `max-w-sm` on mobile |
| Long invite codes hidden on mobile | `/league/invites` invite cards | Codes have `hidden sm:flex` — need mobile tap-to-copy |
| Onboarding select dropdown | `/onboarding` | Uses plain `<select>` instead of PLYAZ Select component |

---

## 5. DEPLOYMENT-BLOCKING ISSUES

### 5.1 Missing `lib/email.ts`
The invite API route imports from `lib/email.ts` which doesn't exist. This will crash at runtime when an admin tries to send an invite.

**Fix:** Create a minimal email module or make email sending optional with a try/catch.

### 5.2 Auth Callback Cookie Bug
After email confirmation, the session isn't properly persisted in cookies on the response, causing users to appear logged out after verifying their email.

### 5.3 Invite Accept Date Filter
The `.lte()` filter means no invite can ever be accepted successfully.

---

## 6. COMPREHENSIVE FIX PLAN

### Phase 1: Critical Bug Fixes (Deploy Blockers)

**1.1 Fix invite accept date filter**
- File: `app/api/league/invites/accept/route.ts:32`
- Change `.lte('expires_at', ...)` to `.gte('expires_at', ...)`

**1.2 Fix sign out button**
- File: `components/plyaz/navigation/Sidebar.tsx:82-90`
- Import `useAuth`, call `signOut()` before redirecting
- Same fix for `MobileNav.tsx`

**1.3 Fix auth callback cookie propagation**
- File: `app/auth/callback/route.ts`
- Create response with `NextResponse.redirect()` and set cookies on it

**1.4 Create `lib/email.ts`**
- Create module with `sendEmail()` and `getInvitationEmailTemplate()`
- Use Resend, SendGrid, or a no-op stub with logging for now
- Wrap in try/catch so invite creation doesn't fail if email fails

### Phase 2: Functional Completeness

**2.1 Connect invites page to real API**
- File: `app/league/invites/page.tsx`
- Replace `DEMO_INVITES` with `useSWR('/api/league/invites')`
- Wire `handleCreate` to POST `/api/league/invites`
- Add delete/resend functionality

**2.2 Replace hardcoded dashboard stats**
- File: `app/league/page.tsx:99,115`
- Fetch real team count and player count from API
- Remove hardcoded "24" and "156"

**2.3 Wire Create League modal**
- File: `app/league/page.tsx:248-275`
- Add state management and POST to `/api/league/competitions`

**2.4 Add missing join routes**
- Create `app/league/join/player/page.tsx`
- Create `app/league/join/team/page.tsx`
- Or remove references if using invite-only flow

### Phase 3: Mobile Optimization

**3.1 Responsive tables**
- Wrap all `<table>` elements in `overflow-x-auto` containers
- Consider card-based layout for standings on mobile

**3.2 Mobile invite codes**
- Add tap-to-copy for invite codes on mobile (currently `hidden sm:flex`)

**3.3 Bottom navigation for player/fan**
- Add fixed bottom nav bar on mobile for key player actions

**3.4 Onboarding select component**
- Replace plain `<select>` with PLYAZ `<Select>` component

### Phase 4: Consistency & Polish

**4.1 Unify component library usage**
- `app/league/organizations/[orgId]/invitations/page.tsx` uses shadcn Table
- Should use PLYAZ design system components

**4.2 Error boundaries**
- Add error.tsx files for key route segments
- Add loading.tsx for better SSR experience

**4.3 Empty states for activity feed**
- Dashboard "Recent Activity" shows nothing when empty
- Add EmptyState component

### Phase 5: Vercel Deployment Checklist

- [x] Build passes (`next build` succeeds)
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` in Vercel env vars
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env vars
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` if used by server routes
- [ ] Configure Supabase auth redirect URLs for production domain
- [ ] Set email confirmation redirect URL in Supabase dashboard
- [ ] Configure `NEXT_PUBLIC_SITE_URL` for invite link generation
- [ ] Test auth callback flow end-to-end on deployed URL
- [ ] Verify middleware doesn't block API routes (currently OK: `/api/` is public)
- [ ] Check rate limiting works with Vercel's serverless functions
- [ ] Update `browserslist` database (`npx update-browserslist-db@latest`)

---

## 7. PRIORITY ORDER

| Priority | Task | Impact |
|----------|------|--------|
| P0 | Fix invite accept date filter | Invite flow completely broken |
| P0 | Fix sign out button | Users can't log out |
| P0 | Fix auth callback cookies | Email confirmation breaks login |
| P0 | Create lib/email.ts stub | Runtime crash on invite send |
| P1 | Connect invites page to API | Core admin feature non-functional |
| P1 | Wire create league modal | Dashboard feature non-functional |
| P1 | Replace hardcoded stats | Misleading data |
| P2 | Mobile table overflow fixes | UX issue on small screens |
| P2 | Mobile invite code access | Feature inaccessible on mobile |
| P3 | Unify component library | Design consistency |
| P3 | Add error boundaries | Production resilience |
| P3 | Bottom mobile navigation | Enhanced mobile UX |
