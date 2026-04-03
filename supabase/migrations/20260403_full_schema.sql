-- ============================================================
-- PLYAZ League Manager — Full Schema (consolidated)
-- Safe to run on an existing database — drops everything first.
-- Replaces: 20260220_create_schema.sql, 20260220_rls_policies.sql,
--           20260309_recruitment_schema.sql, 20260402_fixes_and_hardening.sql,
--           20260402_pgcrypto_and_views.sql
-- ============================================================

-- ============================================================
-- TEARDOWN — drop all objects in reverse dependency order
-- CASCADE handles any remaining FK references automatically
-- ============================================================

DROP VIEW  IF EXISTS matches_with_teams;

DROP TABLE IF EXISTS applications                    CASCADE;
DROP TABLE IF EXISTS player_competition_stats        CASCADE;
DROP TABLE IF EXISTS competition_registration_fields CASCADE;
DROP TABLE IF EXISTS competition_registrations       CASCADE;
DROP TABLE IF EXISTS group_teams                     CASCADE;
DROP TABLE IF EXISTS championship_config             CASCADE;
DROP TABLE IF EXISTS audit_logs                      CASCADE;
DROP TABLE IF EXISTS invites                         CASCADE;
DROP TABLE IF EXISTS standings                       CASCADE;
DROP TABLE IF EXISTS match_events                    CASCADE;
DROP TABLE IF EXISTS matches                         CASCADE;
DROP TABLE IF EXISTS groups                          CASCADE;
DROP TABLE IF EXISTS players                         CASCADE;
DROP TABLE IF EXISTS teams                           CASCADE;
DROP TABLE IF EXISTS venues                          CASCADE;
DROP TABLE IF EXISTS categories                      CASCADE;
DROP TABLE IF EXISTS competitions                    CASCADE;
DROP TABLE IF EXISTS organizations                   CASCADE;
DROP TABLE IF EXISTS profiles                        CASCADE;

DROP FUNCTION IF EXISTS get_user_org_id()  CASCADE;
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- HELPER FUNCTION: updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ============================================================
-- 1. PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
    id               UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email            TEXT,
    full_name        TEXT,
    avatar_url       TEXT,
    role             TEXT        NOT NULL DEFAULT 'player'
                                 CHECK (role IN ('admin','organizer','referee','manager','player','fan','coach')),
    organization_id  UUID,       -- FK added after organizations is created
    approval_status  TEXT        NOT NULL DEFAULT 'pending'
                                 CHECK (approval_status IN ('approved','pending','rejected')),
    phone            TEXT,
    bio              TEXT,
    position         TEXT,
    jersey_number    INT,
    nationality      TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- get_user_org_id must be defined AFTER profiles exists (LANGUAGE sql validates at creation time)
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS uuid SECURITY DEFINER
SET search_path = public AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql;

