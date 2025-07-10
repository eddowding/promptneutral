#!/usr/bin/env node

/**
 * Test Supabase connection and settings functionality
 */

const fs = require('fs');
const path = require('path');

async function testConnection() {
  try {
    // Import modules dynamically
    const { createClient } = await import('@supabase/supabase-js');
    const dotenv = await import('dotenv');
    
    // Load environment variables
    dotenv.default.config();

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabasePublishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('\n🔍 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Publishable Key:', supabasePublishableKey ? '✅ Present' : '❌ Missing');
    console.log('Service Key:', serviceKey ? '✅ Present' : '❌ Missing');

    // Test with publishable key (what the app uses)
    const supabaseClient = createClient(supabaseUrl, supabasePublishableKey);
    
    console.log('\n📡 Testing anon client connection...');
    const { data: session } = await supabaseAnon.auth.getSession();
    console.log('Session:', session ? '✅ Valid' : '❌ No session');

    // Test with service key
    const supabaseService = createClient(supabaseUrl, serviceKey);
    
    console.log('\n🔑 Testing service role connection...');
    const { data: profiles, error: profilesError } = await supabaseService
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Service role error:', profilesError.message);
    } else {
      console.log('✅ Service role connection working');
    }

    // Test API keys table structure
    console.log('\n🗂️  Testing api_keys table...');
    const { data: apiKeys, error: apiKeysError } = await supabaseService
      .from('api_keys')
      .select('*')
      .limit(1);
    
    if (apiKeysError) {
      console.log('❌ API keys table error:', apiKeysError.message);
    } else {
      console.log('✅ API keys table accessible');
    }

    // Test user_preferences table structure
    console.log('\n⚙️  Testing user_preferences table...');
    const { data: prefs, error: prefsError } = await supabaseService
      .from('user_preferences')
      .select('*')
      .limit(1);
    
    if (prefsError) {
      console.log('❌ User preferences table error:', prefsError.message);
    } else {
      console.log('✅ User preferences table accessible');
    }

    // Test RLS policies
    console.log('\n🔒 Testing RLS policies...');
    try {
      // This should fail without proper user context
      const { data: anonProfiles, error: anonError } = await supabaseAnon
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (anonError) {
        console.log('✅ RLS is working (anon access blocked):', anonError.message);
      } else {
        console.log('⚠️  RLS might not be configured properly');
      }
    } catch (err) {
      console.log('✅ RLS is working (connection blocked)');
    }

    console.log('\n✅ Connection test completed!');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

testConnection();