-- Remove the migrations from history that don't exist locally
DELETE FROM supabase_migrations.schema_migrations 
WHERE version IN ('20250103', '20250702222814');

-- Insert our new migrations
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES 
  ('20250103002', '20250103_002_fix_existing_tables', ARRAY[
    'CREATE TABLE IF NOT EXISTS feedback (...)',
    'CREATE TABLE IF NOT EXISTS user_settings (...)'
  ]),
  ('20250703', '20250703_fix_usage_data_constraints', ARRAY[
    'ALTER TABLE usage_data DROP CONSTRAINT IF EXISTS ...',
    'ALTER TABLE usage_data ADD CONSTRAINT ...'
  ])
ON CONFLICT (version) DO NOTHING;