#!/usr/bin/env node

/**
 * Supabase Seed Script for PromptNeutral
 *
 * This script connects to your Supabase project and populates it with
 * realistic demo data so you can explore the dashboard immediately.
 *
 * Requirements:
 * 1. A Supabase project with the schema defined in `_docs/supabase-setup.md`.
 * 2. Environment variables in your `.env` file:
 *    - VITE_SUPABASE_URL (your project URL)
 *    - SUPABASE_SERVICE_ROLE_KEY (service role – required so we can bypass RLS)
 *
 *    The public anon key is NOT sufficient because we need to bypass RLS when
 *    inserting data on behalf of multiple users.
 *
 * Usage:
 *    npm run seed:supabase
 */

import('dotenv').then(({ default: dotenv }) => {
  dotenv.config();
  run().catch(err => {
    console.error('Failed to run seed script:', err);
    process.exit(1);
  });
}).catch(err => {
  console.error('Failed to load dotenv:', err);
  process.exit(1);
});

async function run() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const chalk = await import('chalk');

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('\nMissing environment variables. Please ensure the following are present in your .env file:');
      console.error('  VITE_SUPABASE_URL=<your-url>');
      console.error('  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>');
      console.error('\nYou can obtain the Service Role key from Settings → API in the Supabase dashboard.');
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false
      }
    });

    console.log(chalk.default.cyan('\n🚀 Seeding Supabase with demo data...'));

  // 1. Create (or fetch) demo users
  const demoUsers = [
    {
      email: 'demo@promptneutral.com',
      fullName: 'Demo User',
      company: 'PromptNeutral',
      password: 'demo123'
    },
    {
      email: 'acme@example.com',
      fullName: 'Acme Corp.',
      company: 'Acme Corporation',
      password: 'acme123'
    }
  ];

  const createdUsers = [];

  for (const user of demoUsers) {
    // Check if user already exists by email
    const { data: existing, error: fetchErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (existing) {
      console.log(chalk.default.yellow(`→ User ${user.email} already exists – skipping creation.`));
      createdUsers.push({ id: existing.id, ...user });
      continue;
    }

    // Create Supabase auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      password: user.password
    });

    if (error) {
      console.error(chalk.default.red(`✗ Failed to create user ${user.email}: ${error.message}`));
      process.exit(1);
    }

    const userId = data.user?.id;
    if (!userId) {
      console.error(chalk.default.red(`✗ Unexpected: user id missing for ${user.email}`));
      process.exit(1);
    }

    // Insert profile
    const { error: profileErr } = await supabase.from('profiles').insert({
      id: userId,
      email: user.email,
      full_name: user.fullName,
      company: user.company
    });

    if (profileErr) {
      console.error(chalk.default.red(`✗ Failed to insert profile for ${user.email}: ${profileErr.message}`));
      process.exit(1);
    }

    createdUsers.push({ id: userId, ...user });
    console.log(chalk.default.green(`✓ Created user ${user.email}`));
  }

  // 2. Seed usage_data & carbon_credits for each user
  const today = new Date();

  for (const u of createdUsers) {
    const usageRows = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      usageRows.push({
        user_id: u.id,
        date: date.toISOString().slice(0, 10),
        model: i % 2 === 0 ? 'gpt-4o' : 'gpt-3.5-turbo',
        requests: Math.floor(Math.random() * 20) + 1,
        context_tokens: Math.floor(Math.random() * 8000) + 1000,
        generated_tokens: Math.floor(Math.random() * 8000) + 1000,
        cost: Number((Math.random() * 0.5).toFixed(4)),
        co2_grams: Number((Math.random() * 5).toFixed(2))
      });
    }

    const { error: usageErr } = await supabase.from('usage_data').insert(usageRows);
    if (usageErr) {
      console.error(chalk.default.red(`✗ Failed to insert usage data for ${u.email}: ${usageErr.message}`));
      process.exit(1);
    }

    // Carbon credits – one record per user
    const credit = {
      user_id: u.id,
      project_type: 'Renewable Energy',
      amount_retired: 100 + Math.random() * 200,
      cost: 50 + Math.random() * 150,
      retirement_date: today.toISOString().slice(0, 10),
      certificate_url: null
    };

    const { error: creditErr } = await supabase.from('carbon_credits').insert(credit);
    if (creditErr) {
      console.error(chalk.default.red(`✗ Failed to insert carbon credits for ${u.email}: ${creditErr.message}`));
      process.exit(1);
    }
  }

    console.log(chalk.default.green('\n🎉 Seeding complete!'));
    console.log('You can now log in with:');
    for (const u of createdUsers) {
      console.log(`• ${u.email} / ${u.password}`);
    }
    console.log('\nHappy hacking!');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
} 