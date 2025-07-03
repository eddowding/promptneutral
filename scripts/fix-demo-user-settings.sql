-- Fix row-level security for demo user to access user_settings table
-- The demo user has a hardcoded ID that needs special handling

-- First, check if demo user exists in auth.users
DO $$
BEGIN
  -- Insert demo user into auth.users if not exists
  INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
  VALUES (
    '123e4567-e89b-12d3-a456-426614174000'::uuid,
    'demo@promptneutral.com',
    '{"name": "Demo User"}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Update the RLS policies to handle demo user
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

-- Create more permissive policies that handle the demo user
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (
    auth.uid() = user_id 
    OR user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

-- Also fix the usage_data table policies for demo user
DROP POLICY IF EXISTS "Users can insert their own usage data" ON usage_data;
DROP POLICY IF EXISTS "Users can view their own usage data" ON usage_data;
DROP POLICY IF EXISTS "Users can update their own usage data" ON usage_data;

CREATE POLICY "Users can insert their own usage data"
  ON usage_data FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

CREATE POLICY "Users can view their own usage data"
  ON usage_data FOR SELECT
  USING (
    auth.uid() = user_id 
    OR user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

CREATE POLICY "Users can update their own usage data"
  ON usage_data FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );