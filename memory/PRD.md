# PLYAZ League Manager - PRD & Progress Tracker

## Original Problem Statement
User requested a thorough review of the PLYAZ repo, ensure everything works end-to-end, fix issues, provide improvement suggestions, and enhance the frontend with beautiful components and animations from 21st.dev / Magic UI. Focus on both landing page + dashboard, light and dark themes, billing skipped for now. Also requested shareable match result card feature.

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
- Shareable match result cards

## What's Been Implemented

### Phase 1 - Bug Fixes & Infrastructure (March 31, 2026)
- [x] Fixed conflicting dynamic route slugs (`[id]` vs `[teamId]` in `/api/league/teams/`)
- [x] Fixed `next.config.js` deprecated `experimental.outputFileTracingRoot`
- [x] Fixed "SIGN OUT" showing on public pages (now shows "Admin Login")
- [x] Set up Supabase credentials (`.env.local`)
- [x] Created FastAPI reverse proxy backend for API routing
- [x] Added `/api/health` endpoint

### Phase 2 - Landing Page Visual Upgrade (April 1, 2026)
- [x] **Hero Section** - Animated grid background, gradient "ELITE TALENT" text, animated counters (24k+, 1200+, 99.9%), dual CTA buttons with Link components
- [x] **Navigation** - Frosted glass navbar, mobile hamburger menu with animation
- [x] **MetricFeatureGrid** - 4 feature cards with gradient accents, animated counters, hover effects
- [x] **Statistics Section** - Dark background with dot grid, animated stat cards
- [x] **CTA Section** - Gradient text "START YOUR LEGACY NOW"
- [x] **Footer** - Organized with Protocol/Social/Legal columns

### Phase 3 - Auth Pages Enhancement (April 1, 2026)
- [x] **Login Page** - Split layout with branding panel + form
- [x] **Signup Mode** - Full name, confirm password fields
- [x] **Theme Toggle** - Added to login page
- [x] Gradient "precision" text on branding panel
- [x] Feature bullets with orange accents

### Phase 4 - Dashboard & Component Dark Mode (April 1, 2026)
- [x] **Card** - Dark mode support with neutral-800/50 backgrounds
- [x] **StatCard** - Animated counters, gradient borders, dark mode
- [x] **TeamCard** - Avatar fallbacks, stat grid, dark mode
- [x] **PlayerCard** - Position badges, stat display, dark mode
- [x] **MatchCard** - Score display, team logos, dark mode
- [x] **Badge/StatusBadge** - All variants with dark mode
- [x] **Modal** - Dark mode with neutral-900 background
- [x] **EmptyState** - Dark mode support
- [x] **Skeleton** - Dark mode loading states
- [x] **TabPills** - Dark mode pill styling
- [x] **PageHeader** - Dark mode text colors
- [x] **Sidebar** - Dark mode borders, active states
- [x] **Navbar** - Dark mode with backdrop blur
- [x] **MobileNav** - Dark mode bottom nav
- [x] **PageLayout** - Dark mode background
- [x] **ThemeToggle** - Updated hover colors
- [x] **PlyazLogo** - Works in both modes

### Phase 5 - Public Pages Enhancement (April 1, 2026)
- [x] **Matches Page** - Tab filtering (All/Live/Upcoming/Completed), match cards with score display, share hint
- [x] **Standings Page** - League table with rankings, form indicators (W/D/L badges), Table/Bracket toggle
- [x] **Teams Page** - Team cards with stats
- [x] **League Page** - Competition cards with dark mode

### Phase 6 - Shareable Match Card Feature (April 1, 2026)
- [x] **ShareableMatchCard** component - Branded dark card with team initials, score display, gradient accents
- [x] **Share Modal** - Click completed match to open share modal
- [x] **html2canvas** integration for image generation
- [x] **Web Share API** with fallback download
- [x] PLYAZ branding in shareable card

### Testing Results (Latest - Iteration 6)
- Frontend UI: 100%
- Navigation: 100%
- Public Pages: 100%
- Login/Auth UI: 100%
- Dark Mode: 100%
- Backend API: 85% (non-critical root redirect)
- Shareable Match Cards: 100%

## Prioritized Backlog

### P0 - Critical
- [ ] End-to-end auth flow testing with real Supabase signup/login
- [ ] Manager dashboard CRUD operations verification

### P1 - High Priority
- [ ] Match detail page with live scoring UI
- [ ] Team detail page with player roster
- [ ] Player statistics visualization
- [ ] Referee match recording interface

### P2 - Medium Priority
- [ ] Statistics dashboard with charts (Recharts)
- [ ] Search/filter functionality across entities
- [ ] Push notifications for match updates
- [ ] KnockoutBracket dark mode polish

### P3 - Nice to Have
- [ ] Stripe billing integration
- [ ] Export data (PDF reports, CSV)
- [ ] SEO optimization for public pages
- [ ] PWA support for mobile
- [ ] Social media OG image generation
