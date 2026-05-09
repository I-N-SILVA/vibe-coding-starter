# PLYAZ Setup Guide

Complete instructions for getting the project running from scratch.

---

## Prerequisites

- Node.js 18+
- A Supabase project
- A Stripe account
- A Resend account (for email)
- An Upstash Redis database (for rate limiting)

Copy `.env.example` to `.env.local` and fill in all values before proceeding.

---

## Supabase Storage Buckets (REQUIRED)

Two storage buckets must be created manually in the Supabase dashboard. Without these, profile picture and team logo uploads will silently fail.

1. Go to [supabase.com](https://supabase.com) → your project → **Storage** → **New bucket**
2. Create bucket named `avatars` → toggle **Public** ON → Save
3. Create bucket named `logos` → toggle **Public** ON → Save

---

## Supabase Auth Settings (REQUIRED)

The app URL must be configured in Supabase so email redirect links work correctly.

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel domain (e.g. `https://your-app.vercel.app`)
3. Add your domain to the **Redirect URLs** list
4. This value must match `NEXT_PUBLIC_APP_URL` exactly

---

## Database Migrations

SQL migration files live in `supabase/migrations/`. Run each file in order using either method:

**Option A — Supabase Dashboard:**

- Go to **SQL Editor** → paste the migration file contents → Run

**Option B — Supabase CLI:**

```bash
supabase db push
```

### Current migrations

| File                         | Purpose                                     |
| ---------------------------- | ------------------------------------------- |
| `20260509_match_lineups.sql` | Squad selection feature (match day lineups) |

---

## Stripe Webhook Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks** → **Add endpoint**
2. Set the endpoint URL to: `https://your-app.vercel.app/api/stripe/registration-webhook`
3. Select event to listen for: `checkout.session.completed`
4. Copy the signing secret → set it as `STRIPE_WEBHOOK_SECRET` in your env vars

---

## Demo Data

Seed the platform with demo teams, players, and matches:

```bash
curl -X POST "https://your-app.vercel.app/api/seed?token=seed-plyaz-demo-2026"
```

Demo accounts (password: `Demo1234!`):

| Email                | Role             |
| -------------------- | ---------------- |
| `manager@plyaz.demo` | League organizer |
| `referee@plyaz.demo` | Match referee    |
| `player1@plyaz.demo` | Field player     |
| `player2@plyaz.demo` | Field player     |

---

## Local Development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

> Note: No `.env.local` file is committed to the repo. All credentials live in Vercel environment variables for the deployed app. For local development, create your own `.env.local` from `.env.example`.
