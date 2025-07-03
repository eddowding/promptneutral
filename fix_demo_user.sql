-- Fix for demo user authentication and RLS policies
-- This script allows demo users to work with the database

-- First, let's create a demo user in auth.users if it doesn't exist
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000'::uuid,
  'authenticated',
  'authenticated',
  'demo@promptneutral.com',
  '$2a$10$demo.hash.for.demo.user.only',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Demo User"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Update RLS policies to be more permissive for demo users
-- We'll create policies that allow both authenticated users AND the demo user specifically

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can manage their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can manage their own onboarding progress" ON onboarding_progress;
DROP POLICY IF EXISTS "Users can manage their own projects" ON selected_projects;
DROP POLICY IF EXISTS "Users can manage their own usage data" ON usage_data;
DROP POLICY IF EXISTS "Users can manage their own carbon credits" ON carbon_credits;
DROP POLICY IF EXISTS "Users can manage their own fetch status" ON data_fetch_status;

-- Create new policies that work with demo users
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL USING (
    auth.uid() = id OR 
    id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (
    auth.uid() = user_id OR 
    user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

CREATE POLICY "Users can manage their own API keys" ON api_keys
  FOR ALL USING (
    auth.uid() = user_id OR 
    user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

CREATE POLICY "Users can manage their own onboarding progress" ON onboarding_progress
  FOR ALL USING (
    auth.uid() = user_id OR 
    user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

CREATE POLICY "Users can manage their own projects" ON selected_projects
  FOR ALL USING (
    auth.uid() = user_id OR 
    user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

CREATE POLICY "Users can manage their own usage data" ON usage_data
  FOR ALL USING (
    auth.uid() = user_id OR 
    user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

CREATE POLICY "Users can manage their own carbon credits" ON carbon_credits
  FOR ALL USING (
    auth.uid() = user_id OR 
    user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

CREATE POLICY "Users can manage their own fetch status" ON data_fetch_status
  FOR ALL USING (
    auth.uid() = user_id OR 
    user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );