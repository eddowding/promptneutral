-- Enhanced usage data schema for admin endpoint data
-- Drop existing unique constraint first
ALTER TABLE usage_data DROP CONSTRAINT IF EXISTS usage_data_user_date_model_unique;

-- Add new columns to usage_data table
ALTER TABLE usage_data 
ADD COLUMN IF NOT EXISTS endpoint TEXT DEFAULT 'completions',
ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS input_cached_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS input_audio_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS output_audio_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS project_id TEXT,
ADD COLUMN IF NOT EXISTS api_key_id TEXT,
ADD COLUMN IF NOT EXISTS batch TEXT;

-- Migrate existing data to new column names
UPDATE usage_data 
SET 
  input_tokens = context_tokens,
  output_tokens = generated_tokens
WHERE input_tokens = 0 AND output_tokens = 0;

-- Update the unique constraint to include endpoint
ALTER TABLE usage_data 
ADD CONSTRAINT usage_data_user_date_model_endpoint_unique 
UNIQUE (user_id, date, model, endpoint);

-- Create data_fetch_status table to track fetch progress
CREATE TABLE IF NOT EXISTS data_fetch_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_fetched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_successful_date DATE,
  endpoints_fetched TEXT[] DEFAULT '{}',
  total_records INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on data_fetch_status
ALTER TABLE data_fetch_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for data_fetch_status
CREATE POLICY "Users can manage their own fetch status" ON data_fetch_status
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usage_data_endpoint ON usage_data(endpoint);
CREATE INDEX IF NOT EXISTS idx_usage_data_date_user ON usage_data(date, user_id);
CREATE INDEX IF NOT EXISTS idx_data_fetch_status_user_id ON data_fetch_status(user_id);

-- Add admin API key support to api_keys table
-- No changes needed - existing encrypted storage works for admin keys too

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for data_fetch_status
DROP TRIGGER IF EXISTS update_data_fetch_status_updated_at ON data_fetch_status;
CREATE TRIGGER update_data_fetch_status_updated_at
  BEFORE UPDATE ON data_fetch_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();