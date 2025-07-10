-- Fix RLS policies for carbon_offset_orders table
-- Simple version that allows anonymous access for the calculator demo

-- Enable RLS if not already enabled
ALTER TABLE carbon_offset_orders ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on this table
DROP POLICY IF EXISTS "Allow anonymous inserts" ON carbon_offset_orders;
DROP POLICY IF EXISTS "Allow users to view their own orders" ON carbon_offset_orders;
DROP POLICY IF EXISTS "Allow anonymous reads" ON carbon_offset_orders;
DROP POLICY IF EXISTS "Users can manage their own orders" ON carbon_offset_orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON carbon_offset_orders;
DROP POLICY IF EXISTS "Enable insert access for all users" ON carbon_offset_orders;

-- Create simple policy to allow ALL operations for anonymous users
-- This is suitable for a demo/calculator app where users don't need accounts
CREATE POLICY "Allow all operations for everyone" ON carbon_offset_orders
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Add comment explaining the policies
COMMENT ON TABLE carbon_offset_orders IS 'Carbon offset orders with open access for demo calculator';