// Simple script to check if migration is needed and provide instructions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabasePublishableKey) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabasePublishableKey);

async function checkMigrationStatus() {
  console.log('Checking if hero columns migration is needed...\n');
  
  try {
    // Try to query with the new columns
    const { data, error } = await supabase
      .from('carbon_offset_orders')
      .select('id, hero_amount, is_hero, standard_cost')
      .limit(1);
    
    if (error) {
      if (error.message.includes('column') && (
        error.message.includes('hero_amount') || 
        error.message.includes('is_hero') || 
        error.message.includes('standard_cost')
      )) {
        console.log('❌ Migration needed: Hero columns are missing from the database.\n');
        console.log('Please run the migration by following these steps:\n');
        console.log('1. Go to: https://supabase.com/dashboard/project/qzrdtwvgnlmlrpqrvyel/sql/new');
        console.log('2. Copy the SQL from: scripts/add-hero-columns-migration.sql');
        console.log('3. Paste it in the SQL editor and click "Run"\n');
        console.log('The migration SQL file is located at:');
        console.log('  scripts/add-hero-columns-migration.sql\n');
      } else {
        console.error('Error checking migration status:', error);
      }
    } else {
      console.log('✅ Migration already applied: Hero columns exist in the database.\n');
      console.log('The hero mode feature is ready to use!');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkMigrationStatus();