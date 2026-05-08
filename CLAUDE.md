Follow these instructions carefully and do not deviate from them.

## Project Overview & Structure

Comprehensive guide to the folder structure and organization of the project, including all main directories, key files, and their purposes.

@.cursor/rules/project-structure.mdc

## Tech Stack & Dependencies

Complete listing of the tech stack, frameworks, libraries, and dependencies used throughout the project, with version information and usage patterns.

@.cursor/rules/tech-stack-dependencies.mdc

## TypeScript Code Style Guide

TypeScript conventions including parameter passing patterns, type safety rules, import organization, functional programming practices, and documentation standards.

@.cursor/rules/typescript-style.mdc

## Next.js

Expert guidance on React, Next.js App Router, and related technologies including code structure, naming conventions, React best practices, UI styling, forms, metadata, error handling, accessibility, and security.

@.cursor/rules/nextjs.mdc

## UI Components from Shadcn UI

Guidelines for using Shadcn UI components from the shared UI library, including usage, import conventions, and best practices for composing user interfaces.

@.cursor/rules/ui-components.mdc

## Tailwind CSS Styling Practices

Tailwind CSS conventions covering class organization, responsive design, color system usage, layout patterns, design system integration, and styling best practices.

@.cursor/rules/tailwind-styling.mdc

## Landing Page Components Rule

Instructions for building public-facing pages using landing page components, including component sources, documentation references, structure examples, and implementation best practices.

@.cursor/rules/landing-components.mdc

## Self-Improvement

Guidelines for continuously improving rules based on emerging code patterns, including analysis processes, rule updates, quality checks, and documentation maintenance.

@.cursor/rules/self-improve.mdc

## Git & Version Control

- Add and commit automatically whenever an entire task is finished
- Use descriptive commit messages that capture the full scope of changes

## Critical Architecture Rules

### Public vs Authenticated API routes

Public fan pages (`/league/public/*`) MUST call `/api/league/public/*` endpoints — NOT `/api/league/*`.
The authenticated routes require an org session and return 401 for unauthenticated visitors.
The pattern: `app/api/league/public/[resource]/route.ts` uses `createAdminClient()` (no auth).

### i18n — already exists, do not rebuild

Full PT/EN/ES/FR system is at `lib/i18n/translations.ts` + `lib/i18n/useLanguage.tsx`.
Translation files: `messages/en.json` + `messages/pt.json`.
Language toggle is already in the Sidebar and UserMenu. Check these files before touching any language feature.

### Repository pattern

`lib/repositories/` — Supabase and Mock implementations for every entity.
Toggle: `localStorage.getItem('plyaz_simulation_enabled') === 'true'` (client) or `NEXT_PUBLIC_USE_MOCK_REPOS=true` (server).
Mock store uses localStorage — starts empty on fresh sessions.

### Coach roster scoping

Coach roster filters players by `team.manager_id === profile.id` to find the managed team.
Teams table has: `manager_id`, `is_recruiting_players`, `invite_code` fields.

### Seeding data

No local `.env.local` — credentials are in Vercel only.
To seed: `curl -X POST "https://vibe-coding-starter-black.vercel.app/api/seed?token=seed-plyaz-demo-2026"`
Demo accounts (password Demo1234!): manager@plyaz.demo, referee@plyaz.demo, player1@plyaz.demo, player2@plyaz.demo

## Retrieving library documentation by using Context 7

When the user requests code examples, setup or configuration steps, or library/API documentation, use the context7 mcp server to get the information.

## Verifying features in the browser

Use the Playwright MCP server to verify features in the browser.
Check for console errors and ensure the implemented functionality is working as expected.

## **EXTREMELY IMPORTANT:** Code Quality Checks

**ALWAYS follow these instructions before completing a task.**

Automatically use the IDE's built-in diagnostics tool to check for linting and type errors:

- Run `mcp__ide__getDiagnostics` to check all files for diagnostics
- Fix any linting or type errors before considering the task complete
- Do this for _each_ file you create or edit

This is a CRITICAL step that must NEVER be skipped when working on any code-related task.
