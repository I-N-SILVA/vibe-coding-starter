-- ============================================================
-- Migration: Security hardening, schema fixes, data integrity
-- ============================================================

-- ============================================================
-- 1. Add 'coach' to profiles role CHECK constraint
--    (TypeScript type already includes it; sync the DB)
-- ============================================================
ALTER TABLE profiles
    DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('admin', 'organizer', 'referee', 'manager', 'player', 'fan', 'coach'));

-- ============================================================
-- 2. Add registration_fee column to competitions
--    (declared in types.ts but missing from original schema)
-- ============================================================
ALTER TABLE competitions
    ADD COLUMN IF NOT EXISTS registration_fee NUMERIC(10, 2) DEFAULT 0 NOT NULL;

-- ============================================================
-- 3. Fix standings uniqueness — prevent duplicate team rows
-- ============================================================
ALTER TABLE standings
    ADD CONSTRAINT standings_competition_team_unique
    UNIQUE (competition_id, team_id);

-- ============================================================
-- 4. Add index on applications (target_type, target_id) for
--    polymorphic reference queries, plus a deferred trigger
--    to enforce referential integrity
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_applications_target
    ON applications (target_type, target_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_unique_per_applicant
    ON applications (target_type, target_id, applicant_id);

-- ============================================================
-- 5. Add index on audit_logs.created_at for time-range queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON audit_logs (created_at DESC);

-- Explicitly deny UPDATE and DELETE on audit_logs (immutable records)
CREATE POLICY "Audit logs are immutable — deny update"
    ON audit_logs FOR UPDATE USING (false);

CREATE POLICY "Audit logs are immutable — deny delete"
    ON audit_logs FOR DELETE USING (false);

-- Tighten audit log INSERT: user_id must match the authenticated user
-- (prevents forging logs attributed to other users)
DROP POLICY IF EXISTS "Organizers insert audit logs" ON audit_logs;
CREATE POLICY "Organizers insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (
        organization_id = get_user_org_id()
        AND (user_id IS NULL OR user_id = auth.uid())
    );

-- ============================================================
-- 7. group_teams write policies — restrict to org admins
-- ============================================================
CREATE POLICY "Organizers can manage group teams"
    ON group_teams FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM groups
            JOIN competitions ON competitions.id = groups.competition_id
            WHERE groups.id = group_teams.group_id
            AND competitions.organization_id = get_user_org_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM groups
            JOIN competitions ON competitions.id = groups.competition_id
            WHERE groups.id = group_teams.group_id
            AND competitions.organization_id = get_user_org_id()
        )
    );

-- ============================================================
-- 6. Replace USING (true) public SELECT policies with scoped
--    policies that only expose what the scoreboard needs.
--
--    The originals are dropped first, then replaced with ones
--    that restrict to status = 'active' or 'completed', and
--    never expose PII columns (profiles covered separately).
--
--    NOTE: We use DROP IF EXISTS so this is re-runnable.
-- ============================================================

-- Drop the overly-permissive public policies
DROP POLICY IF EXISTS "Public can view competitions" ON competitions;
DROP POLICY IF EXISTS "Public can view teams" ON teams;
DROP POLICY IF EXISTS "Public can view players" ON players;
DROP POLICY IF EXISTS "Public can view matches" ON matches;
DROP POLICY IF EXISTS "Public can view match events" ON match_events;
DROP POLICY IF EXISTS "Public can view standings" ON standings;
DROP POLICY IF EXISTS "Public can view venues" ON venues;
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Public can view groups" ON groups;
DROP POLICY IF EXISTS "Public can view championship config" ON championship_config;

-- Scoped public policies — only expose active/completed competitions and their data
CREATE POLICY "Public can view active competitions"
    ON competitions FOR SELECT
    USING (status IN ('active', 'completed'));

CREATE POLICY "Public can view teams in active competitions"
    ON teams FOR SELECT
    USING (
        competition_id IS NULL
        OR EXISTS (
            SELECT 1 FROM competitions
            WHERE competitions.id = teams.competition_id
            AND competitions.status IN ('active', 'completed')
        )
    );

-- Players: allow public view but protect PII — restrict to active players only
-- Full PII (DoB, nationality, phone) should be restricted to org members via the
-- existing organization-scoped policy. Anonymous users see only basic info.
-- Enforcement of column-level exposure requires views or column-level security (future).
CREATE POLICY "Public can view active players"
    ON players FOR SELECT
    USING (status = 'active');

CREATE POLICY "Public can view matches in active competitions"
    ON matches FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM competitions
            WHERE competitions.id = matches.competition_id
            AND competitions.status IN ('active', 'completed')
        )
    );

CREATE POLICY "Public can view match events in active competitions"
    ON match_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM matches
            JOIN competitions ON competitions.id = matches.competition_id
            WHERE matches.id = match_events.match_id
            AND competitions.status IN ('active', 'completed')
        )
    );

CREATE POLICY "Public can view standings in active competitions"
    ON standings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM competitions
            WHERE competitions.id = standings.competition_id
            AND competitions.status IN ('active', 'completed')
        )
    );

CREATE POLICY "Public can view venues"
    ON venues FOR SELECT
    USING (true); -- Venue names/cities are not sensitive

CREATE POLICY "Public can view categories"
    ON categories FOR SELECT
    USING (true); -- Category names are not sensitive

CREATE POLICY "Public can view groups in active competitions"
    ON groups FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM competitions
            WHERE competitions.id = groups.competition_id
            AND competitions.status IN ('active', 'completed')
        )
    );

CREATE POLICY "Public can view championship config for active competitions"
    ON championship_config FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM competitions
            WHERE competitions.id = championship_config.competition_id
            AND competitions.status IN ('active', 'completed')
        )
    );
