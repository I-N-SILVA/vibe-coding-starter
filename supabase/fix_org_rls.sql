-- ============================================
-- FIX: Organization Creation RLS Policy
-- Run this in Supabase SQL Editor
-- ============================================

-- Allow authenticated users to insert organizations
DROP POLICY IF EXISTS "orgs_insert" ON organizations;
CREATE POLICY "orgs_insert" ON organizations 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Allow authenticated users to update their own profiles
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Verify policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('organizations', 'profiles');
