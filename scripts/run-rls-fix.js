#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('   - VITE_SUPABASE_URL');
  if (!serviceRoleKey) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nMake sure your .env file contains these variables.');
  process.exit(1);
}

console.log('🔧 Fixing RLS policies for carbon_offset_orders table...\n');

// Read the SQL file
const sqlPath = path.join(__dirname, 'fix-rls-policies.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

console.log('📋 SQL to execute:');
console.log('─'.repeat(60));
console.log(sqlContent);
console.log('─'.repeat(60));

console.log('\n⚠️  This script cannot execute the SQL directly.');
console.log('\n📝 To apply these fixes:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to the SQL Editor');
console.log('3. Copy and paste the SQL above');
console.log('4. Click "Run" to execute');

console.log('\n🔗 Direct link to SQL editor:');
console.log(`   https://supabase.com/dashboard/project/${supabaseUrl.match(/https:\/\/([^.]+)/)[1]}/sql/new`);

console.log('\n✅ After running the SQL, your app should be able to save orders to the database.');