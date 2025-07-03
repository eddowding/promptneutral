-- Comprehensive fix for all demo user issues
-- This script ensures the demo user can work without auth.users dependency

-- 1. First, disable RLS temporarily to make changes
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE selected_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_credits DISABLE ROW LEVEL SECURITY;
ALTER TABLE data_fetch_status DISABLE ROW LEVEL SECURITY;

-- 2. Drop all foreign key constraints that reference auth.users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;
ALTER TABLE api_keys DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey;
ALTER TABLE onboarding_progress DROP CONSTRAINT IF EXISTS onboarding_progress_user_id_fkey;
ALTER TABLE selected_projects DROP CONSTRAINT IF EXISTS selected_projects_user_id_fkey;
ALTER TABLE usage_data DROP CONSTRAINT IF EXISTS usage_data_user_id_fkey;
ALTER TABLE carbon_credits DROP CONSTRAINT IF EXISTS carbon_credits_user_id_fkey;
ALTER TABLE data_fetch_status DROP CONSTRAINT IF EXISTS data_fetch_status_user_id_fkey;

-- 3. Create demo user profile and preferences
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000'::uuid,
  'demo@promptneutral.com',
  'Demo User',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

INSERT INTO user_preferences (user_id, demo_mode, data_source, created_at, updated_at)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000'::uuid,
  true,
  'demo',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  demo_mode = EXCLUDED.demo_mode,
  data_source = EXCLUDED.data_source,
  updated_at = NOW();

-- 4. Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_fetch_status ENABLE ROW LEVEL SECURITY;

-- 5. Drop all existing policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can manage their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can manage their own onboarding progress" ON onboarding_progress;
DROP POLICY IF EXISTS "Users can manage their own projects" ON selected_projects;
DROP POLICY IF EXISTS "Users can manage their own usage data" ON usage_data;
DROP POLICY IF EXISTS "Users can manage their own carbon credits" ON carbon_credits;
DROP POLICY IF EXISTS "Users can manage their own fetch status" ON data_fetch_status;

-- Also drop any permissive policies that might exist
DROP POLICY IF EXISTS "Allow profile access" ON profiles;
DROP POLICY IF EXISTS "Allow preferences access" ON user_preferences;
DROP POLICY IF EXISTS "Allow API keys access" ON api_keys;
DROP POLICY IF EXISTS "Allow onboarding progress access" ON onboarding_progress;
DROP POLICY IF EXISTS "Allow projects access" ON selected_projects;
DROP POLICY IF EXISTS "Allow usage data access" ON usage_data;
DROP POLICY IF EXISTS "Allow carbon credits access" ON carbon_credits;
DROP POLICY IF EXISTS "Allow fetch status access" ON data_fetch_status;

-- 6. Create completely permissive policies for demo mode
-- These allow all operations without auth checks
CREATE POLICY "Open access for profiles" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Open access for preferences" ON user_preferences
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Open access for API keys" ON api_keys
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Open access for onboarding" ON onboarding_progress
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Open access for projects" ON selected_projects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Open access for usage data" ON usage_data
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Open access for carbon credits" ON carbon_credits
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Open access for fetch status" ON data_fetch_status
  FOR ALL USING (true) WITH CHECK (true);

-- 7. Verify the demo user data exists
SELECT 'Demo user profile created' AS status, * FROM profiles WHERE id = '123e4567-e89b-12d3-a456-426614174000'::uuid;
SELECT 'Demo user preferences created' AS status, * FROM user_preferences WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'::uuid;