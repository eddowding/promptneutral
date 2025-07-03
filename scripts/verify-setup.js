#!/usr/bin/env node

/**
 * Quick verification script to check if the database schema is set up
 */

async function verify() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const chalk = await import('chalk');
    const dotenv = await import('dotenv');
    
    dotenv.default.config();

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('Missing environment variables');
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    console.log(chalk.default.cyan('🔍 Verifying database setup...'));

    const tables = ['profiles', 'usage_data', 'carbon_credits'];
    let allGood = true;

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(chalk.default.red(`❌ ${table}: ${error.message}`));
          allGood = false;
        } else {
          console.log(chalk.default.green(`✅ ${table}: Ready`));
        }
      } catch (err) {
        console.log(chalk.default.red(`❌ ${table}: ${err.message}`));
        allGood = false;
      }
    }

    if (allGood) {
      console.log(chalk.default.green('\n🎉 Database is ready! Run: npm run seed:supabase'));
    } else {
      console.log(chalk.default.yellow('\n⚠️  Some tables are missing. Please run the SQL in Supabase dashboard.'));
    }

  } catch (err) {
    console.error('Verification failed:', err.message);
  }
}

verify(); 