-- Create usage_data table for storing OpenAI API usage metrics
CREATE TABLE IF NOT EXISTS usage_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  model TEXT NOT NULL,
  endpoint TEXT DEFAULT 'unknown',
  batch TEXT,
  requests INTEGER NOT NULL DEFAULT 0,
  context_tokens BIGINT NOT NULL DEFAULT 0,
  generated_tokens BIGINT NOT NULL DEFAULT 0,
  input_tokens BIGINT, -- Alternative column name for context_tokens
  output_tokens BIGINT, -- Alternative column name for generated_tokens
  cost NUMERIC(10, 6) NOT NULL DEFAULT 0,
  actual_cost_usd NUMERIC(10, 6),
  cost_breakdown JSONB,
  cost_source TEXT CHECK (cost_source IN ('calculated', 'api')),
  co2_grams NUMERIC(10, 3) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT usage_data_user_date_model_endpoint_unique UNIQUE (user_id, date, model, endpoint)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_usage_data_user_date ON usage_data(user_id, date);
CREATE INDEX IF NOT EXISTS idx_usage_data_date_desc ON usage_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_usage_data_model ON usage_data(model);
CREATE INDEX IF NOT EXISTS idx_usage_data_created_at ON usage_data(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE usage_data ENABLE ROW LEVEL SECURITY;

-- Create policies for usage_data
CREATE POLICY "Users can view own usage data" ON usage_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage data" ON usage_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage data" ON usage_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own usage data" ON usage_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_usage_data_updated_at BEFORE UPDATE ON usage_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE usage_data IS 'Stores OpenAI API usage metrics and costs per user, model, and date';
COMMENT ON COLUMN usage_data.cost IS 'Calculated or actual cost in USD';
COMMENT ON COLUMN usage_data.actual_cost_usd IS 'Actual cost from OpenAI Costs API when available';
COMMENT ON COLUMN usage_data.cost_breakdown IS 'Detailed cost breakdown from OpenAI Costs API';
COMMENT ON COLUMN usage_data.cost_source IS 'Whether cost is calculated or from API';
COMMENT ON COLUMN usage_data.co2_grams IS 'Estimated CO2 emissions in grams for this usage';