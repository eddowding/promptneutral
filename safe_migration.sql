-- Safe migration script that handles existing objects
-- This script will only create missing tables and policies

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

-- Add missing columns to usage_data if they don't exist
DO $$ 
BEGIN
  -- Add endpoint column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usage_data' AND column_name='endpoint') THEN
    ALTER TABLE usage_data ADD COLUMN endpoint TEXT DEFAULT 'completions';
  END IF;
  
  -- Add input_tokens column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usage_data' AND column_name='input_tokens') THEN
    ALTER TABLE usage_data ADD COLUMN input_tokens INTEGER DEFAULT 0;
  END IF;
  
  -- Add output_tokens column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usage_data' AND column_name='output_tokens') THEN
    ALTER TABLE usage_data ADD COLUMN output_tokens INTEGER DEFAULT 0;
  END IF;
  
  -- Add input_cached_tokens column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usage_data' AND column_name='input_cached_tokens') THEN
    ALTER TABLE usage_data ADD COLUMN input_cached_tokens INTEGER DEFAULT 0;
  END IF;
  
  -- Add input_audio_tokens column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usage_data' AND column_name='input_audio_tokens') THEN
    ALTER TABLE usage_data ADD COLUMN input_audio_tokens INTEGER DEFAULT 0;
  END IF;
  
  -- Add output_audio_tokens column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usage_data' AND column_name='output_audio_tokens') THEN
    ALTER TABLE usage_data ADD COLUMN output_audio_tokens INTEGER DEFAULT 0;
  END IF;
  
  -- Add project_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usage_data' AND column_name='project_id') THEN
    ALTER TABLE usage_data ADD COLUMN project_id TEXT;
  END IF;
  
  -- Add api_key_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usage_data' AND column_name='api_key_id') THEN
    ALTER TABLE usage_data ADD COLUMN api_key_id TEXT;
  END IF;
  
  -- Add batch column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usage_data' AND column_name='batch') THEN
    ALTER TABLE usage_data ADD COLUMN batch TEXT;
  END IF;
END $$;

-- Migrate existing data if needed
UPDATE usage_data 
SET 
  input_tokens = COALESCE(context_tokens, 0),
  output_tokens = COALESCE(generated_tokens, 0)
WHERE input_tokens = 0 AND output_tokens = 0 AND (context_tokens > 0 OR generated_tokens > 0);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_fetch_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only if they don't exist)
DO $$ 
BEGIN
  -- Profiles policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can manage their own profile') THEN
    EXECUTE 'CREATE POLICY "Users can manage their own profile" ON profiles FOR ALL USING (auth.uid() = id)';
  END IF;
  
  -- User preferences policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can manage their own preferences') THEN
    EXECUTE 'CREATE POLICY "Users can manage their own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id)';
  END IF;
  
  -- API keys policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can manage their own API keys') THEN
    EXECUTE 'CREATE POLICY "Users can manage their own API keys" ON api_keys FOR ALL USING (auth.uid() = user_id)';
  END IF;
  
  -- Onboarding progress policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'onboarding_progress' AND policyname = 'Users can manage their own onboarding progress') THEN
    EXECUTE 'CREATE POLICY "Users can manage their own onboarding progress" ON onboarding_progress FOR ALL USING (auth.uid() = user_id)';
  END IF;
  
  -- Selected projects policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'selected_projects' AND policyname = 'Users can manage their own projects') THEN
    EXECUTE 'CREATE POLICY "Users can manage their own projects" ON selected_projects FOR ALL USING (auth.uid() = user_id)';
  END IF;
  
  -- Usage data policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usage_data' AND policyname = 'Users can manage their own usage data') THEN
    EXECUTE 'CREATE POLICY "Users can manage their own usage data" ON usage_data FOR ALL USING (auth.uid() = user_id)';
  END IF;
  
  -- Carbon credits policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'carbon_credits' AND policyname = 'Users can manage their own carbon credits') THEN
    EXECUTE 'CREATE POLICY "Users can manage their own carbon credits" ON carbon_credits FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
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

-- Update unique constraint for usage_data
ALTER TABLE usage_data DROP CONSTRAINT IF EXISTS usage_data_user_date_model_unique;
ALTER TABLE usage_data DROP CONSTRAINT IF EXISTS usage_data_user_date_model_endpoint_unique;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usage_data_user_date_model_endpoint_unique') THEN
    ALTER TABLE usage_data ADD CONSTRAINT usage_data_user_date_model_endpoint_unique UNIQUE (user_id, date, model, endpoint);
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop and recreate to avoid conflicts)
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