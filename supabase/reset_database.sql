-- ============================================
-- PLYAZ DATABASE RESET
-- Run this in Supabase SQL Editor to fully reset
-- https://supabase.com/dashboard/project/fjtizlmvchymtshjykev/sql/new
-- ============================================

-- ============================================
-- STEP 1: DROP ALL DATA (order matters for FK constraints)
-- ============================================
-- Truncate new championship tables first
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'player_competition_stats' AND table_schema = 'public') THEN
        TRUNCATE player_competition_stats CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competition_registration_fields' AND table_schema = 'public') THEN
        TRUNCATE competition_registration_fields CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competition_registrations' AND table_schema = 'public') THEN
        TRUNCATE competition_registrations CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_teams' AND table_schema = 'public') THEN
        TRUNCATE group_teams CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'groups' AND table_schema = 'public') THEN
        TRUNCATE groups CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'championship_config' AND table_schema = 'public') THEN
        TRUNCATE championship_config CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories' AND table_schema = 'public') THEN
        TRUNCATE categories CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venues' AND table_schema = 'public') THEN
        TRUNCATE venues CASCADE;
    END IF;
END $$;

TRUNCATE match_events CASCADE;
TRUNCATE standings CASCADE;
TRUNCATE matches CASCADE;
TRUNCATE players CASCADE;
TRUNCATE teams CASCADE;
TRUNCATE invites CASCADE;
TRUNCATE competitions CASCADE;
TRUNCATE profiles CASCADE;
TRUNCATE organizations CASCADE;

-- Drop audit_logs if it exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs' AND table_schema = 'public') THEN
        TRUNCATE audit_logs CASCADE;
    END IF;
END $$;

-- Delete all auth users (this triggers cascade deletes)
DELETE FROM auth.users;

-- ============================================
-- STEP 2: ENSURE ALL COLUMNS EXIST (migrations)
-- ============================================

-- Add approval_status if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'approval_status') THEN
        ALTER TABLE profiles ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('approved', 'pending', 'rejected'));
    END IF;
END $$;

-- Add invited_role to invites if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invites' AND column_name = 'invited_role') THEN
        ALTER TABLE invites ADD COLUMN invited_role TEXT CHECK (invited_role IN ('admin', 'referee', 'manager', 'player', 'fan'));
    END IF;
END $$;

-- Add accepted_at to invites if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invites' AND column_name = 'accepted_at') THEN
        ALTER TABLE invites ADD COLUMN accepted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Create audit_logs table if not exists
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- STEP 2B: CREATE NEW TABLES FOR CHAMPIONSHIP SYSTEM
-- ============================================

-- Venues - match locations
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    capacity INTEGER,
    surface_type TEXT CHECK (surface_type IN ('grass', 'artificial', 'indoor', 'hybrid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories - age/skill categories (e.g., U-8 Elite, U-8 Academy)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    min_age INTEGER,
    max_age INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add year and category to competitions
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'year') THEN
        ALTER TABLE competitions ADD COLUMN year INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'category_id') THEN
        ALTER TABLE competitions ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Championship config - per-competition rules (1:1 with competitions)
CREATE TABLE IF NOT EXISTS championship_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID UNIQUE NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    format TEXT NOT NULL CHECK (format IN ('round_robin', 'knockout', 'group_knockout')),
    groups_count INTEGER DEFAULT 1,
    teams_per_group INTEGER DEFAULT 4,
    advance_count INTEGER DEFAULT 2,
    has_gold_final BOOLEAN DEFAULT true,
    has_silver_final BOOLEAN DEFAULT false,
    has_third_place BOOLEAN DEFAULT false,
    points_win INTEGER DEFAULT 3,
    points_draw INTEGER DEFAULT 1,
    points_loss INTEGER DEFAULT 0,
    match_duration_minutes INTEGER DEFAULT 90,
    half_time_minutes INTEGER DEFAULT 15,
    has_extra_time BOOLEAN DEFAULT false,
    extra_time_minutes INTEGER DEFAULT 30,
    has_penalties BOOLEAN DEFAULT true,
    max_substitutions INTEGER DEFAULT 5,
    custom_rules JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Groups - for group_knockout format
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Group teams junction
CREATE TABLE IF NOT EXISTS group_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    seed INTEGER,
    UNIQUE(group_id, team_id)
);

