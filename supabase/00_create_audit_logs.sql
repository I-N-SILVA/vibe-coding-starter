
-- supabase/00_create_audit_logs.sql

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who performed the action
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who was affected
    action TEXT NOT NULL, -- e.g., 'user_approved', 'role_changed', 'invite_sent', 'invite_accepted'
    details JSONB DEFAULT '{}', -- Additional context for the action
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
