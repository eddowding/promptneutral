-- Migration to support individual AI service subscriptions
-- Adds necessary columns to carbon_offset_orders table

-- Add subscription_type to distinguish individual vs business orders
ALTER TABLE carbon_offset_orders
ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'business';

-- Add subscription_details as JSONB to store the selected services and tiers
ALTER TABLE carbon_offset_orders
ADD COLUMN IF NOT EXISTS subscription_details JSONB;

-- Add billing_period to track yearly vs monthly billing
ALTER TABLE carbon_offset_orders
ADD COLUMN IF NOT EXISTS billing_period TEXT DEFAULT 'monthly';

-- Ensure is_monthly column exists (from previous migration)
ALTER TABLE carbon_offset_orders
ADD COLUMN IF NOT EXISTS is_monthly BOOLEAN DEFAULT false;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_carbon_offset_orders_subscription_type 
ON carbon_offset_orders(subscription_type);

CREATE INDEX IF NOT EXISTS idx_carbon_offset_orders_billing_period
ON carbon_offset_orders(billing_period);

-- Add comments to document the columns
COMMENT ON COLUMN carbon_offset_orders.subscription_type IS 
'Type of subscription: "individual" for personal AI users, "business" for API usage tracking';

COMMENT ON COLUMN carbon_offset_orders.subscription_details IS 
'For individual subscriptions: JSON array of selected services
Example: [{
  "serviceId": "openai",
  "tierId": "plus", 
  "yearlyPrice": 25,
  "hasVideoAddon": true
}]';

COMMENT ON COLUMN carbon_offset_orders.billing_period IS 
'Billing frequency: "yearly" for annual subscriptions, "monthly" for monthly';

-- Example queries for individual subscriptions:
-- Find all individual subscriptions:
-- SELECT * FROM carbon_offset_orders WHERE subscription_type = 'individual';

-- Find users with OpenAI Plus:
-- SELECT * FROM carbon_offset_orders 
-- WHERE subscription_type = 'individual' 
-- AND subscription_details @> '[{"serviceId": "openai", "tierId": "plus"}]';

-- Calculate total revenue from individual subscriptions:
-- SELECT SUM(total_cost) as yearly_revenue
-- FROM carbon_offset_orders 
-- WHERE subscription_type = 'individual' 
-- AND billing_period = 'yearly';