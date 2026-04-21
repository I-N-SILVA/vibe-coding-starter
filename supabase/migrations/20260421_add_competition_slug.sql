-- ============================================================
-- Add slug to competitions
-- Scope: unique per organization (not globally), auto-generated
-- from name with diacritic normalization and collision deduplication
-- ============================================================

-- 1. Unaccent extension for diacritic stripping (Liña → lina, not lia)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Add nullable slug column
ALTER TABLE competitions
    ADD COLUMN IF NOT EXISTS slug TEXT;

-- 3. Drop old global unique index if it exists from a prior migration
DROP INDEX IF EXISTS idx_competitions_slug;

-- 4. Per-organization composite unique index
--    Two orgs can both have "premier-league"; slugs are scoped to their org
CREATE UNIQUE INDEX IF NOT EXISTS idx_competitions_org_slug
    ON competitions (organization_id, slug)
    WHERE slug IS NOT NULL;

-- 5. Backfill existing rows with per-org deduplication
DO $$
DECLARE
    rec       RECORD;
    base_slug TEXT;
    candidate TEXT;
    n         INT;
BEGIN
    FOR rec IN
        SELECT id, organization_id, name
        FROM   competitions
        WHERE  slug IS NULL
        ORDER  BY created_at  -- deterministic ordering for suffix assignment
    LOOP
        base_slug := LEFT(
            LOWER(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        TRIM(unaccent(rec.name)),
                        '[^a-zA-Z0-9\s\-]', '', 'g'
                    ),
                    '\s+', '-', 'g'
                )
            ),
            90  -- leave room for -999 suffix within 100-char limit
        );

        IF base_slug = '' THEN
            base_slug := 'league';
        END IF;

        candidate := base_slug;
        n         := 2;

        WHILE EXISTS (
            SELECT 1 FROM competitions
            WHERE  organization_id = rec.organization_id
            AND    slug = candidate
        ) LOOP
            candidate := base_slug || '-' || n;
            n         := n + 1;
        END LOOP;

        UPDATE competitions SET slug = candidate WHERE id = rec.id;
    END LOOP;
END $$;

-- 6. Enforce NOT NULL + length bounds now that all rows are filled
ALTER TABLE competitions
    ALTER COLUMN slug SET NOT NULL,
    ADD CONSTRAINT chk_slug_length
        CHECK (char_length(slug) BETWEEN 1 AND 100);

-- 7. Trigger function — auto-generates slug on INSERT when not provided
--    The API route does this too; the trigger is the defense-in-depth layer
--    (direct DB inserts, future routes, seeding scripts, etc.)
CREATE OR REPLACE FUNCTION set_competition_slug()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    base_slug TEXT;
    candidate TEXT;
    n         INT := 2;
BEGIN
    -- If caller already provided a valid slug, keep it
    IF NEW.slug IS NOT NULL AND TRIM(NEW.slug) <> '' THEN
        RETURN NEW;
    END IF;

    base_slug := LEFT(
        LOWER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    TRIM(unaccent(NEW.name)),
                    '[^a-zA-Z0-9\s\-]', '', 'g'
                ),
                '\s+', '-', 'g'
            )
        ),
        90
    );

    IF base_slug = '' THEN
        base_slug := 'league';
    END IF;

    candidate := base_slug;

    WHILE EXISTS (
        SELECT 1 FROM competitions
        WHERE  organization_id = NEW.organization_id
        AND    slug = candidate
    ) LOOP
        candidate := base_slug || '-' || n;
        n         := n + 1;
    END LOOP;

    NEW.slug := candidate;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_competitions_slug
    BEFORE INSERT ON competitions
    FOR EACH ROW EXECUTE FUNCTION set_competition_slug();
