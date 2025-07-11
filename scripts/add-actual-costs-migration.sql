-- Migration to add actual cost fields to usage_data table
-- Adds support for storing real costs from OpenAI Costs API

-- Add actual_cost_usd field to store API-provided costs in USD
ALTER TABLE usage_data 
ADD COLUMN actual_cost_usd DECIMAL(10, 6) DEFAULT NULL;

-- Add cost_breakdown field for detailed cost information from API
ALTER TABLE usage_data 
ADD COLUMN cost_breakdown JSONB DEFAULT NULL;

-- Add flag to indicate if cost data came from API vs calculation
ALTER TABLE usage_data 
ADD COLUMN cost_source VARCHAR(20) DEFAULT 'calculated' CHECK (cost_source IN ('calculated', 'api'));

-- Add index on cost_source for efficient querying
CREATE INDEX idx_usage_data_cost_source ON usage_data(cost_source);

-- Add index on actual_cost_usd for cost reporting queries
CREATE INDEX idx_usage_data_actual_cost_usd ON usage_data(actual_cost_usd) WHERE actual_cost_usd IS NOT NULL;

-- Add comment explaining the new fields
COMMENT ON COLUMN usage_data.actual_cost_usd IS 'Actual cost in USD from OpenAI Costs API';
COMMENT ON COLUMN usage_data.cost_breakdown IS 'Detailed cost breakdown from OpenAI Costs API';
COMMENT ON COLUMN usage_data.cost_source IS 'Source of cost data: calculated (from model assumptions) or api (from OpenAI Costs API)';