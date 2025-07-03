-- Fix Database Script - Run this in Supabase Dashboard SQL Editor
-- This script fixes all database issues in the correct order

-- Step 1: Clean up migration history
DELETE FROM supabase_migrations.schema_migrations 
WHERE version IN ('20250103', '20250702222814');

-- Step 2: Create feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'resolved')),
  url TEXT NOT NULL,
  follow_up BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Admin users can view all feedback" ON feedback;
DROP POLICY IF EXISTS "Users can create feedback" ON feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can update own feedback" ON feedback;

CREATE POLICY "Admin users can view all feedback"
  ON feedback FOR SELECT
  USING (true);

CREATE POLICY "Users can create feedback" 
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Step 3: Create user_settings table (CRITICAL - needed for historical data sync)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Step 4: Fix usage_data constraints
ALTER TABLE usage_data 
DROP CONSTRAINT IF EXISTS usage_data_user_date_model_endpoint_unique;

ALTER TABLE usage_data 
DROP CONSTRAINT IF EXISTS usage_data_user_date_model_unique;

-- Add endpoint and batch columns if they don't exist
ALTER TABLE usage_data 
ADD COLUMN IF NOT EXISTS endpoint TEXT;

ALTER TABLE usage_data 
ADD COLUMN IF NOT EXISTS batch TEXT;

-- Update any NULL endpoints
UPDATE usage_data SET endpoint = 'unknown' WHERE endpoint IS NULL;

-- Add the unique constraint
ALTER TABLE usage_data
ADD CONSTRAINT usage_data_user_date_model_endpoint_unique 
UNIQUE (user_id, date, model, endpoint);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_data_user_date ON usage_data(user_id, date);
CREATE INDEX IF NOT EXISTS idx_usage_data_date_desc ON usage_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_usage_data_model ON usage_data(model);

-- Step 5: Create timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Record migrations as applied
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES 
  ('20250103002', '20250103_002_fix_existing_tables', ARRAY['CREATE TABLE IF NOT EXISTS feedback', 'CREATE TABLE IF NOT EXISTS user_settings']),
  ('20250703', '20250703_fix_usage_data_constraints', ARRAY['ALTER TABLE usage_data'])
ON CONFLICT (version) DO NOTHING;

-- Verify everything worked
SELECT 'Tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('feedback', 'user_settings', 'usage_data');

SELECT 'Migrations recorded:' as status;
SELECT version, name FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 5;