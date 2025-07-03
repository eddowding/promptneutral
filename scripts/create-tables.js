#!/usr/bin/env node

const fs = require('fs');

async function createTables() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const dotenv = await import('dotenv');
    
    dotenv.default.config();

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = createClient(supabaseUrl, serviceKey);

    console.log('🚀 Creating missing database tables...');

    // Read and execute SQL
    const sql = fs.readFileSync('./scripts/create-missing-tables.sql', 'utf8');
    
    // Execute SQL using Supabase's SQL runner
    const { data, error } = await supabase.rpc('exec', { sql });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try alternative approach - execute each statement individually
      console.log('🔄 Trying individual statements...');
      
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase.rpc('exec', { sql: statement + ';' });
            if (stmtError) {
              console.log('❌ Failed statement:', statement.substring(0, 50) + '...');
              console.log('Error:', stmtError.message);
            } else {
              console.log('✅ Executed:', statement.substring(0, 50) + '...');
            }
          } catch (err) {
            console.log('❌ Exception on statement:', statement.substring(0, 50) + '...');
            console.log('Error:', err.message);
          }
        }
      }
    } else {
      console.log('✅ SQL executed successfully');
    }

    console.log('🔍 Verifying table creation...');
    
    // Test tables
    const tables = ['api_keys', 'user_preferences', 'onboarding_progress', 'selected_projects'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table '${table}' still not accessible:`, error.message);
        } else {
          console.log(`✅ Table '${table}' created and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' error:`, err.message);
      }
    }

  } catch (err) {
    console.error('❌ Script failed:', err.message);
    process.exit(1);
  }
}

createTables();