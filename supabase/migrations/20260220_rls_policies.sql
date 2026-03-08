-- RLS Policies For PLYAZ League Manager
-- Implementation date: 2026-02-20

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_registration_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_competition_stats ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's organization_id
-- This avoids repeating the subquery in every policy
-- Using SECURITY DEFINER to bypass RLS on the profiles table
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS uuid SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql;

-- ============================================
-- PROFILES
-- ============================================

-- Users can see their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can see profiles in their own organization
CREATE POLICY "Users can view organization profiles"
ON profiles FOR SELECT
USING (organization_id = get_user_org_id());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- ORGANIZATIONS
-- ============================================

-- Users can view their own organization
CREATE POLICY "Users can view own organization"
ON organizations FOR SELECT
USING (id = get_user_org_id() OR owner_id = auth.uid());

-- Authenticated users can create an organization
CREATE POLICY "Authenticated users can create organization"
ON organizations FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Owners can update their organization
CREATE POLICY "Owners can update organization"
ON organizations FOR UPDATE
USING (owner_id = auth.uid());

-- ============================================
-- COMPETITIONS & CONFIG
-- ============================================

-- Users can view competitions in their organization
CREATE POLICY "Users can view organization competitions"
ON competitions FOR SELECT
USING (organization_id = get_user_org_id());

-- Organizers can manage competitions
CREATE POLICY "Organizers can manage competitions"
ON competitions FOR ALL
USING (organization_id = get_user_org_id());

CREATE POLICY "Users can view organization championship config"
ON championship_config FOR SELECT
USING (EXISTS (
  SELECT 1 FROM competitions 
  WHERE competitions.id = championship_config.competition_id 
  AND competitions.organization_id = get_user_org_id()
));

CREATE POLICY "Organizers can manage championship config"
ON championship_config FOR ALL
USING (EXISTS (
  SELECT 1 FROM competitions 
  WHERE competitions.id = championship_config.competition_id 
  AND competitions.organization_id = get_user_org_id()
));

-- ============================================
-- MATCHES, EVENTS & STATS
-- ============================================

-- View matches in organization
CREATE POLICY "Users can view organization matches"
ON matches FOR SELECT
USING (organization_id = get_user_org_id());

-- Manage matches
CREATE POLICY "Organizers/Referees can manage matches"
ON matches FOR ALL
USING (organization_id = get_user_org_id());

-- Match Events
CREATE POLICY "Users can view organization match events"
ON match_events FOR SELECT
USING (EXISTS (
  SELECT 1 FROM matches 
  WHERE matches.id = match_events.match_id 
  AND matches.organization_id = get_user_org_id()
));

CREATE POLICY "Organizers/Referees can manage match events"
ON match_events FOR ALL
USING (EXISTS (
  SELECT 1 FROM matches 
  WHERE matches.id = match_events.match_id 
  AND matches.organization_id = get_user_org_id()
));

-- Player Stats
CREATE POLICY "Users can view organization player stats"
ON player_competition_stats FOR SELECT
USING (EXISTS (
  SELECT 1 FROM competitions 
  WHERE competitions.id = player_competition_stats.competition_id 
  AND competitions.organization_id = get_user_org_id()
));

CREATE POLICY "Organizers manage player stats"
ON player_competition_stats FOR ALL
USING (EXISTS (
  SELECT 1 FROM competitions 
  WHERE competitions.id = player_competition_stats.competition_id 
  AND competitions.organization_id = get_user_org_id()
));

-- ============================================
-- TEAMS, PLAYERS & GROUPS
-- ============================================

CREATE POLICY "Users can view organization teams" ON teams FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Organizers can manage teams" ON teams FOR ALL USING (organization_id = get_user_org_id());

CREATE POLICY "Users can view organization players" ON players FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Organizers can manage players" ON players FOR ALL USING (organization_id = get_user_org_id());

CREATE POLICY "Users can view organization groups" ON groups FOR SELECT USING (EXISTS (
  SELECT 1 FROM competitions WHERE competitions.id = groups.competition_id AND competitions.organization_id = get_user_org_id()
));
CREATE POLICY "Organizers can manage groups" ON groups FOR ALL USING (EXISTS (
  SELECT 1 FROM competitions WHERE competitions.id = groups.competition_id AND competitions.organization_id = get_user_org_id()
));

-- ============================================
-- REGISTRATIONS
-- ============================================

CREATE POLICY "Users can view organization registrations" ON competition_registrations FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Organizers can manage registrations" ON competition_registrations FOR ALL USING (organization_id = get_user_org_id());

CREATE POLICY "Users can view registration fields" ON competition_registration_fields FOR SELECT USING (EXISTS (
  SELECT 1 FROM competitions WHERE competitions.id = competition_registration_fields.competition_id AND competitions.organization_id = get_user_org_id()
));
CREATE POLICY "Organizers manage registration fields" ON competition_registration_fields FOR ALL USING (EXISTS (
  SELECT 1 FROM competitions WHERE competitions.id = competition_registration_fields.competition_id AND competitions.organization_id = get_user_org_id()
));

-- ============================================
-- AUDIT & INVITES
-- ============================================

CREATE POLICY "Users view organization audit logs" ON audit_logs FOR SELECT USING (organization_id = get_user_org_id());
-- Only system/triggers usually insert audit logs, but for now:
CREATE POLICY "Organizers insert audit logs" ON audit_logs FOR INSERT WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users view organization invites" ON invites FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Organizers manage invites" ON invites FOR ALL USING (organization_id = get_user_org_id());

-- ============================================
-- PUBLIC DATA (Allowing public read for guest views)
-- ============================================

-- Allow guest users to see tournament-related data
CREATE POLICY "Public can view competitions" ON competitions FOR SELECT USING (true);
CREATE POLICY "Public can view teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public can view players" ON players FOR SELECT USING (true);
CREATE POLICY "Public can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public can view match events" ON match_events FOR SELECT USING (true);
CREATE POLICY "Public can view standings" ON standings FOR SELECT USING (true);
CREATE POLICY "Public can view venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can view groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Public can view championship config" ON championship_config FOR SELECT USING (true);