-- Add venue_id and group_id to matches
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'venue_id') THEN
        ALTER TABLE matches ADD COLUMN venue_id UUID REFERENCES venues(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'group_id') THEN
        ALTER TABLE matches ADD COLUMN group_id UUID REFERENCES groups(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add group_id to standings for per-group standings
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'standings' AND column_name = 'group_id') THEN
        ALTER TABLE standings ADD COLUMN group_id UUID REFERENCES groups(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Competition registrations - per-competition athlete sign-up
CREATE TABLE IF NOT EXISTS competition_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    id_document_type TEXT NOT NULL CHECK (id_document_type IN ('passport', 'national_id', 'birth_certificate', 'other')),
    id_document_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    jersey_number INTEGER,
    position TEXT,
    photo_url TEXT,
    custom_fields JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(competition_id, player_id)
);

-- Competition registration field configs - configurable optional fields
CREATE TABLE IF NOT EXISTS competition_registration_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'file')),
    is_required BOOLEAN DEFAULT false,
    options JSONB DEFAULT '[]',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Player competition stats - per-competition player statistics
CREATE TABLE IF NOT EXISTS player_competition_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    goals_conceded INTEGER DEFAULT 0,
    penalties_saved INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(competition_id, player_id)
);

-- Add date_of_birth to players if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'date_of_birth') THEN
        ALTER TABLE players ADD COLUMN date_of_birth DATE;
    END IF;
END $$;

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_venues_org ON venues(organization_id);
CREATE INDEX IF NOT EXISTS idx_categories_org ON categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_championship_config_comp ON championship_config(competition_id);
CREATE INDEX IF NOT EXISTS idx_groups_comp ON groups(competition_id);
CREATE INDEX IF NOT EXISTS idx_group_teams_group ON group_teams(group_id);
CREATE INDEX IF NOT EXISTS idx_matches_venue ON matches(venue_id);
CREATE INDEX IF NOT EXISTS idx_matches_group ON matches(group_id);
CREATE INDEX IF NOT EXISTS idx_comp_registrations_comp ON competition_registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_comp_registrations_player ON competition_registrations(player_id);
CREATE INDEX IF NOT EXISTS idx_comp_reg_fields_comp ON competition_registration_fields(competition_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_comp ON player_competition_stats(competition_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_competition_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_competitions_year ON competitions(year);
CREATE INDEX IF NOT EXISTS idx_competitions_category ON competitions(category_id);
CREATE INDEX IF NOT EXISTS idx_standings_group ON standings(group_id);

-- ============================================
-- STEP 3: FIX PROFILE TRIGGER (handles signup properly)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role, organization_id, approval_status, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'role')::TEXT, 'organizer'),
        (NEW.raw_user_meta_data->>'organization_id')::UUID,
        COALESCE((NEW.raw_user_meta_data->>'approval_status')::TEXT, 'pending'),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        role = COALESCE(EXCLUDED.role, profiles.role),
        organization_id = COALESCE(EXCLUDED.organization_id, profiles.organization_id),
        approval_status = COALESCE(EXCLUDED.approval_status, profiles.approval_status),
        updated_at = NOW();
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 4: ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_registration_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_competition_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: DROP ALL OLD POLICIES AND RECREATE
-- ============================================

-- PROFILES
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ORGANIZATIONS
DROP POLICY IF EXISTS "orgs_select" ON organizations;
DROP POLICY IF EXISTS "orgs_insert" ON organizations;
DROP POLICY IF EXISTS "orgs_update" ON organizations;
DROP POLICY IF EXISTS "orgs_delete" ON organizations;
CREATE POLICY "orgs_select" ON organizations FOR SELECT USING (true);
CREATE POLICY "orgs_insert" ON organizations FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "orgs_update" ON organizations FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "orgs_delete" ON organizations FOR DELETE USING (auth.uid() = owner_id);

-- COMPETITIONS
DROP POLICY IF EXISTS "comps_select" ON competitions;
DROP POLICY IF EXISTS "comps_insert" ON competitions;
DROP POLICY IF EXISTS "comps_update" ON competitions;
DROP POLICY IF EXISTS "comps_delete" ON competitions;
CREATE POLICY "comps_select" ON competitions FOR SELECT USING (true);
CREATE POLICY "comps_insert" ON competitions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = competitions.organization_id AND role = 'admin')
);
CREATE POLICY "comps_update" ON competitions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "comps_delete" ON competitions FOR DELETE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);

-- TEAMS
DROP POLICY IF EXISTS "teams_select" ON teams;
DROP POLICY IF EXISTS "teams_insert" ON teams;
DROP POLICY IF EXISTS "teams_update" ON teams;
DROP POLICY IF EXISTS "teams_delete" ON teams;
CREATE POLICY "teams_select" ON teams FOR SELECT USING (true);
CREATE POLICY "teams_insert" ON teams FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = teams.organization_id AND role = 'admin')
);
CREATE POLICY "teams_update" ON teams FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
    OR manager_id = auth.uid()
);
CREATE POLICY "teams_delete" ON teams FOR DELETE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);

