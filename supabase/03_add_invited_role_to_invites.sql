
-- supabase/03_add_invited_role_to_invites.sql

-- Add invited_role to invites table
ALTER TABLE invites ADD COLUMN invited_role TEXT CHECK (invited_role IN ('admin', 'referee', 'manager', 'player', 'fan'));
