# PLYAZ League Manager - PRD & Progress Tracker

## Original Problem Statement
User requested a thorough review of the PLYAZ repo, ensure everything works end-to-end, fix issues, provide improvement suggestions, and enhance the frontend with beautiful components and animations from 21st.dev / Magic UI. Focus on both landing page + dashboard, light and dark themes, billing skipped for now.

## Architecture
- **Framework**: Next.js 15 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS + Custom Design System (PLYAZ components)
- **State Management**: React Query (TanStack)
- **Animations**: Framer Motion
- **Payments**: Stripe (skipped for now)
- **Hosting**: Kubernetes/Preview environment with FastAPI reverse proxy

## User Personas
1. **League Manager** - Creates/manages leagues, competitions, teams, matches
2. **Referee** - Records match results, manages match events
3. **Player** - Views stats, profiles, match history
4. **Public Fan** - Browses public competitions, matches, standings, teams

## Core Requirements
- Multi-role authentication (manager, referee, player, public)
- Competition management (leagues, knockouts)
- Team and player management
- Match scheduling and live scoring
- Public-facing league pages
- Responsive design with dark/light mode

## What's Been Implemented - Phase 1 (March 31, 2026)

### Bug Fixes
- [x] Fixed conflicting dynamic route slugs (`[id]` vs `[teamId]` in `/api/league/teams/`)
- [x] Fixed `next.config.js` deprecated `experimental.outputFileTracingRoot`
- [x] Fixed "SIGN OUT" showing on public pages (now shows "Admin Login")
- [x] Set up Supabase credentials (`.env.local`)
- [x] Created FastAPI reverse proxy backend for API routing
- [x] Added `/api/health` endpoint

### Visual Enhancements
- [x] **Landing Page Hero** - Animated grid background, gradient "ELITE TALENT" text, animated counters (24k+, 1200+, 99.9%), dual CTA buttons
- [x] **Navigation** - Frosted glass navbar, mobile hamburger menu with animation
- [x] **MetricFeatureGrid** - 4 feature cards with gradient accents, animated counters, hover effects
- [x] **Statistics Section** - Dark background with dot grid, animated stat cards
- [x] **CTA Section** - Gradient text "START YOUR LEGACY NOW"
- [x] **Footer** - Organized with Protocol/Social/Legal columns
- [x] **Login Page** - Split layout with branding panel + form, gradient text
- [x] **Dark Mode** - Full dark mode support across landing, login, sidebar, navbar, cards, mobile nav, page headers

### Testing Results
- Frontend UI: 100%
- Navigation: 100%
- Public Pages: 100%
- Login/Auth UI: 100%
- Dark Mode: 100%
- API Health: 100%

## Prioritized Backlog

### P0 - Critical
- [ ] End-to-end auth flow testing (sign up, verify email, sign in, redirect to dashboard)
- [ ] Manager dashboard functionality (create competition, add teams, schedule matches)

### P1 - High Priority
- [ ] Dashboard stat cards with animated counters and gradient borders
- [ ] Match detail pages with live scoring UI
- [ ] Team detail pages with player roster
- [ ] Standings table with sortable columns
- [ ] Player profile pages

### P2 - Medium Priority
- [ ] Referee match recording interface polish
- [ ] Player discovery/scouting features
- [ ] Statistics visualization (charts, graphs)
- [ ] Push notifications for match updates
- [ ] Search functionality across entities

### P3 - Nice to Have
- [ ] Stripe billing integration
- [ ] Export data (PDF reports, CSV)
- [ ] Social sharing for match results
- [ ] SEO optimization for public pages
- [ ] PWA support for mobile

## Detailed Micro-Task Organization (for step-by-step prompting)

### Task Group 1: Auth Flow Verification
1. T1.1 - Test complete signup flow with Supabase
2. T1.2 - Test login flow and redirect to dashboard
3. T1.3 - Test password reset flow
4. T1.4 - Test middleware auth guards

### Task Group 2: Manager Dashboard Polish
5. T2.1 - Enhance league overview page with animated stat cards
6. T2.2 - Polish competition creation modal
7. T2.3 - Enhance team management page with data tables
8. T2.4 - Polish match scheduling interface
9. T2.5 - Add match result recording flow

### Task Group 3: Public Pages Enhancement
10. T3.1 - Enhance public matches page with filterable cards
11. T3.2 - Polish standings table with team logos
12. T3.3 - Enhance team detail pages
13. T3.4 - Add player profile cards

### Task Group 4: Dark Mode Completion
14. T4.1 - Audit remaining components for dark mode
15. T4.2 - Fix any dark mode inconsistencies in modals/dropdowns
16. T4.3 - Dark mode for data tables and charts

### Task Group 5: Advanced Features
17. T5.1 - Real-time match updates (if websockets available)
18. T5.2 - Statistics dashboard with charts
19. T5.3 - Search/filter functionality
20. T5.4 - Stripe billing (when ready)

## Next Steps
- Continue with Task Group 1 (Auth Flow) or Task Group 2 (Dashboard Polish) based on user preference
