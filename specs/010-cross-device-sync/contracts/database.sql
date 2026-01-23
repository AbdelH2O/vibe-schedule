-- Database Schema: Cross-Device Data Synchronization
-- Date: 2026-01-21
-- Feature: 010-cross-device-sync
--
-- Run this in Supabase SQL Editor to create all tables and policies.
-- Ensure auth.users table exists (created automatically by Supabase Auth).

-- ============================================================================
-- DEVICES TABLE
-- ============================================================================

CREATE TABLE devices (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  user_agent TEXT NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user lookup
CREATE INDEX idx_devices_user_id ON devices (user_id);

-- Enable RLS
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "select_own_devices"
ON devices FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "insert_own_devices"
ON devices FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "update_own_devices"
ON devices FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "delete_own_devices"
ON devices FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- CONTEXTS TABLE
-- ============================================================================

CREATE TABLE contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
  color TEXT NOT NULL,
  weight DECIMAL NOT NULL DEFAULT 1 CHECK (weight > 0),
  min_duration INTEGER CHECK (min_duration IS NULL OR min_duration > 0),
  max_duration INTEGER CHECK (max_duration IS NULL OR max_duration >= min_duration),
  important_dates JSONB DEFAULT '[]',
  -- Sync metadata
  sync_version BIGINT NOT NULL DEFAULT 0,
  last_modified_by UUID REFERENCES devices(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for RLS and queries
CREATE INDEX idx_contexts_user_id ON contexts (user_id);
CREATE INDEX idx_contexts_user_active ON contexts (user_id, deleted_at)
  WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "select_own_active_contexts"
ON contexts FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "insert_own_contexts"
ON contexts FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "update_own_contexts"
ON contexts FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "delete_own_contexts"
ON contexts FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  context_id UUID REFERENCES contexts(id) ON DELETE SET NULL,
  deadline TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  -- Sync metadata
  sync_version BIGINT NOT NULL DEFAULT 0,
  last_modified_by UUID REFERENCES devices(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks (user_id);
CREATE INDEX idx_tasks_user_active ON tasks (user_id, deleted_at)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_context_id ON tasks (context_id);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "select_own_active_tasks"
ON tasks FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "insert_own_tasks"
ON tasks FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "update_own_tasks"
ON tasks FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "delete_own_tasks"
ON tasks FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- SESSIONS TABLE
-- ============================================================================

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_duration INTEGER NOT NULL CHECK (total_duration > 0),
  started_at TIMESTAMPTZ NOT NULL,
  allocations JSONB NOT NULL DEFAULT '[]',
  active_context_id UUID REFERENCES contexts(id) ON DELETE SET NULL,
  context_started_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'suspended', 'completed')),
  -- Ownership tracking
  active_device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  ownership_claimed_at TIMESTAMPTZ,
  -- Sync metadata
  sync_version BIGINT NOT NULL DEFAULT 0,
  last_modified_by UUID REFERENCES devices(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_user_active ON sessions (user_id, deleted_at)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_sessions_ownership ON sessions (active_device_id, ownership_claimed_at)
  WHERE status = 'active';

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "select_own_active_sessions"
ON sessions FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "insert_own_sessions"
ON sessions FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "update_own_sessions"
ON sessions FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "delete_own_sessions"
ON sessions FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- REMINDERS TABLE
-- ============================================================================

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  config JSONB NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  scope TEXT NOT NULL CHECK (scope IN ('session-only', 'always')),
  template_id TEXT,
  last_triggered_at TIMESTAMPTZ,
  -- Sync metadata
  sync_version BIGINT NOT NULL DEFAULT 0,
  last_modified_by UUID REFERENCES devices(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reminders_user_id ON reminders (user_id);
CREATE INDEX idx_reminders_user_active ON reminders (user_id, deleted_at)
  WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "select_own_active_reminders"
ON reminders FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "insert_own_reminders"
ON reminders FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "update_own_reminders"
ON reminders FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "delete_own_reminders"
ON reminders FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- SESSION PRESETS TABLE
-- ============================================================================

CREATE TABLE session_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_duration INTEGER NOT NULL CHECK (total_duration > 0),
  allocations JSONB NOT NULL DEFAULT '[]',
  context_ids JSONB DEFAULT '[]',
  -- Sync metadata
  sync_version BIGINT NOT NULL DEFAULT 0,
  last_modified_by UUID REFERENCES devices(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_session_presets_user_id ON session_presets (user_id);
CREATE INDEX idx_session_presets_user_active ON session_presets (user_id, deleted_at)
  WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE session_presets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "select_own_active_presets"
ON session_presets FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "insert_own_presets"
ON session_presets FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "update_own_presets"
ON session_presets FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "delete_own_presets"
ON session_presets FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- USER PREFERENCES TABLE
-- ============================================================================

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sidebar_preferences JSONB NOT NULL DEFAULT '{"deadlineScopeFilter": "all"}',
  user_location JSONB,
  notification_permission TEXT NOT NULL DEFAULT 'default'
    CHECK (notification_permission IN ('default', 'granted', 'denied')),
  -- Sync metadata
  sync_version BIGINT NOT NULL DEFAULT 0,
  last_modified_by UUID REFERENCES devices(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "select_own_preferences"
ON user_preferences FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = id);

CREATE POLICY "insert_own_preferences"
ON user_preferences FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "update_own_preferences"
ON user_preferences FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for all tables (requires Supabase Dashboard or API call)
-- Run in SQL Editor or use supabase.realtime.addPolicy() in code

-- Enable REPLICA IDENTITY FULL to get 'old' values in realtime updates
ALTER TABLE contexts REPLICA IDENTITY FULL;
ALTER TABLE tasks REPLICA IDENTITY FULL;
ALTER TABLE sessions REPLICA IDENTITY FULL;
ALTER TABLE reminders REPLICA IDENTITY FULL;
ALTER TABLE session_presets REPLICA IDENTITY FULL;
ALTER TABLE user_preferences REPLICA IDENTITY FULL;
ALTER TABLE devices REPLICA IDENTITY FULL;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-increment sync_version on update
CREATE OR REPLACE FUNCTION increment_sync_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sync_version := OLD.sync_version + 1;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all syncable tables
CREATE TRIGGER contexts_sync_version
  BEFORE UPDATE ON contexts
  FOR EACH ROW EXECUTE FUNCTION increment_sync_version();

CREATE TRIGGER tasks_sync_version
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION increment_sync_version();

CREATE TRIGGER sessions_sync_version
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION increment_sync_version();

CREATE TRIGGER reminders_sync_version
  BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION increment_sync_version();

CREATE TRIGGER session_presets_sync_version
  BEFORE UPDATE ON session_presets
  FOR EACH ROW EXECUTE FUNCTION increment_sync_version();

CREATE TRIGGER user_preferences_sync_version
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION increment_sync_version();

-- ============================================================================
-- SESSION OWNERSHIP TIMEOUT
-- ============================================================================

-- Function to release stale session ownership (30 minutes)
-- Call this periodically via pg_cron or Edge Function
CREATE OR REPLACE FUNCTION release_stale_session_ownership()
RETURNS INTEGER AS $$
DECLARE
  released_count INTEGER;
BEGIN
  UPDATE sessions
  SET
    active_device_id = NULL,
    ownership_claimed_at = NULL,
    status = 'suspended'
  WHERE
    status = 'active'
    AND active_device_id IS NOT NULL
    AND ownership_claimed_at < NOW() - INTERVAL '30 minutes';

  GET DIAGNOSTICS released_count = ROW_COUNT;
  RETURN released_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (for manual trigger if needed)
GRANT EXECUTE ON FUNCTION release_stale_session_ownership() TO authenticated;
