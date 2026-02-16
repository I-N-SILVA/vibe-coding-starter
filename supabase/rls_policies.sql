-- supabase/rls_policies.sql
-- This file is the single source of truth for all Row Level Security policies.

-- ============================================
-- Helper Functions
-- ============================================
CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT) RETURNS JSONB AS $$
    SELECT coalesce(current_setting('request.jwt.claims', true), '{}')::JSONB ->> claim
$$ LANGUAGE SQL STABLE;

-- ============================================
-- ORGANIZATIONS
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orgs_select" ON organizations;
DROP POLICY IF EXISTS "orgs_insert" ON organizations;
DROP POLICY IF EXISTS "orgs_update" ON organizations;
DROP POLICY IF EXISTS "orgs_delete" ON organizations;

CREATE POLICY "orgs_select" ON organizations FOR SELECT USING (
    id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "orgs_insert" ON organizations FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "orgs_update" ON organizations FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "orgs_delete" ON organizations FOR DELETE USING (auth.uid() = owner_id);


-- ============================================
-- PROFILES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_approved" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON profiles;


CREATE POLICY "profiles_select_own_or_in_same_org" ON profiles FOR SELECT USING (
    id = auth.uid() OR
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own_or_admin" ON profiles FOR UPDATE USING (
    id = auth.uid() OR
    (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' AND
        organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
);


-- ============================================
-- INVITES
-- ============================================
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invites_select" ON invites;
DROP POLICY IF EXISTS "invites_insert" ON invites;
DROP POLICY IF EXISTS "invites_update_by_admin_or_accept_by_user" ON invites;
DROP POLICY IF EXISTS "invites_insert_by_admin" ON invites;


CREATE POLICY "invites_select_admin_or_recipient" ON invites FOR SELECT USING (
    (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' AND
        organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    ) OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
CREATE POLICY "invites_insert_by_admin" ON invites FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' AND
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "invites_update_by_admin_or_user" ON invites FOR UPDATE USING (
    (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' AND
        organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    ) OR
    (
        email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND
        status = 'pending' AND
        (NEW.status = 'accepted' OR NEW.status = 'rejected')
    )
);


-- ============================================
-- AUDIT LOGS
-- ============================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_logs_select_by_admin" ON audit_logs;

CREATE POLICY "audit_logs_select_by_admin" ON audit_logs FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' AND
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
);

-- ============================================
-- Other tables (public read)
-- ============================================
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comps_select" ON competitions;
CREATE POLICY "comps_select" ON competitions FOR SELECT USING (true);

DROP POLICY IF EXISTS "teams_select" ON teams;
CREATE POLICY "teams_select" ON teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "players_select" ON players;
CREATE POLICY "players_select" ON players FOR SELECT USING (true);

DROP POLICY IF EXISTS "matches_select" ON matches;
CREATE POLICY "matches_select" ON matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "events_select" ON match_events;
CREATE POLICY "events_select" ON match_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "standings_select" ON standings;
CREATE POLICY "standings_select" ON standings FOR SELECT USING (true);
