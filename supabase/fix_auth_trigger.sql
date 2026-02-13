-- ============================================
-- FIX: Auth Profile Creation Trigger
-- Run this in Supabase SQL Editor to fix signup
-- ============================================

-- 1. Ensure the profiles table allows inserts via the trigger
-- First, drop any existing policy that might conflict
DROP POLICY IF EXISTS "profiles_service_insert" ON profiles;
DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON profiles;

-- 2. Create a policy that allows the trigger to insert profiles
CREATE POLICY "Allow trigger to insert profiles" ON profiles
FOR INSERT 
WITH CHECK (true);

-- 3. Recreate the handle_new_user function with proper permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'fan'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Failed to create profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon, authenticated;

-- Verify: This should return the trigger details
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';
