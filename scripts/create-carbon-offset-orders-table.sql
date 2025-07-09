-- Create carbon_offset_orders table to track user carbon offset purchases
-- This table stores order details when users attempt to purchase carbon offsets

CREATE TABLE IF NOT EXISTS carbon_offset_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  tonnes_offset DECIMAL(10, 2) NOT NULL,
  price_per_tonne DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  ai_carbon_footprint DECIMAL(10, 4), -- The calculated AI carbon footprint
  status TEXT DEFAULT 'pending', -- pending, completed, cancelled
  payment_id TEXT, -- For future payment integration
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_carbon_offset_orders_email ON carbon_offset_orders(email);
CREATE INDEX idx_carbon_offset_orders_user_id ON carbon_offset_orders(user_id);
CREATE INDEX idx_carbon_offset_orders_created_at ON carbon_offset_orders(created_at);
CREATE INDEX idx_carbon_offset_orders_status ON carbon_offset_orders(status);

-- Enable RLS
ALTER TABLE carbon_offset_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can see their own orders (if logged in)
CREATE POLICY "Users can view own orders" ON carbon_offset_orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow anonymous inserts (for users who haven't signed up yet)
CREATE POLICY "Anyone can create orders" ON carbon_offset_orders
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own orders
CREATE POLICY "Users can update own orders" ON carbon_offset_orders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_carbon_offset_orders_updated_at
  BEFORE UPDATE ON carbon_offset_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON carbon_offset_orders TO authenticated;
GRANT INSERT ON carbon_offset_orders TO anon;
GRANT SELECT ON carbon_offset_orders TO anon;