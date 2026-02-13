-- ============================================
-- COMPREHENSIVE FIX: PLYAZ Supabase Configuration
-- Run this ENTIRE script in Supabase SQL Editor
-- https://supabase.com/dashboard/project/fjtizlmvchymtshjykev/sql/new
-- ============================================

-- ============================================
-- 1. FIX PROFILE TRIGGER (for signup)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'fan'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Profile creation failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. FIX RLS POLICIES FOR PROFILES
-- ============================================
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON profiles;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 3. FIX RLS POLICIES FOR ORGANIZATIONS
-- ============================================
DROP POLICY IF EXISTS "orgs_select" ON organizations;
DROP POLICY IF EXISTS "orgs_insert" ON organizations;
DROP POLICY IF EXISTS "orgs_update" ON organizations;
DROP POLICY IF EXISTS "orgs_delete" ON organizations;

CREATE POLICY "orgs_select" ON organizations FOR SELECT USING (true);
CREATE POLICY "orgs_insert" ON organizations FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "orgs_update" ON organizations FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "orgs_delete" ON organizations FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- 4. FIX RLS POLICIES FOR COMPETITIONS
-- ============================================
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

-- ============================================
-- 5. FIX RLS POLICIES FOR TEAMS
-- ============================================
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

-- ============================================
-- 6. FIX RLS POLICIES FOR PLAYERS
-- ============================================
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

-- ============================================
-- 7. FIX RLS POLICIES FOR MATCHES
-- ============================================
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

-- ============================================
-- 8. FIX RLS POLICIES FOR MATCH EVENTS
-- ============================================
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

-- ============================================
-- 9. FIX RLS POLICIES FOR STANDINGS
-- ============================================
DROP POLICY IF EXISTS "standings_select" ON standings;
DROP POLICY IF EXISTS "standings_insert" ON standings;
DROP POLICY IF EXISTS "standings_update" ON standings;

CREATE POLICY "standings_select" ON standings FOR SELECT USING (true);
CREATE POLICY "standings_insert" ON standings FOR INSERT WITH CHECK (true);
CREATE POLICY "standings_update" ON standings FOR UPDATE USING (true);

-- ============================================
-- 10. FIX RLS POLICIES FOR INVITES
-- ============================================
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

-- ============================================
-- 11. GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Check if policies are set correctly
SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;

-- Check trigger exists
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND event_object_schema = 'auth';
