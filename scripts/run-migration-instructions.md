# Hero Mode Migration Instructions

The hero mode feature is fully implemented in the code, but the database needs to be updated to support storing hero contribution data.

## Option 1: Run via Supabase Dashboard (Recommended)

1. Go to your Supabase project SQL editor:
   https://supabase.com/dashboard/project/qzrdtwvgnlmlrpqrvyel/sql/new

2. Copy and paste the following SQL:

```sql
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
```

3. Click "Run" to execute the migration

## Option 2: Run via Supabase CLI

If you have the Supabase CLI configured with your project:

```bash
supabase db push --file scripts/add-hero-columns-migration.sql
```

## What This Migration Does

This migration adds three new columns to the `carbon_offset_orders` table:

1. **hero_amount**: Stores the amount the user chose to contribute when they select "Hero Mode"
2. **is_hero**: A boolean flag to easily identify hero contributions
3. **standard_cost**: Stores the originally calculated cost for comparison

The migration also adds an index on the `is_hero` column for efficient querying of hero contributions.

## Verification

After running the migration, you can verify it worked by running:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'carbon_offset_orders' 
AND column_name IN ('hero_amount', 'is_hero', 'standard_cost');
```

You should see all three columns listed.