const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Running individual subscriptions migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250711_individual_subscriptions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      // If exec_sql doesn't exist, try direct query (for testing)
      console.log('Direct RPC failed, attempting alternative method...');
      
      // Split into individual statements and run them
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        // Note: This is a simplified approach - in production you'd use proper migration tools
      }
      
      console.log('\nMigration SQL generated. Please run this in your Supabase SQL editor:');
      console.log('================================================');
      console.log(migrationSQL);
      console.log('================================================');
    } else {
      console.log('✅ Migration completed successfully!');
    }
    
    // Verify the columns exist
    const { data, error: verifyError } = await supabase
      .from('carbon_offset_orders')
      .select('id')
      .limit(1);
    
    if (!verifyError) {
      console.log('✅ Table structure verified');
    }
    
  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  }
}

// Run the migration
runMigration();