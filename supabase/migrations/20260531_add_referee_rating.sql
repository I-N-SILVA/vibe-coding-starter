-- ============================================================
-- Add referee_rating to matches
-- The PATCH /api/league/matches/[id] endpoint and the match detail
-- page both reference this column; without it every rating submit
-- produces a Postgres 42703 (column does not exist) error.
-- ============================================================

ALTER TABLE matches
    ADD COLUMN IF NOT EXISTS referee_rating SMALLINT
        CHECK (referee_rating IS NULL OR (referee_rating >= 1 AND referee_rating <= 5));
