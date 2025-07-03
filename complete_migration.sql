-- Complete migration script for Supabase SQL editor
-- This creates ALL required tables for the application

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  company TEXT,
  role TEXT,
  industry TEXT,
  team_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  demo_mode BOOLEAN DEFAULT false,
  data_source TEXT DEFAULT 'demo',
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  monthly_budget NUMERIC DEFAULT 100,
  neutrality_target TEXT DEFAULT 'immediate',
  notifications BOOLEAN DEFAULT true,
  carbon_reduction_goal NUMERIC DEFAULT 25,
  reporting_frequency TEXT DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  validated BOOLEAN DEFAULT false,
  last_validated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create onboarding_progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  completed_steps TEXT[] DEFAULT '{}',
  onboarding_data JSONB,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create selected_projects table
CREATE TABLE IF NOT EXISTS selected_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_type TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_data table (enhanced version)
CREATE TABLE IF NOT EXISTS usage_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  endpoint TEXT DEFAULT 'completions',
  model TEXT NOT NULL,
  requests INTEGER DEFAULT 0,
  context_tokens INTEGER DEFAULT 0,
  generated_tokens INTEGER DEFAULT 0,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  input_cached_tokens INTEGER DEFAULT 0,
  input_audio_tokens INTEGER DEFAULT 0,
  output_audio_tokens INTEGER DEFAULT 0,
  project_id TEXT,
  api_key_id TEXT,
  batch TEXT,
  cost NUMERIC DEFAULT 0,
  co2_grams NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carbon_credits table
CREATE TABLE IF NOT EXISTS carbon_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_type TEXT NOT NULL,
  amount_retired NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  retirement_date DATE NOT NULL,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create data_fetch_status table
CREATE TABLE IF NOT EXISTS data_fetch_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_fetched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_successful_date DATE,
  endpoints_fetched TEXT[] DEFAULT '{}',
  total_records INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add unique constraints
ALTER TABLE usage_data DROP CONSTRAINT IF EXISTS usage_data_user_date_model_unique;
ALTER TABLE usage_data DROP CONSTRAINT IF EXISTS usage_data_user_date_model_endpoint_unique;
ALTER TABLE usage_data 
ADD CONSTRAINT usage_data_user_date_model_endpoint_unique 
UNIQUE (user_id, date, model, endpoint);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_fetch_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own API keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own onboarding progress" ON onboarding_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own projects" ON selected_projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own usage data" ON usage_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own carbon credits" ON carbon_credits
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own fetch status" ON data_fetch_status
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(user_id, service);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_selected_projects_user_id ON selected_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_data_user_id ON usage_data(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_data_date ON usage_data(date);
CREATE INDEX IF NOT EXISTS idx_usage_data_endpoint ON usage_data(endpoint);
CREATE INDEX IF NOT EXISTS idx_usage_data_date_user ON usage_data(date, user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_credits_user_id ON carbon_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_data_fetch_status_user_id ON data_fetch_status(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_onboarding_progress_updated_at ON onboarding_progress;
CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_data_fetch_status_updated_at ON data_fetch_status;
CREATE TRIGGER update_data_fetch_status_updated_at
  BEFORE UPDATE ON data_fetch_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();