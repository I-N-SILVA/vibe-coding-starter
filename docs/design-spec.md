# PLYAZ League Manager - Design Specification

## 1. Project Overview

**Type:** League & Tournament Management Platform (MVP)
**Description:** Soccer-focused competition management system for admins, teams, referees, players, and fans

## 2. Visual Design Language

### Style Direction
Modern, clean interface with **PLYAZ brand identity** - vibrant gradients, bold typography, and youth-focused energy.

**Theme Mode:** Light and Dark modes

### Core Visual Characteristics
- Primary gradient: Purple to Orange (PLYAZ brand)
- Bold, confident typography
- Card-based layouts with elevated shadows
- Generous white space
- Mobile-first, touch-optimized
- Status-driven color coding (live matches, upcoming, completed)

### Target Perception
- Dynamic and energetic (grassroots football)
- Professional yet accessible
- Community-focused
- Real-time and responsive

---

## 3. Layout Architecture

### Global Layout
**Responsive top navigation** with collapsible sidebar for role-based views

**Responsive Framework:** Tailwind CSS breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)

### Screen Priorities (MVP)

#### Admin Dashboard
- Competition grid (create, edit, delete)
- Quick fixture scheduler
- Standings overview
- Recent results feed

#### Team Manager
- Team profile card
- Squad roster grid
- Upcoming fixtures list
- Quick message composer

#### Referee Interface
- Assigned matches today
- Live match controller (score, events, time)
- Simple match report form

#### Public View
- Live scoreboard
- League table
- Fixtures calendar
- Team profiles

#### Player View
- Personal stats dashboard
- Team fixtures
- Availability toggle

---

## 4. Color System

### Primary Palette
- **Brand Purple:** #7C3AED
- **Brand Orange:** #F97316
- **Brand Gradient:** Linear gradient from Purple to Orange
- **Dark Base:** #0F172A
- **Light Base:** #F8FAFC

### Background
- **Dark Mode:** #0F172A (slate-900)
- **Light Mode:** #F8FAFC (slate-50)

### Semantic Colors
- **Success/Win:** #10B981 (green-500)
- **Warning/Draw:** #F59E0B (amber-500)
- **Error/Loss:** #EF4444 (red-500)
- **Info/Live:** #3B82F6 (blue-500)
- **Neutral:** #64748B (slate-500)

### Status Colors
- **Live Match:** #EF4444 with pulse animation
- **Upcoming:** #3B82F6
- **Completed:** #64748B
- **Cancelled:** #94A3B8

---

## 5. Typography

**Primary Font:** Inter (clean, modern, excellent readability)
**Accent Font:** Montserrat (bold headings, CTAs)

**Scale:**
- **Hero:** 48px / 3rem (landing, scores)
- **H1:** 36px / 2.25rem
- **H2:** 30px / 1.875rem
- **H3:** 24px / 1.5rem
- **H4:** 20px / 1.25rem
- **Body:** 16px / 1rem
- **Small:** 14px / 0.875rem
- **Tiny:** 12px / 0.75rem

---

## 6. Spacing & Rhythm

**Base Unit:** 4px

- **xs:** 4px
- **sm:** 8px
- **md:** 16px
- **lg:** 24px
- **xl:** 32px
- **2xl:** 48px
- **3xl:** 64px

---

## 7. Component Library (MVP)

### Navigation
- Top bar with role switcher
- Mobile hamburger menu
- Active route indicator

### Cards
- **Match Card:** Team logos, score, time, status badge
- **Team Card:** Photo, name, stats, quick actions
- **Player Card:** Avatar, position, number, stats
- **Competition Card:** Tournament name, format, dates

### Forms
- Input fields with floating labels
- Dropdown selectors (teams, players, venues)
- Date/time pickers for fixtures
- Toggle switches (availability, notifications)

### Data Display
- **League Table:** Sortable, responsive
- **Fixture List:** Grouped by date, filterable
- **Live Scoreboard:** Auto-refreshing grid
- **Stats Grid:** Key metrics with icons

### Modals
- Create/Edit Competition
- Schedule Fixture
- Add Team/Player
- Match Report
- Confirm Actions (delete, cancel)

### Notifications
- Toast notifications (success, error, info)
- Live match updates
- Badge counters on nav items

---

## 8. Interactive Elements

### Buttons
- **Primary:** Gradient background (purple to orange)
- **Secondary:** Outlined with brand color
- **Ghost:** Transparent with hover state
- **Danger:** Red for destructive actions
- **Icon Buttons:** 44x44px minimum touch target

### Match Controls (Referee)
- Large touch targets (60px height)
- Goal/Card/Sub buttons with icons
- Timer display (countdown, stoppage)
- Half-time/Full-time toggle

### Status Badges
- Pill shape with icon + text
- Color-coded (live, upcoming, completed)
- Pulse animation for live matches

---

## 9. Effects & Motion

### Shadows
- **sm:** 0 1px 2px rgba(0,0,0,0.05)
- **md:** 0 4px 6px rgba(0,0,0,0.1)
- **lg:** 0 10px 15px rgba(0,0,0,0.1)
- **xl:** 0 20px 25px rgba(0,0,0,0.15)

### Transitions
- **Fast:** 150ms (hover, active states)
- **Normal:** 250ms (page transitions)
- **Slow:** 400ms (modals, drawers)
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)

### Animations
- **Pulse:** Live match indicator
- **Slide-in:** Mobile menu, modals
- **Fade:** Toast notifications
- **Scale:** Button press feedback

---

## 10. Responsive Behavior

- **Mobile:** Single column, full-width cards, bottom nav
- **Tablet:** 2-column grids, side drawer
- **Desktop:** Multi-column dashboards, persistent sidebar

**Touch Targets:** Minimum 44x44px (WCAG AA)

---

## 11. Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader labels
- Color contrast ratios ≥ 4.5:1
- Focus indicators on all interactive elements

---

## 12. Data Refresh Strategy

- **Live Scores:** WebSocket connection or 10-second polling
- **Standings:** Update after match completion
- **Fixtures:** Cache with manual refresh option
- **User Actions:** Optimistic UI updates

---

**Generated:** February 9, 2026
**Version:** 1.0.0 (MVP)
**Brand:** PLYAZ
