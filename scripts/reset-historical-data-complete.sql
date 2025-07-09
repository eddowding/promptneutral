-- Complete script to reset historical data and enable re-fetching
-- Run this in Supabase Dashboard SQL Editor

-- 1. Check current data status
SELECT 'Current usage data summary:' as status;
SELECT 
  COUNT(*) as total_records,
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  COUNT(DISTINCT date) as unique_days,
  CURRENT_DATE - MIN(date)::date as days_of_data
FROM usage_data
WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';

-- 2. Check current user settings
SELECT 'Current user settings:' as status;
SELECT * FROM user_settings WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';

-- 3. Reset the historical data flag
UPDATE user_settings 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'), 
  '{hasHistoricalData}', 
  'false'
)
WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';

-- If no row exists, insert one
INSERT INTO user_settings (user_id, metadata)
SELECT 
  'af18ad4b-4e53-4d20-9b59-1ed85b186ff8',
  '{"hasHistoricalData": false}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM user_settings 
  WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8'
);

-- 4. Clear data_fetch_status to allow complete re-fetch
DELETE FROM data_fetch_status 
WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';

-- 5. Verify the changes
SELECT 'Updated user settings:' as status;
SELECT * FROM user_settings WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';

-- 6. Optional: Delete old usage data if you want a fresh start
-- WARNING: This will delete all existing usage data for the user!
-- Uncomment only if you want to completely reset:
/*
DELETE FROM usage_data 
WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';
*/

-- 7. Final verification
SELECT 'Ready for historical data fetch. Please refresh your dashboard to trigger the fetch.' as status;