-- KYC fields for minor players
ALTER TABLE players
    ADD COLUMN IF NOT EXISTS is_minor            boolean      NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS guardian_name       text,
    ADD COLUMN IF NOT EXISTS guardian_email      text,
    ADD COLUMN IF NOT EXISTS guardian_phone      text,
    ADD COLUMN IF NOT EXISTS guardian_relation   text,
    ADD COLUMN IF NOT EXISTS guardian_token      text         UNIQUE,
    ADD COLUMN IF NOT EXISTS guardian_consented_at timestamptz,
    ADD COLUMN IF NOT EXISTS image_rights_granted boolean,
    ADD COLUMN IF NOT EXISTS data_consent_granted boolean;

-- Index for guardian consent lookup
CREATE INDEX IF NOT EXISTS idx_players_guardian_token ON players (guardian_token) WHERE guardian_token IS NOT NULL;
