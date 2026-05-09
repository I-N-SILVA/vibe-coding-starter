-- Match lineup selections: coach picks who plays, who's on bench, who's not called
CREATE TABLE IF NOT EXISTS match_lineups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  selection_status text NOT NULL CHECK (selection_status IN ('starting', 'bench', 'not_called')),
  position_override text,
  shirt_number int,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(match_id, player_id)
);

-- Index for fast lookups by match
CREATE INDEX IF NOT EXISTS idx_match_lineups_match_id ON match_lineups(match_id);
-- Index for player view (show player their status across matches)
CREATE INDEX IF NOT EXISTS idx_match_lineups_player_id ON match_lineups(player_id);

-- RLS: org members can read, coaches/managers can write
ALTER TABLE match_lineups ENABLE ROW LEVEL SECURITY;
