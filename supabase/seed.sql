-- ============================================
-- PLYAZ Seed Data
-- Demo Setup for Premier League
-- ============================================

-- 1. Create a demo organization (Owner ID will be set by the script)
INSERT INTO organizations (id, name, slug, owner_id, plan)
VALUES (
    'd1b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3',
    'Elite Football Academy',
    'elite-academy',
    'a1a1a1a1-a1a1-4a11-a1a1-a1a1a1a1a1a1',
    'pro'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create a competition (League)
INSERT INTO competitions (id, organization_id, name, type, status, season, start_date)
VALUES (
    'c2c2c2c2-c2c2-4c2c-c2c2-c2c2c2c2c2c2',
    'd1b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3',
    'City Championship 2026',
    'league',
    'active',
    '2026 Spring',
    '2026-03-01'
) ON CONFLICT (id) DO NOTHING;

-- 3. Create Teams
INSERT INTO teams (id, competition_id, organization_id, name, primary_color, secondary_color)
VALUES 
    ('b1b1b1b1-b1b1-4b11-b1b1-b1b1b1b1b1b1', 'c2c2c2c2-c2c2-4c2c-c2c2-c2c2c2c2c2c2', 'd1b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3', 'Red Fire FC', '#FF0000', '#FFFFFF'),
    ('b2b2b2b2-b2b2-4b22-b2b2-b2b2b2b2b2b2', 'c2c2c2c2-c2c2-4c2c-c2c2-c2c2c2c2c2c2', 'd1b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3', 'Blue Storm', '#0000FF', '#000000'),
    ('b3b3b3b3-b3b3-4b33-b3b3-b3b3b3b3b3b3', 'c2c2c2c2-c2c2-4c2c-c2c2-c2c2c2c2c2c2', 'd1b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3', 'Golden Eagles', '#FFD700', '#003300'),
    ('b4b4b4b4-b4b4-4b44-b4b4-b4b4b4b4b4b4', 'c2c2c2c2-c2c2-4c2c-c2c2-c2c2c2c2c2c2', 'd1b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3', 'Silver Titans', '#C0C0C0', '#000000')
ON CONFLICT (id) DO NOTHING;

-- 4. Create Matches
INSERT INTO matches (competition_id, organization_id, home_team_id, away_team_id, status, home_score, away_score, scheduled_at)
VALUES 
    ('c2c2c2c2-c2c2-4c2c-c2c2-c2c2c2c2c2c2', 'd1b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3', 'b1b1b1b1-b1b1-4b11-b1b1-b1b1b1b1b1b1', 'b2b2b2b2-b2b2-4b22-b2b2-b2b2b2b2b2b2', 'live', 2, 1, NOW()),
    ('c2c2c2c2-c2c2-4c2c-c2c2-c2c2c2c2c2c2', 'd1b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3', 'b3b3b3b3-b3b3-4b33-b3b3-b3b3b3b3b3b3', 'b4b4b4b4-b4b4-4b44-b4b4-b4b4b4b4b4b4', 'upcoming', 0, 0, NOW() + INTERVAL '1 day'),
    ('c2c2c2c2-c2c2-4c2c-c2c2-c2c2c2c2c2c2', 'd1b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3', 'b1b1b1b1-b1b1-4b11-b1b1-b1b1b1b1b1b1', 'b3b3b3b3-b3b3-4b33-b3b3-b3b3b3b3b3b3', 'upcoming', 0, 0, NOW() + INTERVAL '3 days')
ON CONFLICT DO NOTHING;
