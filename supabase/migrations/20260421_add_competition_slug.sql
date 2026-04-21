-- Add slug column to competitions
ALTER TABLE competitions
    ADD COLUMN IF NOT EXISTS slug TEXT;

-- Partial unique index — allows NULLs, enforces uniqueness for non-null values
CREATE UNIQUE INDEX IF NOT EXISTS idx_competitions_slug
    ON competitions (slug)
    WHERE slug IS NOT NULL;

-- Backfill existing rows with a slug derived from the name
UPDATE competitions
SET slug = LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                TRIM(name),
                '[^a-zA-Z0-9\s\-]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    )
WHERE slug IS NULL;
