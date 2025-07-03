-- Fix RLS policies to allow demo user access
-- This adds a demo user to the auth.users table and updates RLS policies

-- First, let's create a demo user in the auth.users table
-- Note: In production, this would be handled by Supabase Auth
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'demo@promptneutral.com',
  '$2a$10$X5qP8Xj7vYq9O2F8k3F3F.F3F3F3F3F3F3F3F3F3F3F3F3F3F3F3F3F3', -- dummy encrypted password
  now(),
  now(),
  now(),
  '{"full_name": "Demo User"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create a profile for the demo user
INSERT INTO profiles (
  id,
  email,
  full_name,
  created_at,
  updated_at
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'demo@promptneutral.com',
  'Demo User',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = EXCLUDED.updated_at;

-- Alternative: Update RLS policies to be more permissive for demo users
-- Option 1: Allow specific demo user ID
DROP POLICY IF EXISTS "Demo user can manage api keys" ON api_keys;
CREATE POLICY "Demo user can manage api keys" ON api_keys
  FOR ALL 
  USING (user_id = '123e4567-e89b-12d3-a456-426614174000');

DROP POLICY IF EXISTS "Demo user can manage preferences" ON user_preferences;
CREATE POLICY "Demo user can manage preferences" ON user_preferences
  FOR ALL 
  USING (user_id = '123e4567-e89b-12d3-a456-426614174000');

DROP POLICY IF EXISTS "Demo user can manage profile" ON profiles;
CREATE POLICY "Demo user can manage profile" ON profiles
  FOR ALL 
  USING (id = '123e4567-e89b-12d3-a456-426614174000');

-- Keep the original policies for real authenticated users
-- These should still work with auth.uid()
CREATE POLICY "Authenticated users can manage own api keys" ON api_keys
  FOR ALL 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage own preferences" ON user_preferences
  FOR ALL 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage own profile" ON profiles
  FOR ALL 
  USING (auth.uid() = id AND auth.uid() IS NOT NULL);