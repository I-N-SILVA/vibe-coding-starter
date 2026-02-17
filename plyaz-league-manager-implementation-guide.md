# PLYAZ League Manager - Implementation Guide

## Overview

Build a **soccer-focused league and tournament management platform** with role-based interfaces for admins, team managers, referees, players, and fans.

## Design Philosophy

- **Visual Identity:** PLYAZ brand (purple-to-orange gradient, bold typography, energetic)
- **User Experience:** Mobile-first, touch-optimized, real-time updates
- **Architecture:** Modern web stack (React/Next.js + Tailwind CSS recommended)
- **Performance:** Fast, responsive, optimistic UI updates

---

## MVP Feature Breakdown

### 1. Admin Dashboard
**Priority:** HIGH

**Features:**
- Competition CRUD (create leagues/tournaments)
- Fixture scheduler (drag-and-drop calendar)
- Team/player management
- League standings overview
- Recent results feed
- User role management

**Components:**
- Competition grid (cards with quick actions)
- Fixture calendar (weekly/monthly view)
- Team roster table (sortable, searchable)
- Stats dashboard (total matches, teams, players)

---

### 2. Team Manager Interface
**Priority:** HIGH

**Features:**
- Team profile editor
- Squad roster management (add/remove players)
- View upcoming fixtures
- Send team messages/notifications
- View team statistics

**Components:**
- Team card (logo, name, stats)
- Player grid (photos, numbers, positions)
- Fixture list (next 5 matches)
- Message composer (simple form)

---

### 3. Referee Interface
**Priority:** HIGH (Critical for live match management)

**Features:**
- View assigned matches
- Live match controller:
  - Update score (home/away goals)
  - Log events (goal, yellow card, red card, substitution)
  - Track time (half-time, full-time, stoppage)
  - Manage lineups
- Submit match report (final score, notable incidents)

**Components:**
- Match control panel (large touch buttons)
- Score display (real-time update)
- Event logger (quick action buttons)
- Timer display (countdown + stoppage time)
- Match report form (text + dropdowns)

**Design Notes:**
- **Large touch targets (60px height)** for on-field use
- **High contrast** for outdoor visibility
- **Offline-first** capability (sync when online)

---

### 4. Public/Fan View
**Priority:** MEDIUM

**Features:**
- Live scoreboard (all matches today)
- League standings table
- Fixtures & results (filterable by date/team)
- Team profiles (roster, stats)
- Player leaderboards (top scorers, assists, clean sheets)

**Components:**
- Live match grid (auto-refresh every 10s)
- League table (sortable)
- Fixture calendar (month view)
- Player stats table (top 10)

---

### 5. Player View
**Priority:** LOW (Nice-to-have for MVP)

**Features:**
- Personal profile
- Career/season statistics
- Upcoming fixtures
- Team messages
- Availability toggle (for selection)

**Components:**
- Player profile card
- Stats overview (goals, assists, cards)
- Fixture list
- Availability switch

---

## Technical Implementation

### Tech Stack (Recommended)

**Frontend:**
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + design tokens
- **UI Components:** shadcn/ui (customizable)
- **State:** React Context or Zustand
- **Forms:** React Hook Form + Zod validation

**Backend:**
- **Database:** PostgreSQL (Supabase or Railway)
- **API:** Next.js API routes or tRPC
- **Auth:** NextAuth.js or Clerk
- **Real-time:** WebSockets (Socket.io) or Supabase Realtime

**Deployment:**
- **Hosting:** Vercel (frontend) + Supabase (backend)
- **CDN:** Cloudflare (images, assets)

---

## File Structure

```
/app
  /(admin)
    /dashboard          # Admin dashboard
    /competitions       # Competition management
    /fixtures           # Fixture scheduling
    /teams              # Team management
  
  /(manager)
    /team               # Team manager dashboard
    /squad              # Squad roster
    /fixtures           # Team fixtures
  
  /(referee)
    /matches            # Assigned matches
    /live               # Live match controller
    /reports            # Match reports
  
  /(public)
    /live               # Live scoreboard
    /standings          # League tables
    /fixtures           # Fixtures & results
    /teams              # Team profiles
    /players            # Player leaderboards
  
  /(player)
    /profile            # Player profile
    /stats              # Player statistics

/components
  /ui                   # Reusable UI (buttons, cards, modals)
  /admin                # Admin-specific components
  /referee              # Referee match controls
  /public               # Public-facing components

/lib
  /db                   # Database helpers
  /auth                 # Auth utilities
  /constants            # Design tokens as JS/TS

/styles
  /globals.css          # Tailwind + custom styles
```

---

## Design Token Usage

### Import Tokens
```typescript
// lib/design-tokens.ts
export const colors = {
  brand: {
    purple: '#7C3AED',
    orange: '#F97316',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #F97316 100%)',
  },
  status: {
    live: '#EF4444',
    upcoming: '#3B82F6',
    completed: '#64748B',
  },
  // ... rest of tokens
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  // ...
};
```

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7C3AED',
          orange: '#F97316',
        },
        // ... map all design tokens
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        accent: ['Montserrat', 'sans-serif'],
      },
    },
  },
};
```

---

## Key Components

### 1. Match Card (Public/Referee)
```tsx
<div className="bg-surface-dark rounded-2xl p-5 shadow-md">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <img src={homeTeam.logo} className="w-12 h-12" />
      <span className="text-xl font-semibold">{homeTeam.name}</span>
    </div>
    
    <div className="text-4xl font-bold text-brand-purple">
      {homeScore} - {awayScore}
    </div>
    
    <div className="flex items-center gap-3">
      <span className="text-xl font-semibold">{awayTeam.name}</span>
      <img src={awayTeam.logo} className="w-12 h-12" />
    </div>
  </div>
  
  <div className="mt-4">
    <StatusBadge status="live" />
  </div>
