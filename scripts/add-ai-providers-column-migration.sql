-- Migration to add ai_providers column to carbon_offset_orders table
-- This column tracks the breakdown of AI provider spending that contributed to the carbon footprint

-- Add ai_providers column - JSONB to store provider spending breakdown
ALTER TABLE carbon_offset_orders 
ADD COLUMN IF NOT EXISTS ai_providers JSONB;

-- Add a comment to document the column
COMMENT ON COLUMN carbon_offset_orders.ai_providers IS 'JSON object containing AI provider spending breakdown {openai: 100, anthropic: 50, google: 30, other: 20}';

-- Create a GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_carbon_offset_orders_ai_providers 
ON carbon_offset_orders USING GIN (ai_providers);