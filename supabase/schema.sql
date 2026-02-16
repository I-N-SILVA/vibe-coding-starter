-- ============================================
-- PLYAZ Database Schema
-- Multi-tenant League & Tournament Management
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ORGANIZATIONS (Multi-tenant root)
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    logo_url TEXT,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'elite')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'fan' CHECK (role IN ('admin', 'referee', 'manager', 'player', 'fan')),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    phone TEXT,
    bio TEXT,
    position TEXT,
    jersey_number INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- LEAGUES / COMPETITIONS
-- ============================================
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'league' CHECK (type IN ('league', 'knockout', 'group_knockout')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    season TEXT,
    start_date DATE,
    end_date DATE,
    max_teams INTEGER DEFAULT 20,
    rules JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TEAMS
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    short_name TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#1a1a2e',
    secondary_color TEXT DEFAULT '#e94560',
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PLAYERS
-- ============================================
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position TEXT CHECK (position IN ('GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF')),
    jersey_number INTEGER,
    date_of_birth DATE,
    nationality TEXT,
    photo_url TEXT,
    bio TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'injured', 'suspended', 'released')),
    stats JSONB DEFAULT '{"goals": 0, "assists": 0, "yellow_cards": 0, "red_cards": 0, "appearances": 0}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- MATCHES (FIXTURES)
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    matchday INTEGER,
    round TEXT,
    home_score INTEGER NOT NULL DEFAULT 0,
    away_score INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'postponed', 'cancelled')),
    match_time TEXT,
    venue TEXT,
    referee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- MATCH EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS match_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('goal', 'own_goal', 'penalty', 'yellow_card', 'red_card', 'substitution', 'injury', 'var_review')),
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    player_name TEXT,
    minute INTEGER,
    half TEXT CHECK (half IN ('1st', '2nd', 'ET1', 'ET2', 'penalties')),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- STANDINGS (materialized, updated on match complete)
-- ============================================
CREATE TABLE IF NOT EXISTS standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    played INTEGER NOT NULL DEFAULT 0,
    won INTEGER NOT NULL DEFAULT 0,
    drawn INTEGER NOT NULL DEFAULT 0,
    lost INTEGER NOT NULL DEFAULT 0,
    goals_for INTEGER NOT NULL DEFAULT 0,
    goals_against INTEGER NOT NULL DEFAULT 0,
    goal_difference INTEGER GENERATED ALWAYS AS (goals_for - goals_against) STORED,
    points INTEGER NOT NULL DEFAULT 0,
    form TEXT[] DEFAULT ARRAY[]::TEXT[],
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(competition_id, team_id)
);

-- ============================================
-- INVITES
-- ============================================
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('team_join', 'player_join', 'referee_invite', 'admin_invite')),
    email TEXT,
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        new.raw_user_meta_data->>'avatar_url',
        COALESCE(new.raw_user_meta_data->>'role', 'fan')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update standings after match completion
CREATE OR REPLACE FUNCTION update_standings()
RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Upsert home team standings
        INSERT INTO standings (competition_id, team_id, played, won, drawn, lost, goals_for, goals_against, points)
        VALUES (
            NEW.competition_id, NEW.home_team_id, 1,
            CASE WHEN NEW.home_score > NEW.away_score THEN 1 ELSE 0 END,
            CASE WHEN NEW.home_score = NEW.away_score THEN 1 ELSE 0 END,
            CASE WHEN NEW.home_score < NEW.away_score THEN 1 ELSE 0 END,
            NEW.home_score, NEW.away_score,
            CASE WHEN NEW.home_score > NEW.away_score THEN 3
                 WHEN NEW.home_score = NEW.away_score THEN 1 ELSE 0 END
        )
        ON CONFLICT (competition_id, team_id) DO UPDATE SET
            played = standings.played + 1,
            won = standings.won + CASE WHEN NEW.home_score > NEW.away_score THEN 1 ELSE 0 END,
            drawn = standings.drawn + CASE WHEN NEW.home_score = NEW.away_score THEN 1 ELSE 0 END,
            lost = standings.lost + CASE WHEN NEW.home_score < NEW.away_score THEN 1 ELSE 0 END,
            goals_for = standings.goals_for + NEW.home_score,
            goals_against = standings.goals_against + NEW.away_score,
            points = standings.points + CASE WHEN NEW.home_score > NEW.away_score THEN 3
                                             WHEN NEW.home_score = NEW.away_score THEN 1 ELSE 0 END,
            updated_at = NOW();

        -- Upsert away team standings
        INSERT INTO standings (competition_id, team_id, played, won, drawn, lost, goals_for, goals_against, points)
        VALUES (
            NEW.competition_id, NEW.away_team_id, 1,
            CASE WHEN NEW.away_score > NEW.home_score THEN 1 ELSE 0 END,
            CASE WHEN NEW.away_score = NEW.home_score THEN 1 ELSE 0 END,
            CASE WHEN NEW.away_score < NEW.home_score THEN 1 ELSE 0 END,
            NEW.away_score, NEW.home_score,
            CASE WHEN NEW.away_score > NEW.home_score THEN 3
                 WHEN NEW.away_score = NEW.home_score THEN 1 ELSE 0 END
        )
        ON CONFLICT (competition_id, team_id) DO UPDATE SET
            played = standings.played + 1,
            won = standings.won + CASE WHEN NEW.away_score > NEW.home_score THEN 1 ELSE 0 END,
            drawn = standings.drawn + CASE WHEN NEW.away_score = NEW.home_score THEN 1 ELSE 0 END,
            lost = standings.lost + CASE WHEN NEW.away_score < NEW.home_score THEN 1 ELSE 0 END,
            goals_for = standings.goals_for + NEW.away_score,
            goals_against = standings.goals_against + NEW.home_score,
            points = standings.points + CASE WHEN NEW.away_score > NEW.home_score THEN 3
                                             WHEN NEW.away_score = NEW.home_score THEN 1 ELSE 0 END,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_match_complete ON matches;
CREATE TRIGGER on_match_complete
    AFTER INSERT OR UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_standings();

-- (Duplicate handle_new_user removed — canonical version is above at line 270)

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_competitions_org ON competitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_comp ON teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_teams_org ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_org ON players(organization_id);
CREATE INDEX IF NOT EXISTS idx_matches_comp ON matches(competition_id);
CREATE INDEX IF NOT EXISTS idx_matches_org ON matches(organization_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_home ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away ON matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled ON matches(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_player ON match_events(player_id);
CREATE INDEX IF NOT EXISTS idx_standings_comp ON standings(competition_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_org ON invites(organization_id);
