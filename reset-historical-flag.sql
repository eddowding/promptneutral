-- Reset historical data flag
UPDATE user_settings 
SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{hasHistoricalData}', 'false')
WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';

-- Insert if doesn't exist
INSERT INTO user_settings (user_id, metadata)
SELECT 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8', '{"hasHistoricalData": false}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM user_settings WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8'
);

-- Show result
SELECT user_id, metadata FROM user_settings WHERE user_id = 'af18ad4b-4e53-4d20-9b59-1ed85b186ff8';