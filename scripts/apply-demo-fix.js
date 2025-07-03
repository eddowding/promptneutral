#!/usr/bin/env node

const fs = require('fs');

async function applyDemoFix() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const dotenv = await import('dotenv');
    
    dotenv.default.config();

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔧 Applying demo user access fix...');

    // Create admin client (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });

    // First, let's manually insert a demo user record into profiles
    console.log('📝 Creating demo user profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'demo@promptneutral.com',
        full_name: 'Demo User',
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.log('Profile creation result:', profileError.message);
    } else {
      console.log('✅ Demo user profile created/updated');
    }

    // Test API key insertion directly with service role
    console.log('🔑 Testing API key insertion with service role...');
    const { error: keyError } = await supabase
      .from('api_keys')
      .insert({
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        service: 'test',
        encrypted_key: 'test-key-encrypted',
        enabled: true,
        validated: false
      });

    if (keyError) {
      console.error('❌ API key insertion failed:', keyError.message);
    } else {
      console.log('✅ API key insertion works with service role');
      
      // Clean up test record
      await supabase
        .from('api_keys')
        .delete()
        .eq('service', 'test')
        .eq('user_id', '123e4567-e89b-12d3-a456-426614174000');
    }

    console.log('🔍 Current RLS policies:');
    
    // Check current policies
    const { data: policies } = await supabase
      .from('pg_policies')
      .select('*')
      .in('tablename', ['api_keys', 'user_preferences', 'profiles']);
    
    if (policies) {
      policies.forEach(policy => {
        console.log(`- ${policy.tablename}: ${policy.policyname} (${policy.cmd})`);
      });
    }

  } catch (err) {
    console.error('❌ Script failed:', err.message);
    process.exit(1);
  }
}

applyDemoFix();