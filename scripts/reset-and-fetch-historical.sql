-- Reset historical data flag to allow fetching more data

-- 1. First, check current settings
SELECT 'Current user settings:' as status;
SELECT * FROM user_settings WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';

-- 2. Reset the historical data flag
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

-- 3. Verify the change
SELECT 'Updated user settings:' as status;
SELECT * FROM user_settings WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';

-- 4. Also check data_fetch_status if it exists
SELECT 'Data fetch status:' as status;
SELECT * FROM data_fetch_status WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';

-- 5. Optional: Clear data_fetch_status to force complete re-fetch
-- DELETE FROM data_fetch_status WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';