#!/usr/bin/env node

/**
 * Supabase Setup Script for PromptNeutral
 * 
 * This script guides developers through setting up Supabase for the PromptNeutral project.
 * It checks for existing configuration, validates environment variables, and provides
 * step-by-step instructions for database setup.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Helper function to print colored text
function printColored(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

// Helper function to print section headers
function printSection(title) {
  console.log();
  printColored('='.repeat(60), 'cyan');
  printColored(title.toUpperCase(), 'cyan');
  printColored('='.repeat(60), 'cyan');
  console.log();
}

// Helper function to print step headers
function printStep(step, title) {
  console.log();
  printColored(`${step}. ${title}`, 'yellow');
  printColored('-'.repeat(40), 'yellow');
}

// Check if .env file exists and read it
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExists = fs.existsSync(envPath);
  
  let envContent = '';
  let existingVars = {};
  
  if (envExists) {
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, value] = trimmed.split('=');
          if (key && value) {
            existingVars[key] = value;
          }
        }
      });
    } catch (error) {
      printColored('Warning: Could not read .env file', 'yellow');
    }
  }
  
  return { envExists, envContent, existingVars };
}

// Validate URL format
function isValidSupabaseUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && urlObj.hostname.includes('supabase');
  } catch {
    return false;
  }
}

// Main setup function
async function main() {
  printColored('Welcome to PromptNeutral Supabase Setup!', 'green');
  printColored('This script will help you configure Supabase for your project.', 'blue');
  
  // Check current environment
  printSection('Checking Current Configuration');
  
  const { envExists, envContent, existingVars } = checkEnvFile();
  
  if (envExists) {
    printColored('✓ .env file found', 'green');
  } else {
    printColored('✗ .env file not found', 'red');
  }
  
  const hasSupabaseUrl = 'VITE_SUPABASE_URL' in existingVars;
  const hasSupabaseKey = 'VITE_SUPABASE_PUBLISHABLE_KEY' in existingVars;
  
  if (hasSupabaseUrl) {
    const url = existingVars.VITE_SUPABASE_URL;
    if (isValidSupabaseUrl(url)) {
      printColored(`✓ Valid Supabase URL found: ${url}`, 'green');
    } else {
      printColored(`✗ Invalid Supabase URL: ${url}`, 'red');
    }
  } else {
    printColored('✗ VITE_SUPABASE_URL not found', 'red');
  }
  
  if (hasSupabaseKey) {
    const key = existingVars.VITE_SUPABASE_PUBLISHABLE_KEY;
    printColored(`✓ Supabase publishable key found: ${key.substring(0, 20)}...`, 'green');
  } else {
    printColored('✗ VITE_SUPABASE_PUBLISHABLE_KEY not found', 'red');
  }
  
  // If everything is configured, ask if user wants to reconfigure
  if (hasSupabaseUrl && hasSupabaseKey && isValidSupabaseUrl(existingVars.VITE_SUPABASE_URL)) {
    console.log();
    const reconfigure = await askQuestion('Supabase appears to be configured. Do you want to reconfigure? (y/N): ');
    if (reconfigure.toLowerCase() !== 'y' && reconfigure.toLowerCase() !== 'yes') {
      printColored('Setup cancelled. Your existing configuration will remain unchanged.', 'blue');
      rl.close();
      return;
    }
  }
  
  // Guide through Supabase project creation
  printSection('Supabase Project Setup');
  
  printStep(1, 'Create Supabase Project');
  console.log('If you haven\'t already, you need to create a Supabase project:');
  console.log('• Go to https://supabase.com');
  console.log('• Sign up or log in to your account');
  console.log('• Click "New Project"');
  console.log('• Choose your organization');
  console.log('• Enter project name: "promptneutral" (or your preferred name)');
  console.log('• Set a strong database password (save it securely!)');
  console.log('• Choose a region close to your users');
  console.log('• Click "Create new project"');
  console.log('• Wait for the project to be created (this can take a few minutes)');
  
  await askQuestion('Press Enter when you have created your Supabase project...');
  
  printStep(2, 'Get Project Credentials');
  console.log('Now you need to get your project credentials:');
  console.log('• Go to your Supabase project dashboard');
  console.log('• Click on "Settings" in the left sidebar');
  console.log('• Click on "API" in the settings menu');
  console.log('• You will see your Project URL and publishable key');
  
  console.log();
  const projectUrl = await askQuestion('Enter your Supabase Project URL: ');
  
  if (!isValidSupabaseUrl(projectUrl)) {
    printColored('Warning: The URL you entered doesn\'t look like a valid Supabase URL.', 'yellow');
    printColored('It should be in the format: https://your-project-id.supabase.co', 'yellow');
    const proceed = await askQuestion('Do you want to continue anyway? (y/N): ');
    if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
      printColored('Setup cancelled.', 'red');
      rl.close();
      return;
    }
  }
  
  const anonKey = await askQuestion('Enter your Supabase publishable key: ');
  
  if (!anonKey || anonKey.length < 100) {
    printColored('Warning: The key you entered seems too short for a Supabase publishable key.', 'yellow');
    const proceed = await askQuestion('Do you want to continue anyway? (y/N): ');
    if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
      printColored('Setup cancelled.', 'red');
      rl.close();
      return;
    }
  }
  
  // Create or update .env file
  printStep(3, 'Update Environment Variables');
  
  let newEnvContent = '';
  
  if (envExists) {
    // Update existing .env file
    const lines = envContent.split('\n');
    const updatedLines = [];
    let urlUpdated = false;
    let keyUpdated = false;
    
    lines.forEach(line => {
      if (line.startsWith('VITE_SUPABASE_URL=')) {
        updatedLines.push(`VITE_SUPABASE_URL=${projectUrl}`);
        urlUpdated = true;
      } else if (line.startsWith('VITE_SUPABASE_PUBLISHABLE_KEY=')) {
        updatedLines.push(`VITE_SUPABASE_PUBLISHABLE_KEY=${anonKey}`);
        keyUpdated = true;
      } else {
        updatedLines.push(line);
      }
    });
    
    if (!urlUpdated) {
      updatedLines.push(`VITE_SUPABASE_URL=${projectUrl}`);
    }
    if (!keyUpdated) {
      updatedLines.push(`VITE_SUPABASE_PUBLISHABLE_KEY=${anonKey}`);
    }
    
    newEnvContent = updatedLines.join('\n');
  } else {
    // Create new .env file
    newEnvContent = `# Supabase Configuration
VITE_SUPABASE_URL=${projectUrl}
VITE_SUPABASE_PUBLISHABLE_KEY=${anonKey}

# OpenAI Configuration (add your OpenAI API key here)
# VITE_OPENAI_API_KEY=your-openai-api-key-here
`;
  }
  
  try {
    fs.writeFileSync(path.join(process.cwd(), '.env'), newEnvContent);
    printColored('✓ .env file updated successfully', 'green');
  } catch (error) {
    printColored(`✗ Failed to update .env file: ${error.message}`, 'red');
    rl.close();
    return;
  }
  
  // Database setup instructions
  printSection('Database Setup');
  
  console.log('Now you need to set up your database schema:');
  console.log();
  printColored('Option 1: Automated Setup (Recommended)', 'green');
  console.log('• Go to your Supabase project dashboard');
  console.log('• Click on "SQL Editor" in the left sidebar');
  console.log('• Copy and paste the SQL from: _docs/supabase-setup.md');
  console.log('• Run the SQL queries to create tables and policies');
  console.log();
  printColored('Option 2: Manual Setup', 'yellow');
  console.log('• Follow the detailed instructions in _docs/supabase-setup.md');
  console.log('• Create each table and policy manually');
  
  console.log();
  const setupDb = await askQuestion('Have you set up the database schema? (y/N): ');
  
  if (setupDb.toLowerCase() === 'y' || setupDb.toLowerCase() === 'yes') {
    printColored('✓ Database schema setup confirmed', 'green');
  } else {
    printColored('⚠ Remember to set up your database schema before using the application', 'yellow');
    printColored('  See _docs/supabase-setup.md for detailed instructions', 'yellow');
  }
  
  // Authentication setup
  printSection('Authentication Setup');
  
  console.log('Configure authentication settings:');
  console.log('• Go to Authentication > Settings in your Supabase dashboard');
  console.log('• Set Site URL to: http://localhost:5173 (for development)');
  console.log('• Add redirect URLs for production later');
  console.log('• Configure email templates if needed');
  
  await askQuestion('Press Enter when you have configured authentication...');
  
  // Final steps
  printSection('Final Steps');
  
  printColored('✓ Supabase setup completed!', 'green');
  console.log();
  console.log('Next steps:');
  console.log('1. Restart your development server to load new environment variables');
  console.log('2. Test the connection using the SupabaseSetupStatus component');
  console.log('3. Update your application to use Supabase authentication');
  console.log('4. Replace mock data with real database queries');
  console.log();
  
  const startApp = await askQuestion('Do you want to start the development server now? (y/N): ');
  
  if (startApp.toLowerCase() === 'y' || startApp.toLowerCase() === 'yes') {
    console.log();
    printColored('Starting development server...', 'blue');
    printColored('Run: npm run dev', 'cyan');
  }
  
  printColored('Setup complete! Check the browser console for any connection issues.', 'green');
  
  rl.close();
}

// Error handling
process.on('unhandledRejection', (error) => {
  printColored(`Error: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log();
  printColored('Setup cancelled by user.', 'yellow');
  rl.close();
  process.exit(0);
});

// Run the setup
main().catch((error) => {
  printColored(`Setup failed: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});