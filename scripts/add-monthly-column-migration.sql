-- Migration to add is_monthly column to carbon_offset_orders table
-- This column tracks whether the user wants to make monthly recurring payments

-- Add is_monthly column - boolean flag for monthly subscriptions
ALTER TABLE carbon_offset_orders 
ADD COLUMN IF NOT EXISTS is_monthly BOOLEAN DEFAULT false;

-- Add a comment to document the column
COMMENT ON COLUMN carbon_offset_orders.is_monthly IS 'True when user chooses to make this a monthly recurring contribution';

-- Create an index on is_monthly for efficient querying of subscriptions
CREATE INDEX IF NOT EXISTS idx_carbon_offset_orders_is_monthly 
ON carbon_offset_orders(is_monthly) 
WHERE is_monthly = true;