-- ============================================================
-- 2. ORGANIZATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS organizations (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    TEXT        NOT NULL,
    slug                    TEXT        NOT NULL UNIQUE,
    owner_id                UUID        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    logo_url                TEXT,
    plan                    TEXT        NOT NULL DEFAULT 'free'
                                        CHECK (plan IN ('free','pro','elite')),
    stripe_customer_id      TEXT,
    stripe_subscription_id  TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug     ON organizations(slug);

-- Deferred FK: profiles.organization_id → organizations
ALTER TABLE profiles
    DROP CONSTRAINT IF EXISTS profiles_organization_id_fkey;
ALTER TABLE profiles
    ADD CONSTRAINT profiles_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- ============================================================
-- 3. CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name             TEXT        NOT NULL,
    description      TEXT,
    min_age          INT,
    max_age          INT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_categories_organization_id ON categories(organization_id);

-- ============================================================
-- 4. COMPETITIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS competitions (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id       UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name                  TEXT        NOT NULL,
    description           TEXT,
    type                  TEXT        NOT NULL
                                      CHECK (type IN ('league','knockout','group_knockout')),
    status                TEXT        NOT NULL DEFAULT 'draft'
                                      CHECK (status IN ('draft','active','completed','archived')),
    season                TEXT,
    year                  INT,
    category_id           UUID        REFERENCES categories(id) ON DELETE SET NULL,
    start_date            DATE,
    end_date              DATE,
    max_teams             INT         NOT NULL DEFAULT 16,
    registration_fee      NUMERIC(10,2) NOT NULL DEFAULT 0,
    rules                 JSONB       NOT NULL DEFAULT '{}'::jsonb,
    settings              JSONB       NOT NULL DEFAULT '{}'::jsonb,
    invite_code           TEXT,
    is_recruiting_referees BOOLEAN    NOT NULL DEFAULT false,
    recruitment_message   TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_competitions_updated_at
    BEFORE UPDATE ON competitions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_competitions_organization_id ON competitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_competitions_category_id     ON competitions(category_id);
CREATE INDEX IF NOT EXISTS idx_competitions_status          ON competitions(status);

-- ============================================================
-- 5. VENUES
-- ============================================================

CREATE TABLE IF NOT EXISTS venues (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name             TEXT        NOT NULL,
    address          TEXT,
    city             TEXT,
    capacity         INT,
    surface_type     TEXT        CHECK (surface_type IN ('grass','artificial','indoor','hybrid')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_venues_organization_id ON venues(organization_id);

-- ============================================================
-- 6. TEAMS
-- ============================================================

CREATE TABLE IF NOT EXISTS teams (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id          UUID        REFERENCES competitions(id) ON DELETE SET NULL,
    organization_id         UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name                    TEXT        NOT NULL,
    short_name              TEXT,
    logo_url                TEXT,
    primary_color           TEXT        NOT NULL DEFAULT '#000000',
    secondary_color         TEXT        NOT NULL DEFAULT '#FFFFFF',
    manager_id              UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    invite_code             TEXT,
    is_recruiting_players   BOOLEAN     NOT NULL DEFAULT false,
    needed_positions        TEXT[]      NOT NULL DEFAULT '{}',
    recruitment_message     TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_competition_id  ON teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_teams_manager_id      ON teams(manager_id);

-- ============================================================
-- 7. PLAYERS
-- ============================================================

CREATE TABLE IF NOT EXISTS players (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id          UUID        REFERENCES teams(id) ON DELETE SET NULL,
    profile_id       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    organization_id  UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name             TEXT        NOT NULL,
    position         TEXT        CHECK (position IN
                                    ('GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF')),
    jersey_number    INT,
    date_of_birth    DATE,
    nationality      TEXT,
    photo_url        TEXT,
    bio              TEXT,
    status           TEXT        NOT NULL DEFAULT 'active'
                                 CHECK (status IN ('active','injured','suspended','released')),
    stats            JSONB       NOT NULL DEFAULT '{}'::jsonb,
    social_links     JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_players_organization_id ON players(organization_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id         ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_profile_id      ON players(profile_id);

-- ============================================================
-- 8. GROUPS
-- (defined before matches so matches.group_id FK can be added inline)
-- ============================================================

CREATE TABLE IF NOT EXISTS groups (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id   UUID        NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    name             TEXT        NOT NULL,
    display_order    INT         NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_groups_competition_id ON groups(competition_id);

-- ============================================================
-- 9. MATCHES
-- ============================================================

CREATE TABLE IF NOT EXISTS matches (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id   UUID        NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    organization_id  UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    home_team_id     UUID        NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    away_team_id     UUID        NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    matchday         INT,
    round            TEXT,
    home_score       INT         NOT NULL DEFAULT 0,
    away_score       INT         NOT NULL DEFAULT 0,
    status           TEXT        NOT NULL DEFAULT 'upcoming'
                                 CHECK (status IN ('upcoming','scheduled','live','completed','postponed','cancelled')),
    match_time       TEXT,
    venue            TEXT,
    venue_id         UUID        REFERENCES venues(id) ON DELETE SET NULL,
    group_id         UUID        REFERENCES groups(id) ON DELETE SET NULL,
    referee_id       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    scheduled_at     TIMESTAMPTZ,
    started_at       TIMESTAMPTZ,
    ended_at         TIMESTAMPTZ,
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_matches_competition_id  ON matches(competition_id);
CREATE INDEX IF NOT EXISTS idx_matches_organization_id ON matches(organization_id);
CREATE INDEX IF NOT EXISTS idx_matches_home_team_id    ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team_id    ON matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_venue_id        ON matches(venue_id);
CREATE INDEX IF NOT EXISTS idx_matches_referee_id      ON matches(referee_id);
CREATE INDEX IF NOT EXISTS idx_matches_group_id        ON matches(group_id);
CREATE INDEX IF NOT EXISTS idx_matches_status          ON matches(status);

-- ============================================================
-- 10. MATCH_EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS match_events (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id     UUID        NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    type         TEXT        NOT NULL
                             CHECK (type IN ('goal','own_goal','penalty','yellow_card','red_card',
                                             'substitution','injury','var_review')),
    team_id      UUID        REFERENCES teams(id) ON DELETE SET NULL,
    player_id    UUID        REFERENCES players(id) ON DELETE SET NULL,
    player_name  TEXT,
    minute       INT,
    half         TEXT        CHECK (half IN ('1st','2nd','ET1','ET2','penalties')),
    details      JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_match_events_match_id   ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_team_id    ON match_events(team_id);
CREATE INDEX IF NOT EXISTS idx_match_events_player_id  ON match_events(player_id);

-- ============================================================
-- 11. STANDINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS standings (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id   UUID        NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    team_id          UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    group_id         UUID        REFERENCES groups(id) ON DELETE SET NULL,
    played           INT         NOT NULL DEFAULT 0,
    won              INT         NOT NULL DEFAULT 0,
    drawn            INT         NOT NULL DEFAULT 0,
    lost             INT         NOT NULL DEFAULT 0,
    goals_for        INT         NOT NULL DEFAULT 0,
    goals_against    INT         NOT NULL DEFAULT 0,
    goal_difference  INT         GENERATED ALWAYS AS (goals_for - goals_against) STORED,
    points           INT         NOT NULL DEFAULT 0,
    form             TEXT[]      NOT NULL DEFAULT '{}',
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT standings_competition_team_unique UNIQUE (competition_id, team_id)
);

CREATE OR REPLACE TRIGGER trg_standings_updated_at
    BEFORE UPDATE ON standings
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_standings_competition_id ON standings(competition_id);
CREATE INDEX IF NOT EXISTS idx_standings_team_id        ON standings(team_id);
CREATE INDEX IF NOT EXISTS idx_standings_group_id       ON standings(group_id);

-- ============================================================
-- 12. INVITES
-- ============================================================

CREATE TABLE IF NOT EXISTS invites (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    competition_id   UUID        REFERENCES competitions(id) ON DELETE CASCADE,
    team_id          UUID        REFERENCES teams(id) ON DELETE CASCADE,
    type             TEXT        NOT NULL
                                 CHECK (type IN ('team_join','player_join','referee_invite','admin_invite')),
    email            TEXT,
    invited_role     TEXT,
    token            TEXT        NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    status           TEXT        NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending','accepted','expired','revoked')),
    expires_at       TIMESTAMPTZ NOT NULL,
    accepted_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    accepted_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invites_organization_id ON invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_invites_token           ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email           ON invites(email);

-- ============================================================
-- 13. AUDIT_LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id          UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    target_user_id   UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    action           TEXT        NOT NULL,
    details          JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id         ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at      ON audit_logs(created_at DESC);

-- ============================================================
-- 14. CHAMPIONSHIP_CONFIG
-- ============================================================

CREATE TABLE IF NOT EXISTS championship_config (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id          UUID        NOT NULL UNIQUE REFERENCES competitions(id) ON DELETE CASCADE,
    format                  TEXT        NOT NULL DEFAULT 'round_robin'
                                        CHECK (format IN ('round_robin','knockout','group_knockout')),
    groups_count            INT         NOT NULL DEFAULT 1,
    teams_per_group         INT         NOT NULL DEFAULT 4,
    advance_count           INT         NOT NULL DEFAULT 2,
    has_gold_final          BOOLEAN     NOT NULL DEFAULT true,
    has_silver_final        BOOLEAN     NOT NULL DEFAULT false,
    has_third_place         BOOLEAN     NOT NULL DEFAULT true,
    points_win              INT         NOT NULL DEFAULT 3,
    points_draw             INT         NOT NULL DEFAULT 1,
    points_loss             INT         NOT NULL DEFAULT 0,
    match_duration_minutes  INT         NOT NULL DEFAULT 90,
    half_time_minutes       INT         NOT NULL DEFAULT 45,
    has_extra_time          BOOLEAN     NOT NULL DEFAULT false,
    extra_time_minutes      INT         NOT NULL DEFAULT 30,
    has_penalties           BOOLEAN     NOT NULL DEFAULT false,
    max_substitutions       INT         NOT NULL DEFAULT 5,
    custom_rules            JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_championship_config_updated_at
    BEFORE UPDATE ON championship_config
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_championship_config_competition_id ON championship_config(competition_id);

-- ============================================================
-- 15. GROUP_TEAMS
-- ============================================================

CREATE TABLE IF NOT EXISTS group_teams (
    id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id  UUID    NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    team_id   UUID    NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    seed      INT,
    UNIQUE (group_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_group_teams_group_id ON group_teams(group_id);
CREATE INDEX IF NOT EXISTS idx_group_teams_team_id  ON group_teams(team_id);

-- ============================================================
-- 16. COMPETITION_REGISTRATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS competition_registrations (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id          UUID        NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    player_id               UUID        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id                 UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    organization_id         UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    id_document_type        TEXT        NOT NULL
                                        CHECK (id_document_type IN
                                               ('passport','national_id','birth_certificate','other')),
    id_document_number      TEXT        NOT NULL,   -- plain text (legacy / fallback)
    id_document_number_enc  BYTEA,                  -- pgp_sym_encrypt — app writes here at registration time
    full_name               TEXT        NOT NULL,
    date_of_birth           DATE        NOT NULL,
    jersey_number           INT,
    position                TEXT,
    photo_url               TEXT,
    custom_fields           JSONB       NOT NULL DEFAULT '{}'::jsonb,
    status                  TEXT        NOT NULL DEFAULT 'pending'
                                        CHECK (status IN ('pending','approved','rejected')),
    registered_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (competition_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_competition_registrations_competition_id  ON competition_registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_registrations_player_id       ON competition_registrations(player_id);
CREATE INDEX IF NOT EXISTS idx_competition_registrations_team_id         ON competition_registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_competition_registrations_organization_id ON competition_registrations(organization_id);

-- ============================================================
-- 17. COMPETITION_REGISTRATION_FIELDS
-- ============================================================

CREATE TABLE IF NOT EXISTS competition_registration_fields (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id   UUID        NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    field_name       TEXT        NOT NULL,
    field_type       TEXT        NOT NULL
                                 CHECK (field_type IN ('text','number','date','select','file')),
    is_required      BOOLEAN     NOT NULL DEFAULT false,
    options          JSONB       NOT NULL DEFAULT '[]'::jsonb,
    display_order    INT         NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competition_registration_fields_competition_id
    ON competition_registration_fields(competition_id);

-- ============================================================
-- 18. PLAYER_COMPETITION_STATS
-- ============================================================

CREATE TABLE IF NOT EXISTS player_competition_stats (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id   UUID        NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    player_id        UUID        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id          UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    games_played     INT         NOT NULL DEFAULT 0,
    goals            INT         NOT NULL DEFAULT 0,
    assists          INT         NOT NULL DEFAULT 0,
    yellow_cards     INT         NOT NULL DEFAULT 0,
    red_cards        INT         NOT NULL DEFAULT 0,
    minutes_played   INT         NOT NULL DEFAULT 0,
    clean_sheets     INT         NOT NULL DEFAULT 0,
    saves            INT         NOT NULL DEFAULT 0,
    goals_conceded   INT         NOT NULL DEFAULT 0,
    penalties_saved  INT         NOT NULL DEFAULT 0,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (competition_id, player_id, team_id)
);

CREATE OR REPLACE TRIGGER trg_player_competition_stats_updated_at
    BEFORE UPDATE ON player_competition_stats
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_player_competition_stats_competition_id ON player_competition_stats(competition_id);
CREATE INDEX IF NOT EXISTS idx_player_competition_stats_player_id      ON player_competition_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_competition_stats_team_id        ON player_competition_stats(team_id);

-- ============================================================
-- 19. APPLICATIONS (recruitment)
-- ============================================================

CREATE TABLE IF NOT EXISTS applications (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    applicant_role TEXT        NOT NULL CHECK (applicant_role IN ('player','referee')),
    target_id      UUID        NOT NULL,   -- teams.id or competitions.id
    target_type    TEXT        NOT NULL CHECK (target_type IN ('team','competition')),
    status         TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','accepted','rejected')),
    message        TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (applicant_id, target_id)
);

CREATE OR REPLACE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_applications_target           ON applications(target_type, target_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_unique_per_applicant
    ON applications(target_type, target_id, applicant_id);

-- ============================================================
-- 20. VIEWS
-- ============================================================

CREATE OR REPLACE VIEW matches_with_teams AS
SELECT
    m.*,
    ht.name         AS home_team_name,
    ht.short_name   AS home_team_short_name,
    ht.logo_url     AS home_team_logo_url,
    at.name         AS away_team_name,
    at.short_name   AS away_team_short_name,
    at.logo_url     AS away_team_logo_url
FROM matches m
LEFT JOIN teams ht ON ht.id = m.home_team_id
LEFT JOIN teams at ON at.id = m.away_team_id;

GRANT SELECT ON matches_with_teams TO anon, authenticated;

-- ============================================================
-- ROW LEVEL SECURITY — enable on all tables
-- ============================================================

ALTER TABLE profiles                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues                         ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams                          ENABLE ROW LEVEL SECURITY;
ALTER TABLE players                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups                         ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_config            ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_teams                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_registrations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_registration_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_competition_stats       ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications                   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- ---- PROFILES ----

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view organization profiles"
    ON profiles FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- ---- ORGANIZATIONS ----

CREATE POLICY "Users can view own organization"
    ON organizations FOR SELECT
    USING (id = get_user_org_id() OR owner_id = auth.uid());

CREATE POLICY "Authenticated users can create organization"
    ON organizations FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update organization"
    ON organizations FOR UPDATE
    USING (owner_id = auth.uid());

-- ---- COMPETITIONS ----

CREATE POLICY "Users can view organization competitions"
    ON competitions FOR SELECT
    USING (organization_id = get_user_org_id());

CREATE POLICY "Organizers can manage competitions"
    ON competitions FOR ALL
    USING (organization_id = get_user_org_id());

CREATE POLICY "Public can view active competitions"
    ON competitions FOR SELECT
    USING (status IN ('active','completed'));

-- ---- CHAMPIONSHIP_CONFIG ----

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

CREATE POLICY "Public can view championship config for active competitions"
    ON championship_config FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM competitions
        WHERE competitions.id = championship_config.competition_id
          AND competitions.status IN ('active','completed')
    ));

-- ---- MATCHES ----

CREATE POLICY "Users can view organization matches"
    ON matches FOR SELECT
    USING (organization_id = get_user_org_id());

CREATE POLICY "Organizers/Referees can manage matches"
    ON matches FOR ALL
    USING (organization_id = get_user_org_id());

CREATE POLICY "Public can view matches in active competitions"
    ON matches FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM competitions
        WHERE competitions.id = matches.competition_id
          AND competitions.status IN ('active','completed')
    ));

-- ---- MATCH_EVENTS ----

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

CREATE POLICY "Public can view match events in active competitions"
    ON match_events FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM matches
        JOIN competitions ON competitions.id = matches.competition_id
        WHERE matches.id = match_events.match_id
          AND competitions.status IN ('active','completed')
    ));

-- ---- STANDINGS ----

CREATE POLICY "Users can view organization standings"
    ON standings FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM competitions
        WHERE competitions.id = standings.competition_id
          AND competitions.organization_id = get_user_org_id()
    ));

CREATE POLICY "Organizers can manage standings"
    ON standings FOR ALL
    USING (EXISTS (
        SELECT 1 FROM competitions
        WHERE competitions.id = standings.competition_id
          AND competitions.organization_id = get_user_org_id()
    ));

CREATE POLICY "Public can view standings in active competitions"
    ON standings FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM competitions
        WHERE competitions.id = standings.competition_id
          AND competitions.status IN ('active','completed')
    ));

-- ---- PLAYER_COMPETITION_STATS ----

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

-- ---- TEAMS ----

CREATE POLICY "Users can view organization teams"
    ON teams FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "Organizers can manage teams"
    ON teams FOR ALL USING (organization_id = get_user_org_id());

CREATE POLICY "Public can view teams in active competitions"
    ON teams FOR SELECT
    USING (
        competition_id IS NULL
        OR EXISTS (
            SELECT 1 FROM competitions
            WHERE competitions.id = teams.competition_id
              AND competitions.status IN ('active','completed')
        )
    );

-- ---- PLAYERS ----

CREATE POLICY "Users can view organization players"
    ON players FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "Organizers can manage players"
    ON players FOR ALL USING (organization_id = get_user_org_id());

CREATE POLICY "Public can view active players"
    ON players FOR SELECT USING (status = 'active');

-- ---- GROUPS ----

CREATE POLICY "Users can view organization groups"
    ON groups FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM competitions
        WHERE competitions.id = groups.competition_id
          AND competitions.organization_id = get_user_org_id()
    ));

CREATE POLICY "Organizers can manage groups"
    ON groups FOR ALL
    USING (EXISTS (
        SELECT 1 FROM competitions
        WHERE competitions.id = groups.competition_id
          AND competitions.organization_id = get_user_org_id()
    ));

CREATE POLICY "Public can view groups in active competitions"
    ON groups FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM competitions
        WHERE competitions.id = groups.competition_id
          AND competitions.status IN ('active','completed')
    ));

-- ---- GROUP_TEAMS ----

CREATE POLICY "Organizers can manage group teams"
    ON group_teams FOR ALL
    USING (EXISTS (
        SELECT 1 FROM groups
        JOIN competitions ON competitions.id = groups.competition_id
        WHERE groups.id = group_teams.group_id
          AND competitions.organization_id = get_user_org_id()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM groups
        JOIN competitions ON competitions.id = groups.competition_id
        WHERE groups.id = group_teams.group_id
          AND competitions.organization_id = get_user_org_id()
    ));

-- ---- REGISTRATIONS ----

CREATE POLICY "Users can view organization registrations"
    ON competition_registrations FOR SELECT
    USING (organization_id = get_user_org_id());

CREATE POLICY "Organizers can manage registrations"
    ON competition_registrations FOR ALL
    USING (organization_id = get_user_org_id());

CREATE POLICY "Users can view registration fields"
    ON competition_registration_fields FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM competitions
        WHERE competitions.id = competition_registration_fields.competition_id
          AND competitions.organization_id = get_user_org_id()
    ));

CREATE POLICY "Organizers manage registration fields"
    ON competition_registration_fields FOR ALL
    USING (EXISTS (
        SELECT 1 FROM competitions
        WHERE competitions.id = competition_registration_fields.competition_id
          AND competitions.organization_id = get_user_org_id()
    ));

-- ---- AUDIT_LOGS ----

CREATE POLICY "Users view organization audit logs"
    ON audit_logs FOR SELECT
    USING (organization_id = get_user_org_id());

CREATE POLICY "Organizers insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (
        organization_id = get_user_org_id()
        AND (user_id IS NULL OR user_id = auth.uid())
    );

CREATE POLICY "Audit logs are immutable — deny update"
    ON audit_logs FOR UPDATE USING (false);

CREATE POLICY "Audit logs are immutable — deny delete"
    ON audit_logs FOR DELETE USING (false);

-- ---- INVITES ----

CREATE POLICY "Users view organization invites"
    ON invites FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "Organizers manage invites"
    ON invites FOR ALL USING (organization_id = get_user_org_id());

-- ---- CATEGORIES ----

CREATE POLICY "Users can view organization categories"
    ON categories FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "Organizers can manage categories"
    ON categories FOR ALL USING (organization_id = get_user_org_id());

CREATE POLICY "Public can view categories"
    ON categories FOR SELECT USING (true);

-- ---- VENUES ----

CREATE POLICY "Users can view organization venues"
    ON venues FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "Organizers can manage venues"
    ON venues FOR ALL USING (organization_id = get_user_org_id());

CREATE POLICY "Public can view venues"
    ON venues FOR SELECT USING (true);

-- ---- APPLICATIONS ----

CREATE POLICY "Applicants can view their own applications"
    ON applications FOR SELECT
    USING (auth.uid() = applicant_id);

CREATE POLICY "Applicants can create applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Managers can view team applications"
    ON applications FOR SELECT
    USING (
        target_type = 'team'
        AND target_id IN (
            SELECT id FROM teams
            WHERE manager_id = auth.uid()
               OR organization_id IN (
                   SELECT id FROM organizations WHERE owner_id = auth.uid()
               )
        )
    );

CREATE POLICY "Managers can update team applications"
    ON applications FOR UPDATE
    USING (
        target_type = 'team'
        AND target_id IN (
            SELECT id FROM teams
            WHERE manager_id = auth.uid()
               OR organization_id IN (
                   SELECT id FROM organizations WHERE owner_id = auth.uid()
               )
        )
    );

CREATE POLICY "Organizers can view competition applications"
    ON applications FOR SELECT
    USING (
        target_type = 'competition'
        AND target_id IN (
            SELECT id FROM competitions
            WHERE organization_id IN (
                SELECT id FROM organizations WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Organizers can update competition applications"
    ON applications FOR UPDATE
    USING (
        target_type = 'competition'
        AND target_id IN (
            SELECT id FROM competitions
            WHERE organization_id IN (
                SELECT id FROM organizations WHERE owner_id = auth.uid()
            )
        )
    );
