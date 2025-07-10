import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const supabaseUrl = 'https://qzrdtwvgnlmlrpqrvyel.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cmR0d3ZnbmxtbHJwcXJ2eWVsIiwicm9sZSI6InNlcnZpY2Ufcm9sZSIsImlhdCI6MTc1MTQ0MzkzNiwiZXhwIjoyMDY3MDE5OTM2fQ.u0SCqWSi52ArlyCoTANyGU_QM-3t7bRBazW3S73hlkM';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running hero columns migration...');
    
    // Read the migration SQL file
    const migrationSQL = readFileSync(join(__dirname, 'add-hero-columns-migration.sql'), 'utf8');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      // If exec_sql doesn't exist, we'll need to run the SQL commands individually
      console.log('Running migration commands individually...');
      
      const commands = migrationSQL
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0);
      
      for (const command of commands) {
        console.log(`Executing: ${command.substring(0, 50)}...`);
        
        // Since we can't execute raw SQL directly, we'll need to check table structure
        // and inform the user to run this in Supabase dashboard
        console.error('\nUnable to execute raw SQL through Supabase client.');
        console.log('\nPlease run the following SQL in your Supabase dashboard:');
        console.log('\n1. Go to https://supabase.com/dashboard/project/qzrdtwvgnlmlrpqrvyel/sql/new');
        console.log('2. Copy and paste the contents of scripts/add-hero-columns-migration.sql');
        console.log('3. Click "Run" to execute the migration\n');
        return;
      }
    } else {
      console.log('Migration completed successfully!');
    }
  } catch (err) {
    console.error('Migration error:', err);
  }
}

// Run the migration
runMigration();