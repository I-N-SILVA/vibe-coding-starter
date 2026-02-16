-- ============================================
-- PLYAZ DATABASE RESET
-- Run this in Supabase SQL Editor to fully reset
-- https://supabase.com/dashboard/project/fjtizlmvchymtshjykev/sql/new
-- ============================================

-- ============================================
-- STEP 1: DROP ALL DATA (order matters for FK constraints)
-- ============================================
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
        COALESCE((NEW.raw_user_meta_data->>'role')::TEXT, 'fan'),
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
