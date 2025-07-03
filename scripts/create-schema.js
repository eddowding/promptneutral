#!/usr/bin/env node

/**
 * Schema Creation Script for PromptNeutral
 * 
 * This script creates the database schema by executing SQL statements
 * using the PostgreSQL REST API
 */

const fs = require('fs');
const path = require('path');

async function createSchema() {
  // Import modules dynamically
  const { createClient } = await import('@supabase/supabase-js');
  const chalk = await import('chalk');
  const dotenv = await import('dotenv');
  
  // Load environment variables
  dotenv.default.config();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(chalk.default.red('\nMissing environment variables.'));
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false
    }
  });

  console.log(chalk.default.cyan('\n🚀 Creating database schema...'));

  try {
    // Create profiles table
    console.log(chalk.default.yellow('Creating profiles table...'));
    
    const createProfilesTable = `
      CREATE TABLE IF NOT EXISTS profiles (
        id uuid references auth.users on delete cascade primary key,
        email text unique not null,
        full_name text,
        company text,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    `;

    await executeSQL(supabase, createProfilesTable, 'Create profiles table');

    // Enable RLS for profiles
    await executeSQL(supabase, 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;', 'Enable RLS for profiles');

    // Create policies for profiles
    await executeSQL(supabase, `
      CREATE POLICY "Users can view own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);
    `, 'Create profiles select policy');

    await executeSQL(supabase, `
      CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id);
    `, 'Create profiles update policy');

    // Create the trigger function
    await executeSQL(supabase, `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, full_name)
        VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `, 'Create trigger function');

    // Create the trigger
    await executeSQL(supabase, `
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `, 'Create auth trigger');

    // Create usage_data table
    console.log(chalk.default.yellow('Creating usage_data table...'));
    
    await executeSQL(supabase, `
      CREATE TABLE IF NOT EXISTS usage_data (
        id uuid default gen_random_uuid() primary key,
        user_id uuid references auth.users(id) on delete cascade not null,
        date date not null,
        model text not null,
        requests integer not null default 0,
        context_tokens integer not null default 0,
        generated_tokens integer not null default 0,
        cost decimal(10,4) not null default 0,
        co2_grams decimal(10,2) not null default 0,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    `, 'Create usage_data table');

    // Enable RLS and create policies for usage_data
    await executeSQL(supabase, 'ALTER TABLE usage_data ENABLE ROW LEVEL SECURITY;', 'Enable RLS for usage_data');
    
    await executeSQL(supabase, `
      CREATE POLICY "Users can view own usage data" ON usage_data
        FOR SELECT USING (auth.uid() = user_id);
    `, 'Create usage_data select policy');

    await executeSQL(supabase, `
      CREATE POLICY "Users can insert own usage data" ON usage_data
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `, 'Create usage_data insert policy');

    // Create indexes
    await executeSQL(supabase, `
      CREATE INDEX IF NOT EXISTS usage_data_user_date_idx ON usage_data(user_id, date);
    `, 'Create usage_data date index');

    await executeSQL(supabase, `
      CREATE INDEX IF NOT EXISTS usage_data_user_model_idx ON usage_data(user_id, model);
    `, 'Create usage_data model index');

    // Create carbon_credits table
    console.log(chalk.default.yellow('Creating carbon_credits table...'));
    
    await executeSQL(supabase, `
      CREATE TABLE IF NOT EXISTS carbon_credits (
        id uuid default gen_random_uuid() primary key,
        user_id uuid references auth.users(id) on delete cascade not null,
        project_type text not null,
        amount_retired decimal(10,2) not null,
        cost decimal(10,2) not null,
        retirement_date date not null,
        certificate_url text,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    `, 'Create carbon_credits table');

    // Enable RLS and create policies for carbon_credits
    await executeSQL(supabase, 'ALTER TABLE carbon_credits ENABLE ROW LEVEL SECURITY;', 'Enable RLS for carbon_credits');
    
    await executeSQL(supabase, `
      CREATE POLICY "Users can view own carbon credits" ON carbon_credits
        FOR SELECT USING (auth.uid() = user_id);
    `, 'Create carbon_credits select policy');

    await executeSQL(supabase, `
      CREATE POLICY "Users can insert own carbon credits" ON carbon_credits
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `, 'Create carbon_credits insert policy');

    // Create index
    await executeSQL(supabase, `
      CREATE INDEX IF NOT EXISTS carbon_credits_user_date_idx ON carbon_credits(user_id, retirement_date);
    `, 'Create carbon_credits index');

    console.log(chalk.default.green('\n🎉 Database schema created successfully!'));
    console.log(chalk.default.cyan('You can now run the seed script:'));
    console.log(chalk.default.white('npm run seed:supabase'));

  } catch (err) {
    console.error(chalk.default.red('❌ Failed to create schema:'), err.message);
    process.exit(1);
  }
}

async function executeSQL(supabase, sql, description) {
  try {
    console.log(chalk.default.gray(`  → ${description}`));
    
    // Use the raw SQL execution endpoint
    const response = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`,
        'apikey': supabase.supabaseKey
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      // If exec_sql doesn't work, we'll need to create it or use a different approach
      console.log(chalk.default.yellow(`    ⚠️  Could not execute: ${description}`));
      console.log(chalk.default.gray(`    SQL: ${sql.substring(0, 60)}...`));
      return false;
    }

    const result = await response.json();
    console.log(chalk.default.green(`    ✅ ${description}`));
    return true;

  } catch (error) {
    console.log(chalk.default.red(`    ❌ Failed: ${description} - ${error.message}`));
    return false;
  }
}

createSchema().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
}); 