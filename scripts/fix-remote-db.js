#!/usr/bin/env node

/**
 * Script to fix the remote database by adding the missing unique constraint
 * This enables ON CONFLICT to work properly for upsert operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qzrdtwvgnlmlrpqrvyel.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cmR0d3ZnbmxtbHJwcXJ2eWVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ0MzkzNiwiZXhwIjoyMDY3MDE5OTM2fQ.u0SCqWSi52ArlyCoTANyGU_QM-3t7bRBazW3S73hlkM';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixDatabase() {
  console.log('🔧 Fixing remote database schema...');
  
  try {
    // First, check if the constraint already exists
    const { data: constraints } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name')
      .eq('table_name', 'usage_data')
      .eq('constraint_name', 'usage_data_user_date_model_unique');
    
    if (constraints && constraints.length > 0) {
      console.log('✅ Unique constraint already exists!');
      return;
    }
    
    // Add the unique constraint using raw SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE usage_data ADD CONSTRAINT usage_data_user_date_model_unique UNIQUE (user_id, date, model);'
    });
    
    if (error) {
      console.error('❌ Error adding constraint:', error);
      
      // Try alternative approach - create a function to execute the SQL
      console.log('📝 Trying alternative approach...');
      
      // First create a function that can execute DDL
      const createFunctionSql = `
        CREATE OR REPLACE FUNCTION add_usage_data_constraint()
        RETURNS void AS $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'usage_data' 
            AND constraint_name = 'usage_data_user_date_model_unique'
          ) THEN
            ALTER TABLE usage_data ADD CONSTRAINT usage_data_user_date_model_unique UNIQUE (user_id, date, model);
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const { error: funcError } = await supabase.rpc('exec_sql', {
        sql: createFunctionSql
      });
      
      if (funcError) {
        console.error('❌ Could not create function:', funcError);
        process.exit(1);
      }
      
      // Now call the function
      const { error: callError } = await supabase.rpc('add_usage_data_constraint');
      
      if (callError) {
        console.error('❌ Could not add constraint:', callError);
        process.exit(1);
      }
    }
    
    console.log('✅ Successfully added unique constraint to usage_data table!');
    console.log('🎉 Remote database is now fixed and ready for upsert operations.');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

// Run the fix
fixDatabase();