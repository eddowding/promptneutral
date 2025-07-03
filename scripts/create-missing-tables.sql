-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_size text;

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  service text not null,
  encrypted_key text not null,
  enabled boolean default true,
  validated boolean default false,
  last_validated timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete own api keys" ON api_keys;

-- Users can manage their own API keys
CREATE POLICY "Users can view own api keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  demo_mode boolean default false,
  data_source text default 'live',
  timezone text default 'UTC',
  currency text default 'USD',
  monthly_budget numeric(10,2) default 100,
  neutrality_target text default 'immediate',
  notifications boolean default true,
  carbon_reduction_goal integer default 25,
  reporting_frequency text default 'monthly',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

-- Users can manage their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create onboarding_progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  current_step integer default 0,
  completed_steps text[] default '{}',
  onboarding_data jsonb default '{}',
  is_complete boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for onboarding_progress
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own onboarding progress" ON onboarding_progress;
DROP POLICY IF EXISTS "Users can insert own onboarding progress" ON onboarding_progress;
DROP POLICY IF EXISTS "Users can update own onboarding progress" ON onboarding_progress;

-- Users can manage their own onboarding progress
CREATE POLICY "Users can view own onboarding progress" ON onboarding_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress" ON onboarding_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress" ON onboarding_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create selected_projects table
CREATE TABLE IF NOT EXISTS selected_projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_type text not null,
  project_id text not null,
  project_name text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now') not null
);

-- Enable RLS for selected_projects
ALTER TABLE selected_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own selected projects" ON selected_projects;
DROP POLICY IF EXISTS "Users can insert own selected projects" ON selected_projects;
DROP POLICY IF EXISTS "Users can update own selected projects" ON selected_projects;
DROP POLICY IF EXISTS "Users can delete own selected projects" ON selected_projects;

-- Users can manage their own selected projects
CREATE POLICY "Users can view own selected projects" ON selected_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own selected projects" ON selected_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own selected projects" ON selected_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own selected projects" ON selected_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS api_keys_user_service_idx ON api_keys(user_id, service);
CREATE INDEX IF NOT EXISTS user_preferences_user_idx ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS onboarding_progress_user_idx ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS selected_projects_user_idx ON selected_projects(user_id, is_active);