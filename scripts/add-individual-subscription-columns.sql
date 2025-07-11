-- Add columns to support individual subscription plans
-- This migration adds fields needed to store individual AI service subscription details

-- Add subscription_type to distinguish individual vs business orders
ALTER TABLE carbon_offset_orders
ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'business';

-- Add subscription_details as JSONB to store the selected services and tiers
ALTER TABLE carbon_offset_orders
ADD COLUMN IF NOT EXISTS subscription_details JSONB;

-- Add billing_period to track yearly vs monthly billing
ALTER TABLE carbon_offset_orders
ADD COLUMN IF NOT EXISTS billing_period TEXT DEFAULT 'monthly';

-- Add index on subscription_type for filtering
CREATE INDEX IF NOT EXISTS idx_carbon_offset_orders_subscription_type 
ON carbon_offset_orders(subscription_type);

-- Add comment to explain the subscription_details structure
COMMENT ON COLUMN carbon_offset_orders.subscription_details IS 
'Stores individual subscription selections as JSON array: 
[{
  "serviceId": "openai",
  "tierId": "plus", 
  "yearlyPrice": 25,
  "hasVideoAddon": true
}]';

-- Example query to find all individual subscriptions
-- SELECT * FROM carbon_offset_orders WHERE subscription_type = 'individual';

-- Example query to find users subscribed to OpenAI Plus
-- SELECT * FROM carbon_offset_orders 
-- WHERE subscription_type = 'individual' 
-- AND subscription_details @> '[{"serviceId": "openai", "tierId": "plus"}]';