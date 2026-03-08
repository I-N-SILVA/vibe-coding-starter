-- PLYAZ League Manager — Full Schema
-- Migration: 20260220_create_schema.sql
-- Run BEFORE rls_policies.sql

-- ============================================================
-- TRIGGER FUNCTION: handle_updated_at
-- Sets updated_at = now() on every UPDATE
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
-- References auth.users(id) — created by Supabase Auth trigger
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
    id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email             TEXT,
    full_name         TEXT,
    avatar_url        TEXT,
    role              TEXT        NOT NULL DEFAULT 'player'
                                  CHECK (role IN ('admin','organizer','referee','manager','player','fan')),
    organization_id   UUID,       -- FK added after organizations table exists (see constraint below)
    approval_status   TEXT        NOT NULL DEFAULT 'pending'
                                  CHECK (approval_status IN ('approved','pending','rejected')),
    phone             TEXT,
    bio               TEXT,
    position          TEXT,
    jersey_number     INT,
    nationality       TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- 2. ORGANIZATIONS
-- References profiles(id) for owner_id
-- ============================================================

CREATE TABLE IF NOT EXISTS organizations (
    id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name                      TEXT        NOT NULL,
    slug                      TEXT        NOT NULL UNIQUE,
    owner_id                  UUID        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    logo_url                  TEXT,
    plan                      TEXT        NOT NULL DEFAULT 'free'
                                          CHECK (plan IN ('free','pro','elite')),
    stripe_customer_id        TEXT,
    stripe_subscription_id    TEXT,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug     ON organizations(slug);

-- Now that organizations exists, add the FK from profiles.organization_id
ALTER TABLE profiles
    DROP CONSTRAINT IF EXISTS profiles_organization_id_fkey;
ALTER TABLE profiles
    ADD CONSTRAINT profiles_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- ============================================================
-- 3. CATEGORIES
-- References organizations
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
-- References organizations, categories
-- ============================================================

CREATE TABLE IF NOT EXISTS competitions (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name             TEXT        NOT NULL,
    description      TEXT,
    type             TEXT        NOT NULL
                                 CHECK (type IN ('league','knockout','group_knockout')),
    status           TEXT        NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft','active','completed','archived')),
    season           TEXT,
    year             INT,
    category_id      UUID        REFERENCES categories(id) ON DELETE SET NULL,
    start_date       DATE,
    end_date         DATE,
    max_teams        INT         NOT NULL DEFAULT 16,
    rules            JSONB       NOT NULL DEFAULT '{}'::jsonb,
    settings         JSONB       NOT NULL DEFAULT '{}'::jsonb,
    invite_code      TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_competitions_updated_at
    BEFORE UPDATE ON competitions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_competitions_organization_id ON competitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_competitions_category_id     ON competitions(category_id);
CREATE INDEX IF NOT EXISTS idx_competitions_status          ON competitions(status);

-- ============================================================
-- 5. VENUES
-- References organizations
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
-- References organizations; optionally competitions
-- ============================================================

CREATE TABLE IF NOT EXISTS teams (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id   UUID        REFERENCES competitions(id) ON DELETE SET NULL,
    organization_id  UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name             TEXT        NOT NULL,
    short_name       TEXT,
    logo_url         TEXT,
    primary_color    TEXT        NOT NULL DEFAULT '#000000',
    secondary_color  TEXT        NOT NULL DEFAULT '#FFFFFF',
    manager_id       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
    invite_code      TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_competition_id  ON teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_teams_manager_id      ON teams(manager_id);

-- ============================================================
-- 7. PLAYERS
-- References organizations; optionally teams, profiles
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
-- 8. MATCHES
-- References competitions, organizations, teams×2,
--             venues (optional), profiles (referee, optional)
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
    group_id         UUID,       -- FK set after groups table is created
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
CREATE INDEX IF NOT EXISTS idx_matches_status          ON matches(status);

-- ============================================================
-- 9. MATCH_EVENTS
-- References matches; optionally teams, players
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
-- 10. STANDINGS
-- References competitions, teams; optionally groups
-- ============================================================

CREATE TABLE IF NOT EXISTS standings (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id   UUID        NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    team_id          UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    group_id         UUID,       -- FK set after groups table is created
    played           INT         NOT NULL DEFAULT 0,
    won              INT         NOT NULL DEFAULT 0,
    drawn            INT         NOT NULL DEFAULT 0,
    lost             INT         NOT NULL DEFAULT 0,
    goals_for        INT         NOT NULL DEFAULT 0,
    goals_against    INT         NOT NULL DEFAULT 0,
    goal_difference  INT         GENERATED ALWAYS AS (goals_for - goals_against) STORED,
    points           INT         NOT NULL DEFAULT 0,
    form             TEXT[]      NOT NULL DEFAULT '{}',
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_standings_updated_at
    BEFORE UPDATE ON standings
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_standings_competition_id ON standings(competition_id);
CREATE INDEX IF NOT EXISTS idx_standings_team_id        ON standings(team_id);

-- ============================================================
-- 11. INVITES
-- References organizations; optionally competitions, teams
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
-- 12. AUDIT_LOGS
-- References organizations; optionally profiles (user_id, target_user_id)
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

-- ============================================================
-- 13. CHAMPIONSHIP_CONFIG
-- References competitions (1:1)
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
-- 14. GROUPS
-- References competitions
-- ============================================================

CREATE TABLE IF NOT EXISTS groups (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id   UUID        NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    name             TEXT        NOT NULL,
    display_order    INT         NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_groups_competition_id ON groups(competition_id);

-- Now that groups exists, add the FKs from matches.group_id and standings.group_id
ALTER TABLE matches
    DROP CONSTRAINT IF EXISTS matches_group_id_fkey;
ALTER TABLE matches
    ADD CONSTRAINT matches_group_id_fkey
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

ALTER TABLE standings
    DROP CONSTRAINT IF EXISTS standings_group_id_fkey;
ALTER TABLE standings
    ADD CONSTRAINT standings_group_id_fkey
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_matches_group_id   ON matches(group_id);
CREATE INDEX IF NOT EXISTS idx_standings_group_id ON standings(group_id);

-- ============================================================
-- 15. GROUP_TEAMS
-- References groups, teams (junction table)
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
-- References competitions, players, teams, organizations
-- ============================================================

CREATE TABLE IF NOT EXISTS competition_registrations (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id       UUID        NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    player_id            UUID        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id              UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    organization_id      UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    id_document_type     TEXT        NOT NULL
                                     CHECK (id_document_type IN
                                            ('passport','national_id','birth_certificate','other')),
    id_document_number   TEXT        NOT NULL,
    full_name            TEXT        NOT NULL,
    date_of_birth        DATE        NOT NULL,
    jersey_number        INT,
    position             TEXT,
    photo_url            TEXT,
    custom_fields        JSONB       NOT NULL DEFAULT '{}'::jsonb,
    status               TEXT        NOT NULL DEFAULT 'pending'
                                     CHECK (status IN ('pending','approved','rejected')),
    registered_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (competition_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_competition_registrations_competition_id ON competition_registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_registrations_player_id      ON competition_registrations(player_id);
CREATE INDEX IF NOT EXISTS idx_competition_registrations_team_id        ON competition_registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_competition_registrations_organization_id ON competition_registrations(organization_id);

-- ============================================================
-- 17. COMPETITION_REGISTRATION_FIELDS
-- References competitions
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
-- References competitions, players, teams
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
