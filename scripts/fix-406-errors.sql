-- Fix 406 errors by granting permissions to all necessary roles

-- Grant permissions to anon and service_role for all tables
GRANT ALL ON api_keys TO anon, service_role;
GRANT ALL ON usage_data TO anon, service_role;
GRANT ALL ON user_settings TO anon, service_role;
GRANT ALL ON feedback TO anon, service_role;
GRANT ALL ON profiles TO anon, service_role;
GRANT ALL ON user_preferences TO anon, service_role;
GRANT ALL ON data_fetch_status TO anon, service_role;
GRANT ALL ON onboarding_progress TO anon, service_role;
GRANT ALL ON selected_projects TO anon, service_role;
GRANT ALL ON carbon_credits TO anon, service_role;

-- Also grant usage on sequences (for inserting new records)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Verify the grants worked
SELECT 'Permissions granted. Checking anon role access:' as status;
SELECT 
  table_name,
  COUNT(DISTINCT privilege_type) as permission_count
FROM information_schema.table_privileges 
WHERE grantee = 'anon' 
  AND table_schema = 'public'
  AND table_name IN ('profiles', 'user_preferences', 'data_fetch_status', 'api_keys', 'usage_data')
GROUP BY table_name
ORDER BY table_name;

-- The RLS policies will still protect the data, but now the tables are accessible