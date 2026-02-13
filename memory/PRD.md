# PLYAZ - League Management App PRD

## Original Problem Statement
Fix Supabase connection and authentication issues for PLYAZ league management app.

## Issues Identified & Fixed

### 1. Missing Environment Variables (FIXED)
- Created `/app/.env.local` with Supabase credentials
- URL: https://fjtizlmvchymtshjykev.supabase.co
- Anon key configured

### 2. Next.js Routing Conflict (FIXED)
- Removed duplicate `[id]` folder under `/app/api/league/teams`
- Consolidated routes under `[teamId]`

### 3. Auth Trigger Issue (FIXED - SQL provided)
- Profile creation trigger needed SECURITY DEFINER
- RLS policies needed adjustment

### 4. Logo Bug (FIXED)
- Changed from NavIcons.Trophy to Image component
- Now uses `/static/branding/logo-circle.png`

### 5. Regex Bug in Onboarding (FIXED)
- Fixed `0-0` → `0-9` in slug generation regex

### 6. Onboarding Flow Issues (FIXED - SQL provided)
- Added error handling and delay before redirect
- Updated middleware for graceful profile check

## What's Been Implemented
- ✅ Environment configuration
- ✅ Route conflict resolution  
- ✅ Logo fix
- ✅ Regex fix
- ✅ Middleware improvements

## Pending: User Must Run SQL
User needs to run `/app/supabase/complete_fix.sql` in Supabase SQL Editor

## Supabase Tables
- organizations, profiles, competitions, teams, players, matches, match_events, standings, invites

## Tech Stack
- Next.js 15.5.9
- React 19
- Supabase (Auth + Database)
- Tailwind CSS
- Framer Motion

## Next Tasks
1. Run complete_fix.sql in Supabase
2. Test full signup → onboarding → dashboard flow
3. Verify league creation works

## Backlog
- P1: Test all CRUD operations
- P2: Add social auth
- P3: Real-time updates