-- PLAYERS
DROP POLICY IF EXISTS "players_select" ON players;
DROP POLICY IF EXISTS "players_insert" ON players;
DROP POLICY IF EXISTS "players_update" ON players;
DROP POLICY IF EXISTS "players_delete" ON players;
CREATE POLICY "players_select" ON players FOR SELECT USING (true);
CREATE POLICY "players_insert" ON players FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM teams WHERE id = team_id AND manager_id = auth.uid())
);
CREATE POLICY "players_update" ON players FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM teams WHERE id = team_id AND manager_id = auth.uid())
    OR profile_id = auth.uid()
);
CREATE POLICY "players_delete" ON players FOR DELETE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);

-- MATCHES
DROP POLICY IF EXISTS "matches_select" ON matches;
DROP POLICY IF EXISTS "matches_insert" ON matches;
DROP POLICY IF EXISTS "matches_update" ON matches;
DROP POLICY IF EXISTS "matches_delete" ON matches;
CREATE POLICY "matches_select" ON matches FOR SELECT USING (true);
CREATE POLICY "matches_insert" ON matches FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "matches_update" ON matches FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
    OR referee_id = auth.uid()
);
CREATE POLICY "matches_delete" ON matches FOR DELETE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);

-- MATCH EVENTS
DROP POLICY IF EXISTS "events_select" ON match_events;
DROP POLICY IF EXISTS "events_insert" ON match_events;
DROP POLICY IF EXISTS "events_update" ON match_events;
DROP POLICY IF EXISTS "events_delete" ON match_events;
CREATE POLICY "events_select" ON match_events FOR SELECT USING (true);
CREATE POLICY "events_insert" ON match_events FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM matches m
        JOIN organizations o ON o.id = m.organization_id
        WHERE m.id = match_id AND (o.owner_id = auth.uid() OR m.referee_id = auth.uid())
    )
);
CREATE POLICY "events_update" ON match_events FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM matches m
        JOIN organizations o ON o.id = m.organization_id
        WHERE m.id = match_id AND (o.owner_id = auth.uid() OR m.referee_id = auth.uid())
    )
);
CREATE POLICY "events_delete" ON match_events FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM matches m
        JOIN organizations o ON o.id = m.organization_id
        WHERE m.id = match_id AND o.owner_id = auth.uid()
    )
);

-- STANDINGS
DROP POLICY IF EXISTS "standings_select" ON standings;
DROP POLICY IF EXISTS "standings_insert" ON standings;
DROP POLICY IF EXISTS "standings_update" ON standings;
CREATE POLICY "standings_select" ON standings FOR SELECT USING (true);
CREATE POLICY "standings_insert" ON standings FOR INSERT WITH CHECK (true);
CREATE POLICY "standings_update" ON standings FOR UPDATE USING (true);

-- INVITES
DROP POLICY IF EXISTS "invites_select" ON invites;
DROP POLICY IF EXISTS "invites_insert" ON invites;
DROP POLICY IF EXISTS "invites_update" ON invites;
DROP POLICY IF EXISTS "invites_delete" ON invites;
CREATE POLICY "invites_select" ON invites FOR SELECT USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
CREATE POLICY "invites_insert" ON invites FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "invites_update" ON invites FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
CREATE POLICY "invites_delete" ON invites FOR DELETE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);

-- AUDIT LOGS
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (true);

-- VENUES
DROP POLICY IF EXISTS "venues_select" ON venues;
DROP POLICY IF EXISTS "venues_insert" ON venues;
DROP POLICY IF EXISTS "venues_update" ON venues;
DROP POLICY IF EXISTS "venues_delete" ON venues;
CREATE POLICY "venues_select" ON venues FOR SELECT USING (true);
CREATE POLICY "venues_insert" ON venues FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "venues_update" ON venues FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "venues_delete" ON venues FOR DELETE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);

-- CATEGORIES
DROP POLICY IF EXISTS "categories_select" ON categories;
DROP POLICY IF EXISTS "categories_insert" ON categories;
DROP POLICY IF EXISTS "categories_update" ON categories;
DROP POLICY IF EXISTS "categories_delete" ON categories;
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);

