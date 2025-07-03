-- Simple fix: Temporarily disable foreign key constraint for demo user
-- and update RLS policies to allow demo user operations

-- Option 1: Remove foreign key constraint temporarily (not recommended for production)
-- ALTER TABLE api_keys DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey;

-- Option 2: Create a more flexible RLS policy structure
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete own api keys" ON api_keys;

-- Create new policies that handle both authenticated and demo users
CREATE POLICY "Users can manage api keys" ON api_keys
  FOR ALL 
  USING (
    auth.uid() = user_id OR 
    user_id = '123e4567-e89b-12d3-a456-426614174000'
  );

-- Same for user_preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

CREATE POLICY "Users can manage preferences" ON user_preferences
  FOR ALL 
  USING (
    auth.uid() = user_id OR 
    user_id = '123e4567-e89b-12d3-a456-426614174000'
  );

-- Same for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can manage profile" ON profiles
  FOR ALL 
  USING (
    auth.uid() = id OR 
    id = '123e4567-e89b-12d3-a456-426614174000'
  );