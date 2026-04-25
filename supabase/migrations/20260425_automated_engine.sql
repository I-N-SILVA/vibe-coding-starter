-- ============================================================
-- Automated Engine: Standings, Scores, and Stats
-- ============================================================

-- 1. Function to update match scores based on match_events
CREATE OR REPLACE FUNCTION update_match_score_from_events()
RETURNS TRIGGER AS $$
DECLARE
    v_home_id UUID;
    v_away_id UUID;
    v_home_score INT;
    v_away_score INT;
BEGIN
    -- Get team IDs for the match
    SELECT home_team_id, away_team_id INTO v_home_id, v_away_id
    FROM matches WHERE id = NEW.match_id;

    -- Calculate current scores
    -- Type 'goal' increments for the player's team
    -- Type 'own_goal' increments for the OPPONENT team
    
    SELECT COUNT(*) INTO v_home_score
    FROM match_events
    WHERE match_id = NEW.match_id
      AND (
          (type = 'goal' AND team_id = v_home_id) OR
          (type = 'penalty' AND team_id = v_home_id) OR
          (type = 'own_goal' AND team_id = v_away_id)
      );

    SELECT COUNT(*) INTO v_away_score
    FROM match_events
    WHERE match_id = NEW.match_id
      AND (
          (type = 'goal' AND team_id = v_away_id) OR
          (type = 'penalty' AND team_id = v_away_id) OR
          (type = 'own_goal' AND team_id = v_home_id)
      );

    -- Update the match record
    UPDATE matches
    SET home_score = v_home_score,
        away_score = v_away_score,
        updated_at = now()
    WHERE id = NEW.match_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_match_score
AFTER INSERT OR UPDATE OR DELETE ON match_events
FOR EACH ROW EXECUTE FUNCTION update_match_score_from_events();


-- 2. Function to update player competition stats
CREATE OR REPLACE FUNCTION update_player_competition_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_competition_id UUID;
BEGIN
    -- Get competition ID from match
    SELECT competition_id INTO v_competition_id
    FROM matches WHERE id = COALESCE(NEW.match_id, OLD.match_id);

    -- This function handles INSERT/UPDATE/DELETE of events
    -- For simplicity, we'll re-calculate the specific stat for the player
    
    IF NEW.player_id IS NOT NULL THEN
        INSERT INTO player_competition_stats (competition_id, player_id, team_id)
        VALUES (v_competition_id, NEW.player_id, NEW.team_id)
        ON CONFLICT (competition_id, player_id, team_id) DO NOTHING;

        UPDATE player_competition_stats
        SET 
            goals = (SELECT COUNT(*) FROM match_events me JOIN matches m ON m.id = me.match_id WHERE me.player_id = NEW.player_id AND m.competition_id = v_competition_id AND me.type IN ('goal', 'penalty')),
            assists = (SELECT COUNT(*) FROM match_events me JOIN matches m ON m.id = me.match_id WHERE me.player_id = NEW.player_id AND m.competition_id = v_competition_id AND me.type = 'assist'),
            yellow_cards = (SELECT COUNT(*) FROM match_events me JOIN matches m ON m.id = me.match_id WHERE me.player_id = NEW.player_id AND m.competition_id = v_competition_id AND me.type = 'yellow_card'),
            red_cards = (SELECT COUNT(*) FROM match_events me JOIN matches m ON m.id = me.match_id WHERE me.player_id = NEW.player_id AND m.competition_id = v_competition_id AND me.type = 'red_card'),
            updated_at = now()
        WHERE player_id = NEW.player_id AND competition_id = v_competition_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_player_stats
AFTER INSERT OR UPDATE OR DELETE ON match_events
FOR EACH ROW EXECUTE FUNCTION update_player_competition_stats();


-- 3. Automatic Standings Calculation
CREATE OR REPLACE FUNCTION refresh_standings()
RETURNS TRIGGER AS $$
DECLARE
    v_comp_id UUID;
    v_config RECORD;
BEGIN
    v_comp_id := COALESCE(NEW.competition_id, OLD.competition_id);

    -- Get competition points config
    SELECT points_win, points_draw, points_loss 
    INTO v_config
    FROM championship_config 
    WHERE competition_id = v_comp_id;

    -- If no config, use defaults
    IF NOT FOUND THEN
        v_config := (3, 1, 0);
    END IF;

    -- Clear and rebuild standings for this competition
    -- Note: In a high-traffic app, we'd do incremental updates. 
    -- For a tournament manager, rebuilding ensures total consistency.
    
    DELETE FROM standings WHERE competition_id = v_comp_id;

    INSERT INTO standings (
        competition_id, team_id, group_id, 
        played, won, drawn, lost, 
        goals_for, goals_against, points, form
    )
    SELECT 
        v_comp_id,
        t.team_id,
        m.group_id,
        COUNT(*) FILTER (WHERE m.status = 'completed') as played,
        COUNT(*) FILTER (WHERE m.status = 'completed' AND (
            (m.home_team_id = t.team_id AND m.home_score > m.away_score) OR
            (m.away_team_id = t.team_id AND m.away_score > m.home_score)
        )) as won,
        COUNT(*) FILTER (WHERE m.status = 'completed' AND m.home_score = m.away_score) as drawn,
        COUNT(*) FILTER (WHERE m.status = 'completed' AND (
            (m.home_team_id = t.team_id AND m.home_score < m.away_score) OR
            (m.away_team_id = t.team_id AND m.away_score < m.home_score)
        )) as lost,
        SUM(CASE WHEN m.home_team_id = t.team_id THEN m.home_score ELSE m.away_score END) as goals_for,
        SUM(CASE WHEN m.home_team_id = t.team_id THEN m.away_score ELSE m.home_score END) as goals_against,
        SUM(CASE 
            WHEN m.status != 'completed' THEN 0
            WHEN (m.home_team_id = t.team_id AND m.home_score > m.away_score) OR (m.away_team_id = t.team_id AND m.away_score > m.home_score) THEN v_config.points_win
            WHEN m.home_score = m.away_score THEN v_config.points_draw
            ELSE v_config.points_loss
        END) as points,
        ARRAY(
            SELECT (CASE 
                WHEN (sm.home_team_id = t.team_id AND sm.home_score > sm.away_score) OR (sm.away_team_id = t.team_id AND sm.away_score > sm.home_score) THEN 'W'
                WHEN sm.home_score = sm.away_score THEN 'D'
                ELSE 'L'
            END)
            FROM matches sm
            WHERE sm.status = 'completed' AND (sm.home_team_id = t.team_id OR sm.away_team_id = t.team_id)
            ORDER BY sm.scheduled_at DESC, sm.updated_at DESC
            LIMIT 5
        ) as form
    FROM (
        SELECT home_team_id as team_id, id FROM matches WHERE competition_id = v_comp_id
        UNION
        SELECT away_team_id as team_id, id FROM matches WHERE competition_id = v_comp_id
    ) t
    JOIN matches m ON m.id = t.id
    GROUP BY v_comp_id, t.team_id, m.group_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refresh_standings
AFTER UPDATE OF status, home_score, away_score ON matches
FOR EACH ROW
WHEN (NEW.status = 'completed' OR OLD.status = 'completed')
EXECUTE FUNCTION refresh_standings();
