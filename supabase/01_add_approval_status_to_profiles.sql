
-- supabase/01_add_approval_status_to_profiles.sql

-- Add approval_status to profiles table
ALTER TABLE profiles ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('approved', 'pending', 'rejected'));
