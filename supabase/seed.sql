-- PromptNeutral Database Schema
-- Based on the setup guide in _docs/supabase-setup.md

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  company text,
  role text,
  industry text,
  team_size text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Profiles are viewable by the user who owns them
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create usage_data table
CREATE TABLE IF NOT EXISTS usage_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  model text not null,
  requests integer not null default 0,
  context_tokens integer not null default 0,
  generated_tokens integer not null default 0,
  cost decimal(10,4) not null default 0,
  co2_grams decimal(10,2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE usage_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own usage data" ON usage_data;
DROP POLICY IF EXISTS "Users can insert own usage data" ON usage_data;

-- Users can view their own usage data
CREATE POLICY "Users can view own usage data" ON usage_data
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own usage data
CREATE POLICY "Users can insert own usage data" ON usage_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add unique constraint for upsert operations
ALTER TABLE usage_data ADD CONSTRAINT usage_data_user_date_model_unique 
  UNIQUE (user_id, date, model);

-- Create indexes for performance
DROP INDEX IF EXISTS usage_data_user_date_idx;
DROP INDEX IF EXISTS usage_data_user_model_idx;

CREATE INDEX usage_data_user_date_idx ON usage_data(user_id, date);
CREATE INDEX usage_data_user_model_idx ON usage_data(user_id, model);

-- Create carbon_credits table
CREATE TABLE IF NOT EXISTS carbon_credits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_type text not null,
  amount_retired decimal(10,2) not null,
  cost decimal(10,2) not null,
  retirement_date date not null,
  certificate_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE carbon_credits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own carbon credits" ON carbon_credits;
DROP POLICY IF EXISTS "Users can insert own carbon credits" ON carbon_credits;

-- Users can view their own carbon credits
CREATE POLICY "Users can view own carbon credits" ON carbon_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own carbon credits
CREATE POLICY "Users can insert own carbon credits" ON carbon_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for performance
DROP INDEX IF EXISTS carbon_credits_user_date_idx;
CREATE INDEX carbon_credits_user_date_idx ON carbon_credits(user_id, retirement_date);

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
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
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