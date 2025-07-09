-- Debug script to check what's going on with 406 errors

-- 1. Check if tables exist
SELECT 'Checking tables exist:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check RLS status
SELECT 'Checking RLS status:' as status;
SELECT 
  schemaname,
  tablename,
  relrowsecurity as rls_enabled,
  relforcerowsecurity as rls_forced
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Check current user and permissions
SELECT 'Current user info:' as status;
SELECT current_user, session_user, auth.uid() as auth_uid;

-- 4. Check if authenticated role has access
SELECT 'Checking authenticated role permissions:' as status;
SELECT 
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE grantee = 'authenticated' 
  AND table_schema = 'public'
  AND table_name IN ('profiles', 'user_preferences', 'data_fetch_status')
ORDER BY table_name, privilege_type;

-- 5. Check RLS policies
SELECT 'Checking RLS policies:' as status;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'user_preferences', 'data_fetch_status')
ORDER BY tablename, policyname;

-- 6. Test direct access (as superuser, this should work)
SELECT 'Testing direct access to tables:' as status;
SELECT COUNT(*) as profiles_count FROM profiles;
SELECT COUNT(*) as user_preferences_count FROM user_preferences;
SELECT COUNT(*) as data_fetch_status_count FROM data_fetch_status;

-- 7. Check if anon role has access (for unauthenticated requests)
SELECT 'Checking anon role permissions:' as status;
SELECT 
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE grantee = 'anon' 
  AND table_schema = 'public'
  AND table_name IN ('profiles', 'user_preferences', 'data_fetch_status')
ORDER BY table_name, privilege_type;

-- 8. Check service_role permissions (used by some operations)
SELECT 'Checking service_role permissions:' as status;
SELECT 
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE grantee = 'service_role' 
  AND table_schema = 'public'
  AND table_name IN ('profiles', 'user_preferences', 'data_fetch_status')
ORDER BY table_name, privilege_type;

-- 9. Grant missing permissions if needed
-- Uncomment these if tables exist but permissions are missing:
/*
GRANT ALL ON profiles TO anon, authenticated, service_role;
GRANT ALL ON user_preferences TO anon, authenticated, service_role;
GRANT ALL ON data_fetch_status TO anon, authenticated, service_role;
GRANT ALL ON onboarding_progress TO anon, authenticated, service_role;
GRANT ALL ON selected_projects TO anon, authenticated, service_role;
*/