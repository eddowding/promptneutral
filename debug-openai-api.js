#!/usr/bin/env node

/**
 * Debug script to test OpenAI Usage API directly
 * This will help us see exactly what data OpenAI is returning
 */

import fetch from 'node-fetch';

// You'll need to replace this with your actual API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-api-key-here';

async function testOpenAIUsageAPI() {
  console.log('🔍 Testing OpenAI Usage API directly...\n');
  
  // Test 1: Get today's usage
  const today = new Date().toISOString().split('T')[0];
  console.log(`📅 Today's date: ${today}`);
  
  try {
    // Test single date
    console.log('\n🔸 Testing single date API call:');
    const singleDateUrl = `https://api.openai.com/v1/usage?date=${today}`;
    console.log(`URL: ${singleDateUrl}`);
    
    const singleResponse = await fetch(singleDateUrl, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!singleResponse.ok) {
      console.error(`❌ Single date API error: ${singleResponse.status} ${singleResponse.statusText}`);
      const errorText = await singleResponse.text();
      console.error('Error details:', errorText);
    } else {
      const singleData = await singleResponse.json();
      console.log('✅ Single date response:', JSON.stringify(singleData, null, 2));
    }
    
    // Test date range
    console.log('\n🔸 Testing date range API call:');
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6); // 7 days ago
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const rangeUrl = `https://api.openai.com/v1/usage?start_date=${startDateStr}&end_date=${endDateStr}`;
    console.log(`URL: ${rangeUrl}`);
    console.log(`Date range: ${startDateStr} to ${endDateStr}`);
    
    const rangeResponse = await fetch(rangeUrl, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!rangeResponse.ok) {
      console.error(`❌ Date range API error: ${rangeResponse.status} ${rangeResponse.statusText}`);
      const errorText = await rangeResponse.text();
      console.error('Error details:', errorText);
    } else {
      const rangeData = await rangeResponse.json();
      console.log('✅ Date range response:', JSON.stringify(rangeData, null, 2));
      
      if (rangeData.data && rangeData.data.length > 0) {
        console.log(`\n📊 Found ${rangeData.data.length} usage entries`);
        
        // Group by date to see which dates have data
        const dateGroups = {};
        rangeData.data.forEach(entry => {
          const date = entry.aggregation_timestamp?.split('T')[0] || 'unknown';
          if (!dateGroups[date]) {
            dateGroups[date] = [];
          }
          dateGroups[date].push(entry);
        });
        
        console.log('\n📅 Usage by date:');
        Object.keys(dateGroups).sort().forEach(date => {
          console.log(`  ${date}: ${dateGroups[date].length} entries`);
          dateGroups[date].forEach(entry => {
            console.log(`    - ${entry.snapshot_id}: ${entry.n_requests || 0} requests`);
          });
        });
      } else {
        console.log('📭 No usage data found in range');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run if API key is provided
if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your-api-key-here') {
  testOpenAIUsageAPI();
} else {
  console.log('❌ Please set OPENAI_API_KEY environment variable or update the script with your API key');
  console.log('Usage: OPENAI_API_KEY=your_key_here node debug-openai-api.js');
}