</div>
```

### 2. Live Status Badge
```tsx
<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-error-500 text-white">
  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
  <span className="text-xs font-semibold uppercase">LIVE</span>
</div>
```

### 3. League Table
```tsx
<table className="w-full">
  <thead className="bg-surface-secondary">
    <tr>
      <th className="text-left p-4">Pos</th>
      <th className="text-left p-4">Team</th>
      <th className="p-4">P</th>
      <th className="p-4">W</th>
      <th className="p-4">D</th>
      <th className="p-4">L</th>
      <th className="p-4">Pts</th>
    </tr>
  </thead>
  <tbody>
    {teams.map((team, index) => (
      <tr key={team.id} className="border-b border-border-primary hover:bg-brand-purple/5">
        <td className="p-4">{index + 1}</td>
        <td className="p-4 flex items-center gap-2">
          <img src={team.logo} className="w-6 h-6" />
          {team.name}
        </td>
        <td className="p-4 text-center">{team.played}</td>
        <td className="p-4 text-center">{team.won}</td>
        <td className="p-4 text-center">{team.drawn}</td>
        <td className="p-4 text-center">{team.lost}</td>
        <td className="p-4 text-center font-bold">{team.points}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### 4. Referee Match Control
```tsx
<div className="grid grid-cols-2 gap-4">
  <button className="h-16 bg-success-500 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2">
    <GoalIcon className="w-8 h-8" />
    Home Goal
  </button>
  
  <button className="h-16 bg-success-500 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2">
    <GoalIcon className="w-8 h-8" />
    Away Goal
  </button>
  
  <button className="h-16 bg-warning-500 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2">
    <CardIcon className="w-8 h-8" />
    Yellow Card
  </button>
  
  <button className="h-16 bg-error-500 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2">
    <CardIcon className="w-8 h-8" />
    Red Card
  </button>
</div>
```

---

## Data Refresh Strategy

### Live Matches
- **Method:** WebSocket connection (Socket.io or Supabase Realtime)
- **Fallback:** 10-second polling
- **Events:** Score updates, match events, time updates

### Standings
- **Method:** Update on match completion
- **Cache:** Client-side cache for 5 minutes
- **Refresh:** Manual refresh button

### Fixtures
- **Method:** Cache with SWR (stale-while-revalidate)
- **Revalidate:** On focus, 1-hour interval

---

## Accessibility Checklist

- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader labels (aria-label, aria-describedby)
- [ ] Color contrast ≥ 4.5:1
- [ ] Focus indicators on all interactive elements
- [ ] Touch targets ≥ 44x44px
- [ ] Semantic HTML (nav, main, section, article)
- [ ] Skip to content link

---

## Performance Optimization

- [ ] Image optimization (WebP, lazy loading)
- [ ] Code splitting (route-based)
- [ ] Memoization (React.memo, useMemo)
- [ ] Virtualization (react-window for long lists)
- [ ] Debouncing (search inputs)
- [ ] Optimistic UI updates (instant feedback)

---

## MVP Development Phases

### Phase 1: Foundation (Week 1-2)
- Set up project (Next.js + Tailwind)
- Implement design tokens
- Build core UI components (Button, Card, Modal, Form)
- Set up auth (roles: admin, manager, referee, player, fan)

### Phase 2: Admin Dashboard (Week 3-4)
- Competition CRUD
- Team management
- Fixture scheduler
- Standings view

### Phase 3: Referee Interface (Week 5)
- Live match controller
- Event logging
- Match reports

### Phase 4: Public View (Week 6)
- Live scoreboard
- League tables
- Fixtures & results

### Phase 5: Team Manager (Week 7)
- Team profile
- Squad roster
- Fixtures view

### Phase 6: Polish & Testing (Week 8)
- Mobile optimization
- Real-time updates
- Bug fixes
- Performance optimization

---

## Next Steps

1. **Clone/Initialize Project:** Set up Next.js with Tailwind CSS
2. **Import Design Tokens:** Convert JSONC to Tailwind config
3. **Build Component Library:** Start with Button, Card, Badge, Modal
4. **Set Up Auth:** Implement role-based access control
5. **Database Schema:** Define tables (competitions, teams, players, matches, events)
6. **API Routes:** Create CRUD endpoints
7. **Build Admin Dashboard:** Start with competition management
8. **Implement Referee Controls:** Prioritize live match functionality

---

**Questions or Need Help?**
- Review design tokens in `plyaz-league-manager-tokens.jsonc`
- Check design spec in `plyaz-league-manager-design-spec.md`
- Refer to component examples above

**Version:** 1.0.0 (MVP)
**Last Updated:** February 9, 2026