-- CHAMPIONSHIP CONFIG
DROP POLICY IF EXISTS "config_select" ON championship_config;
DROP POLICY IF EXISTS "config_insert" ON championship_config;
DROP POLICY IF EXISTS "config_update" ON championship_config;
CREATE POLICY "config_select" ON championship_config FOR SELECT USING (true);
CREATE POLICY "config_insert" ON championship_config FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM competitions c JOIN organizations o ON o.id = c.organization_id WHERE c.id = competition_id AND o.owner_id = auth.uid())
);
CREATE POLICY "config_update" ON championship_config FOR UPDATE USING (
    EXISTS (SELECT 1 FROM competitions c JOIN organizations o ON o.id = c.organization_id WHERE c.id = competition_id AND o.owner_id = auth.uid())
);

-- GROUPS
DROP POLICY IF EXISTS "groups_select" ON groups;
DROP POLICY IF EXISTS "groups_insert" ON groups;
DROP POLICY IF EXISTS "groups_update" ON groups;
DROP POLICY IF EXISTS "groups_delete" ON groups;
CREATE POLICY "groups_select" ON groups FOR SELECT USING (true);
CREATE POLICY "groups_insert" ON groups FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM competitions c JOIN organizations o ON o.id = c.organization_id WHERE c.id = competition_id AND o.owner_id = auth.uid())
);
CREATE POLICY "groups_update" ON groups FOR UPDATE USING (
    EXISTS (SELECT 1 FROM competitions c JOIN organizations o ON o.id = c.organization_id WHERE c.id = competition_id AND o.owner_id = auth.uid())
);
CREATE POLICY "groups_delete" ON groups FOR DELETE USING (
    EXISTS (SELECT 1 FROM competitions c JOIN organizations o ON o.id = c.organization_id WHERE c.id = competition_id AND o.owner_id = auth.uid())
);

-- GROUP TEAMS
DROP POLICY IF EXISTS "group_teams_select" ON group_teams;
DROP POLICY IF EXISTS "group_teams_insert" ON group_teams;
DROP POLICY IF EXISTS "group_teams_delete" ON group_teams;
CREATE POLICY "group_teams_select" ON group_teams FOR SELECT USING (true);
CREATE POLICY "group_teams_insert" ON group_teams FOR INSERT WITH CHECK (true);
CREATE POLICY "group_teams_delete" ON group_teams FOR DELETE USING (true);

-- COMPETITION REGISTRATIONS
DROP POLICY IF EXISTS "registrations_select" ON competition_registrations;
DROP POLICY IF EXISTS "registrations_insert" ON competition_registrations;
DROP POLICY IF EXISTS "registrations_update" ON competition_registrations;
DROP POLICY IF EXISTS "registrations_delete" ON competition_registrations;
CREATE POLICY "registrations_select" ON competition_registrations FOR SELECT USING (true);
CREATE POLICY "registrations_insert" ON competition_registrations FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM teams WHERE id = team_id AND manager_id = auth.uid())
);
CREATE POLICY "registrations_update" ON competition_registrations FOR UPDATE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "registrations_delete" ON competition_registrations FOR DELETE USING (
    EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid())
);

-- COMPETITION REGISTRATION FIELDS
DROP POLICY IF EXISTS "reg_fields_select" ON competition_registration_fields;
DROP POLICY IF EXISTS "reg_fields_insert" ON competition_registration_fields;
DROP POLICY IF EXISTS "reg_fields_update" ON competition_registration_fields;
DROP POLICY IF EXISTS "reg_fields_delete" ON competition_registration_fields;
CREATE POLICY "reg_fields_select" ON competition_registration_fields FOR SELECT USING (true);
CREATE POLICY "reg_fields_insert" ON competition_registration_fields FOR INSERT WITH CHECK (true);
CREATE POLICY "reg_fields_update" ON competition_registration_fields FOR UPDATE USING (true);
CREATE POLICY "reg_fields_delete" ON competition_registration_fields FOR DELETE USING (true);

-- PLAYER COMPETITION STATS
DROP POLICY IF EXISTS "player_stats_select" ON player_competition_stats;
DROP POLICY IF EXISTS "player_stats_insert" ON player_competition_stats;
DROP POLICY IF EXISTS "player_stats_update" ON player_competition_stats;
CREATE POLICY "player_stats_select" ON player_competition_stats FOR SELECT USING (true);
CREATE POLICY "player_stats_insert" ON player_competition_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "player_stats_update" ON player_competition_stats FOR UPDATE USING (true);

-- ============================================
-- STEP 6: GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- ============================================
-- STEP 7: VERIFY
-- ============================================
SELECT 'Database reset complete!' AS status;
SELECT tablename, count(*) AS policy_count 
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename 
ORDER BY tablename;
