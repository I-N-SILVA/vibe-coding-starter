
-- supabase/02_update_handle_new_user_function.sql

-- Redefine handle_new_user function to include approval_status and handle invite metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role, organization_id, approval_status)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        new.raw_user_meta_data->>'avatar_url',
        COALESCE((new.raw_user_meta_data->>'role')::TEXT, 'fan'), -- Cast to TEXT for explicit matching
        (new.raw_user_meta_data->>'organization_id')::UUID, -- Safely cast to UUID
        COALESCE((new.raw_user_meta_data->>'approval_status')::TEXT, 'pending') -- Default to 'pending'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
