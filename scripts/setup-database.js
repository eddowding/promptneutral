#!/usr/bin/env node

/**
 * Database Setup Script for PromptNeutral
 * 
 * This script creates the necessary tables and policies in your Supabase database
 * Note: You'll need to run the SQL schema manually in the Supabase dashboard first,
 * then this script will verify the setup and provide guidance.
 */

const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  // Import modules dynamically
  const { createClient } = await import('@supabase/supabase-js');
  const chalk = await import('chalk');
  const dotenv = await import('dotenv');
  
  // Load environment variables
  dotenv.default.config();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(chalk.default.red('\nMissing environment variables. Please ensure the following are present in your .env file:'));
    console.error('  VITE_SUPABASE_URL=<your-url>');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false
    }
  });

  console.log(chalk.default.cyan('\n🚀 Checking PromptNeutral database setup...'));

  try {
    // Check if tables exist by attempting to query them
    console.log(chalk.default.yellow('Verifying table existence...'));
    
    const tables = ['profiles', 'usage_data', 'carbon_credits', 'api_keys', 'user_preferences', 'onboarding_progress', 'selected_projects'];
    const missingTables = [];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          missingTables.push(table);
          console.log(chalk.default.red(`❌ Table '${table}' not found or not accessible`));
        } else {
          console.log(chalk.default.green(`✅ Table '${table}' exists and is accessible`));
        }
      } catch (err) {
        missingTables.push(table);
        console.log(chalk.default.red(`❌ Table '${table}' error:`, err.message));
      }
    }

    if (missingTables.length > 0) {
      console.log(chalk.default.yellow('\n📋 Missing tables detected. Please run the following SQL in your Supabase dashboard:'));
      console.log(chalk.default.cyan('Go to: https://supabase.com/dashboard/project/qzrdtwvgnlmlrpqrvyel/sql'));
      console.log(chalk.default.yellow('\nThen copy and paste the SQL from: supabase/seed.sql\n'));
      
      // Show the SQL content
      const sqlPath = path.join(__dirname, '../supabase/seed.sql');
      if (fs.existsSync(sqlPath)) {
        const schemaSql = fs.readFileSync(sqlPath, 'utf8');
        console.log(chalk.default.gray('SQL Schema to execute:'));
        console.log(chalk.default.gray('─'.repeat(60)));
        console.log(schemaSql.substring(0, 500) + '\n... (see full content in supabase/seed.sql)');
        console.log(chalk.default.gray('─'.repeat(60)));
      }
      
      console.log(chalk.default.yellow('\nAfter running the SQL, run this script again to verify the setup.'));
      return;
    }

    console.log(chalk.default.green('\n🎉 Database schema is properly set up!'));
    console.log(chalk.default.cyan('You can now populate it with seed data:'));
    console.log(chalk.default.white('npm run seed:supabase'));

  } catch (err) {
    console.error(chalk.default.red('❌ Failed to check database setup:'), err.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

setupDatabase(); 