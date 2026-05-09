CREATE TABLE IF NOT EXISTS match_photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  photo_url text NOT NULL,
  caption text,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_match_photos_match_id ON match_photos(match_id);
ALTER TABLE match_photos ENABLE ROW LEVEL SECURITY;
