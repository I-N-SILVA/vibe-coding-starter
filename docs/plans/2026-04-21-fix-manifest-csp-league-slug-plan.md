---
title: Fix manifest.json 401 cascade, CSP toolbar violations, and auto-generate league slugs
type: fix
date: 2026-04-21
---

# Fix: manifest.json 401, CSP Violations, League Slug Auto-generation

## Overview

Three production bugs identified on `vibe-coding-starter-git-main-silvalabs.vercel.app`:

1. **manifest.json floods 29× 401 errors** — Service worker intercepts PWA manifest requests that fail Vercel's deployment protection cookie-check, causing a cascade of failed fetches.
2. **Vercel toolbar CSP violations** — Preview toolbar fonts (`vercel.live/geist.woff2`) and images (`vercel.com/api/www/avatar`) are blocked by the Content Security Policy.
3. **League creation has no slug** — Competitions have no `slug` column. Every league needs a unique, URL-safe identifier auto-generated from the name.

## Problem Statement

### manifest.json 401
The SW (`public/sw.js`) uses network-first strategy for all same-origin GET requests. When the browser installs/checks the PWA manifest, the SW intercepts it and calls `fetch(event.request)`. On Vercel preview deployments with deployment protection, the SW-proxied request lacks the required auth cookies, getting 401. This loops 29+ times per session.

Root cause: `public/sw.js` doesn't skip manifest files.

### CSP Violations
`next.config.js` defines CSP headers. The Vercel preview toolbar injects scripts and assets from `vercel.live` (already in `script-src`) **and also** from `*.vercel.com` (missing). Specifically missing:
- `font-src` — missing `https://vercel.live`
- `img-src` — missing `https://*.vercel.com`
- `connect-src` — missing `https://*.vercel.com`
- `frame-src` — missing `https://*.vercel.com`
- `script-src` — missing `https://*.vercel.com`

### League Slug
The `competitions` table has no `slug` column. No migration, type, Zod schema, or API route logic exists for it. Every league needs a slug like `sunday-premier-2026` generated from its name, globally unique, with suffix deduplication (`-2`, `-3`) when conflicts occur.

## Proposed Solution

### 1. SW — Skip manifest files
Add two early-return guards in the SW fetch handler before the network-first block:
```js
if (url.pathname === '/manifest.json' || url.pathname.endsWith('.webmanifest')) return;
```

### 2. CSP — Add `*.vercel.com` and `vercel.live` fonts
Extend the CSP string in `next.config.js`:
- `font-src`: add `https://vercel.live`
- `img-src`: add `https://*.vercel.com`
- `connect-src`: add `https://*.vercel.com`
- `frame-src`: add `https://*.vercel.com`
- `script-src`: add `https://*.vercel.com`

### 3. League Slug — Full stack
- **Migration** `supabase/migrations/20260421_add_competition_slug.sql`: `ALTER TABLE` add `slug TEXT`, partial unique index (`WHERE slug IS NOT NULL`), backfill existing rows.
- **Type** `lib/supabase/types.ts`: add `slug: string | null` to `Competition`.
- **Validation** `lib/api/validation.ts`: add `slug` to `createCompetitionApiSchema` (optional — server always overwrites).
- **API route** `app/api/league/competitions/route.ts`: add `slugify()` + `generateUniqueSlug()` utilities, call before `insert`.

## Acceptance Criteria

- [ ] Zero manifest.json 401 errors in console after SW fix
- [ ] Vercel toolbar loads fonts and images without CSP violations
- [ ] Creating a league via `/league/create` stores a slug in the DB (e.g., `sunday-premier-division`)
- [ ] Creating two leagues with the same name produces `my-league` and `my-league-2`
- [ ] Slugs survive special chars and diacritics (e.g., `Liña` → `lina`)
- [ ] No TypeScript errors across changed files

## Files Changed

| File | Change |
|------|--------|
| `public/sw.js` | Skip manifest fetch interception |
| `next.config.js` | Add `*.vercel.com` + `vercel.live` to CSP directives |
| `supabase/migrations/20260421_add_competition_slug.sql` | New migration — slug column + index + backfill |
| `lib/supabase/types.ts` | Add `slug` to `Competition` type |
| `lib/api/validation.ts` | Add `slug` to `createCompetitionApiSchema` |
| `app/api/league/competitions/route.ts` | Slug generation in POST handler |

## ERD Delta

```
competitions
  + slug  TEXT  (nullable, unique where not null)
```
