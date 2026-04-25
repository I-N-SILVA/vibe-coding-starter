-- ==========================================
-- Supabase Storage Setup for PLYAZ
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create storage buckets if they don't exist
-- 'avatars' for player profile photos
-- 'logos' for team crests

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS Policies for Storage

-- Policy A: Allow anyone to view images (Public Read)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('avatars', 'logos'));

-- Policy B: Allow authenticated users to upload files
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('avatars', 'logos') AND 
  auth.role() = 'authenticated'
);

-- Policy C: Allow users to update/delete their own uploads
-- (Uses auth.uid() if you set the 'owner' field during upload, but standard upsert works too)
CREATE POLICY "Manage Own Uploads" ON storage.objects FOR ALL USING (
  bucket_id IN ('avatars', 'logos') AND 
  auth.role() = 'authenticated'
);
