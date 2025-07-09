-- Check what usage data is actually in the database

-- 1. Count total records per user
SELECT 'Total usage records per user:' as status;
SELECT 
  user_id,
  COUNT(*) as record_count,
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  COUNT(DISTINCT date) as unique_days
FROM usage_data
GROUP BY user_id
ORDER BY record_count DESC;

-- 2. Check date distribution for your user
SELECT 'Date distribution for user af18ad4b-4e53-4d20-9b59-1ed85b186ff8:' as status;
SELECT 
  date,
  COUNT(*) as records_per_day,
  COUNT(DISTINCT model) as models_used,
  SUM(requests) as total_requests
FROM usage_data
WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8'
GROUP BY date
ORDER BY date DESC;

-- 3. Check user_settings historical data flag
SELECT 'User settings check:' as status;
SELECT 
  user_id,
  metadata,
  created_at,
  updated_at
FROM user_settings
WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';

-- 4. Check if there's a date range limitation somewhere
SELECT 'Checking for any date-based constraints:' as status;
SELECT 
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  CURRENT_DATE - MIN(date)::date as days_of_data
FROM usage_data
WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';

-- 5. Reset the historical data flag to allow re-fetching
-- Uncomment this to force re-fetch of historical data:
/*
UPDATE user_settings 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'), 
  '{hasHistoricalData}', 
  'false'
)
WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';
*/

-- 6. Or delete the user_settings row entirely to reset:
/*
DELETE FROM user_settings 
WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';
*/