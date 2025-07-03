-- This migration cleans up the migration history to match local files
-- It runs first (20250101) to ensure the database is in a clean state

-- Remove migrations that no longer exist locally
DELETE FROM supabase_migrations.schema_migrations 
WHERE version IN ('20250103', '20250702222814')
  AND NOT EXISTS (
    SELECT 1 FROM supabase_migrations.schema_migrations 
    WHERE version = '20250101'
  );

-- Note: The actual table changes from those deleted migrations 
-- are handled by the subsequent migrations using IF EXISTS clauses