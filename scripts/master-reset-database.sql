-- MASTER DATABASE RESET SCRIPT
-- This will drop and recreate all tables with proper structure

-- WARNING: This will DELETE ALL DATA in these tables!
-- Make sure to backup any important data first

-- 1. Drop all existing tables
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS data_fetch_status CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS usage_data CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS onboarding_progress CASCADE;
DROP TABLE IF EXISTS selected_projects CASCADE;
DROP TABLE IF EXISTS carbon_credits CASCADE;

-- 2. Create api_keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  validated BOOLEAN DEFAULT false,
  last_validated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create usage_data table
CREATE TABLE usage_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  endpoint TEXT,
  model TEXT NOT NULL,
  requests INTEGER DEFAULT 0,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  input_cached_tokens INTEGER DEFAULT 0,
  input_audio_tokens INTEGER DEFAULT 0,
  output_audio_tokens INTEGER DEFAULT 0,
  context_tokens INTEGER DEFAULT 0,
  generated_tokens INTEGER DEFAULT 0,
  project_id TEXT,
  api_key_id TEXT,
  batch TEXT,
  cost DECIMAL(10, 6) DEFAULT 0,
  co2_grams DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create user_settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. Create feedback table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'resolved')),
  url TEXT NOT NULL,
  follow_up BOOLEAN DEFAULT FALSE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 7. Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 8. Create data_fetch_status table
CREATE TABLE data_fetch_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_fetched TIMESTAMPTZ,
  last_successful_date TEXT,
  endpoints_fetched TEXT[] DEFAULT '{}',
  total_records INTEGER DEFAULT 0,
  status TEXT DEFAULT 'idle',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 9. Create onboarding_progress table
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  completed_steps TEXT[] DEFAULT '{}',
  onboarding_data JSONB DEFAULT '{}',
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 10. Create selected_projects table
CREATE TABLE selected_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_type TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Create carbon_credits table
CREATE TABLE carbon_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_type TEXT NOT NULL,
  amount_retired DECIMAL(10, 6) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  retirement_date TEXT NOT NULL,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Add indexes for performance
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_usage_data_user_id ON usage_data(user_id);
CREATE INDEX idx_usage_data_date ON usage_data(date);
CREATE INDEX idx_usage_data_user_date ON usage_data(user_id, date);
CREATE INDEX idx_usage_data_date_desc ON usage_data(date DESC);
CREATE INDEX idx_usage_data_model ON usage_data(model);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_data_fetch_status_user_id ON data_fetch_status(user_id);
CREATE INDEX idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX idx_selected_projects_user_id ON selected_projects(user_id);
CREATE INDEX idx_selected_projects_is_active ON selected_projects(is_active);
CREATE INDEX idx_carbon_credits_user_id ON carbon_credits(user_id);
CREATE INDEX idx_carbon_credits_retirement_date ON carbon_credits(retirement_date);

-- 13. Add unique constraint to usage_data
ALTER TABLE usage_data
ADD CONSTRAINT usage_data_user_date_model_endpoint_unique 
UNIQUE (user_id, date, model, endpoint);

-- 14. Enable RLS on all tables
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_fetch_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_credits ENABLE ROW LEVEL SECURITY;

-- 15. Create RLS policies for api_keys
CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- 16. Create RLS policies for usage_data
CREATE POLICY "Users can view their own usage data"
  ON usage_data FOR SELECT
  USING (
    auth.uid() = user_id 
    OR user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

CREATE POLICY "Users can insert their own usage data"
  ON usage_data FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

CREATE POLICY "Users can update their own usage data"
  ON usage_data FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
  );

-- 17. Create RLS policies for user_settings
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

-- 18. Create RLS policies for feedback
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- 19. Create RLS policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- 20. Create RLS policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- 21. Create RLS policies for data_fetch_status
CREATE POLICY "Users can view own status"
  ON data_fetch_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own status"
  ON data_fetch_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own status"
  ON data_fetch_status FOR UPDATE
  USING (auth.uid() = user_id);

-- 19. Create RLS policies for onboarding_progress
CREATE POLICY "Users can view own onboarding progress"
  ON onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress"
  ON onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress"
  ON onboarding_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- 20. Create RLS policies for selected_projects
CREATE POLICY "Users can view own selected projects"
  ON selected_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own selected projects"
  ON selected_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own selected projects"
  ON selected_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own selected projects"
  ON selected_projects FOR DELETE
  USING (auth.uid() = user_id);

-- 21. Create RLS policies for carbon_credits
CREATE POLICY "Users can view own carbon credits"
  ON carbon_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own carbon credits"
  ON carbon_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 22. Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 23. Create triggers for updated_at
CREATE TRIGGER update_api_keys_updated_at 
  BEFORE UPDATE ON api_keys 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_data_updated_at 
  BEFORE UPDATE ON usage_data 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at 
  BEFORE UPDATE ON feedback 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_fetch_status_updated_at 
  BEFORE UPDATE ON data_fetch_status 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_progress_updated_at 
  BEFORE UPDATE ON onboarding_progress 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_selected_projects_updated_at 
  BEFORE UPDATE ON selected_projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 24. Grant permissions to authenticated users
GRANT ALL ON api_keys TO authenticated;
GRANT ALL ON usage_data TO authenticated;
GRANT ALL ON user_settings TO authenticated;
GRANT ALL ON feedback TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_preferences TO authenticated;
GRANT ALL ON data_fetch_status TO authenticated;
GRANT ALL ON onboarding_progress TO authenticated;
GRANT ALL ON selected_projects TO authenticated;
GRANT ALL ON carbon_credits TO authenticated;

-- 25. Insert demo data for testing (optional)
-- Uncomment if you want to add the demo user's data
/*
INSERT INTO user_settings (user_id, metadata)
VALUES ('123e4567-e89b-12d3-a456-426614174000', '{"hasHistoricalData": false}')
ON CONFLICT (user_id) DO NOTHING;
*/

-- 26. Verify everything was created
SELECT 'Tables created:' as status;
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('api_keys', 'usage_data', 'user_settings', 'feedback', 'profiles', 'user_preferences', 'data_fetch_status', 'onboarding_progress', 'selected_projects', 'carbon_credits')
ORDER BY table_name;

-- 27. Show RLS policies
SELECT 'RLS Policies:' as status;
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;