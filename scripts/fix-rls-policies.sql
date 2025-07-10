-- Fix RLS policies for carbon_offset_orders table
-- This allows anonymous users to insert orders

-- Enable RLS if not already enabled
ALTER TABLE carbon_offset_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous inserts" ON carbon_offset_orders;
DROP POLICY IF EXISTS "Allow users to view their own orders" ON carbon_offset_orders;
DROP POLICY IF EXISTS "Allow anonymous reads" ON carbon_offset_orders;

-- Create policy to allow anonymous users to insert orders
CREATE POLICY "Allow anonymous inserts" ON carbon_offset_orders
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Create policy to allow anyone to read orders (for demo purposes)
-- In production, you might want to restrict this
CREATE POLICY "Allow anonymous reads" ON carbon_offset_orders
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Create policy for authenticated users to view and manage their own orders
CREATE POLICY "Users can manage their own orders" ON carbon_offset_orders
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add comment explaining the policies
COMMENT ON TABLE carbon_offset_orders IS 'Carbon offset orders with RLS policies allowing anonymous purchases';