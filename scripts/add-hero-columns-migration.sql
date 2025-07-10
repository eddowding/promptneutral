-- Migration to add hero_amount and is_hero columns to carbon_offset_orders table
-- These columns track when users choose to contribute more than the calculated offset cost

-- Add hero_amount column - stores the amount user chose to contribute (if higher than calculated)
ALTER TABLE carbon_offset_orders 
ADD COLUMN IF NOT EXISTS hero_amount DECIMAL(10, 2);

-- Add is_hero column - boolean flag for easy filtering of hero contributions
ALTER TABLE carbon_offset_orders 
ADD COLUMN IF NOT EXISTS is_hero BOOLEAN DEFAULT false;

-- Add standard_cost column to store the originally calculated cost for comparison
ALTER TABLE carbon_offset_orders 
ADD COLUMN IF NOT EXISTS standard_cost DECIMAL(10, 2);

-- Create an index on is_hero for efficient querying of hero contributions
CREATE INDEX IF NOT EXISTS idx_carbon_offset_orders_is_hero 
ON carbon_offset_orders(is_hero) 
WHERE is_hero = true;

-- Add a comment to document the columns
COMMENT ON COLUMN carbon_offset_orders.hero_amount IS 'The amount the user chose to contribute when it exceeds the calculated offset cost';
COMMENT ON COLUMN carbon_offset_orders.is_hero IS 'True when user chose to contribute more than the calculated offset cost';
COMMENT ON COLUMN carbon_offset_orders.standard_cost IS 'The originally calculated offset cost before user chose hero amount';