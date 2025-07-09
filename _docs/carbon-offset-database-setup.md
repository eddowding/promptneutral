# Carbon Offset Orders Database Setup Guide

This guide will help you set up the `carbon_offset_orders` table in your Supabase database to track user carbon offset purchase attempts.

## Prerequisites

- Supabase project already created
- Access to Supabase Dashboard
- Environment variables configured in your `.env` file:
  ```
  VITE_SUPABASE_URL=your-project-url
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

## Setup Steps

### 1. Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### 2. Create the Table

Copy and paste the following SQL into the SQL Editor:

```sql
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
```

### 3. Execute the SQL

1. Click **Run** or press `Cmd/Ctrl + Enter`
2. You should see a success message: "Success. No rows returned"

### 4. Verify the Table

1. Go to **Table Editor** in the left sidebar
2. You should see `carbon_offset_orders` in the list of tables
3. Click on it to view the table structure

### 5. Test the Integration

The table is now ready to receive data from the carbon offset checkout flow:

1. Go to your app's homepage
2. Calculate your carbon footprint
3. Select a project and go to checkout
4. Enter your email
5. Check the `carbon_offset_orders` table in Supabase - you should see the new record

## Table Structure Explained

- **id**: Unique identifier for each order
- **user_id**: References the authenticated user (nullable for anonymous users)
- **email**: Contact email for the order
- **project_id**: ID of the selected carbon offset project
- **project_name**: Name of the project for display
- **tonnes_offset**: Amount of CO2 to offset
- **price_per_tonne**: Price per tonne in euros
- **total_cost**: Total cost of the order
- **ai_carbon_footprint**: The calculated AI carbon footprint from the calculator
- **status**: Order status (pending/completed/cancelled)
- **payment_id**: For future Stripe/payment integration
- **payment_date**: When payment was processed
- **created_at/updated_at**: Timestamps

## Security Features

1. **Row Level Security (RLS)**: Ensures users can only see their own orders
2. **Anonymous Inserts**: Allows non-authenticated users to create orders
3. **Indexes**: Optimizes queries by email, user_id, date, and status

## Viewing Orders in Supabase

1. Go to **Table Editor** → `carbon_offset_orders`
2. You can filter by:
   - Email
   - Status
   - Date range
   - Project

## Exporting Data

To export order data for analysis:

1. Go to **Table Editor** → `carbon_offset_orders`
2. Click **Export** → Choose format (CSV, Excel, etc.)
3. Use filters to export specific date ranges or statuses

## Future Enhancements

When you're ready to process real payments:

1. Integrate with Stripe or another payment processor
2. Update the `payment_id` field with the transaction ID
3. Change status from 'pending' to 'completed'
4. Store the `payment_date`

## Troubleshooting

### Table Creation Fails
- Check if you have the correct permissions in Supabase
- Ensure no table with the same name exists
- Verify your SQL syntax

### Data Not Saving
- Check browser console for errors
- Verify your Supabase environment variables are correct
- Ensure Supabase client is properly initialized

### Can't See Data
- Remember that RLS policies restrict data visibility
- Anonymous users can only insert, not view orders
- Authenticated users can only see their own orders

## Support

If you need help:
1. Check Supabase logs: **Logs** → **Postgres Logs**
2. Review RLS policies: **Authentication** → **Policies**
3. Test queries in SQL Editor with and without RLS

## Next Steps

1. Monitor incoming orders in the Table Editor
2. Set up email notifications for new orders (using Supabase Edge Functions)
3. Create an admin view to see all orders
4. Plan payment integration timeline