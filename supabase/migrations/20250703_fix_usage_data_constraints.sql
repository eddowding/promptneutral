-- Drop existing constraint if it exists
ALTER TABLE usage_data 
DROP CONSTRAINT IF EXISTS usage_data_user_date_model_endpoint_unique;

-- Drop old constraint if it exists (from previous migration attempts)
ALTER TABLE usage_data 
DROP CONSTRAINT IF EXISTS usage_data_user_date_model_unique;

-- Add the unique constraint
ALTER TABLE usage_data
ADD CONSTRAINT usage_data_user_date_model_endpoint_unique 
UNIQUE (user_id, date, model, endpoint);

-- Add endpoint column if it doesn't exist
ALTER TABLE usage_data 
ADD COLUMN IF NOT EXISTS endpoint TEXT;

-- Add batch column if it doesn't exist  
ALTER TABLE usage_data 
ADD COLUMN IF NOT EXISTS batch TEXT;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_usage_data_user_date ON usage_data(user_id, date);
CREATE INDEX IF NOT EXISTS idx_usage_data_date_desc ON usage_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_usage_data_model ON usage_data(model);

-- Update any NULL endpoints to 'unknown' to maintain data integrity
UPDATE usage_data SET endpoint = 'unknown' WHERE endpoint IS NULL;