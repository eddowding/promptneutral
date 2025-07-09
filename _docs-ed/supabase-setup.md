# Supabase Setup Guide

## Quick Start

PromptNeutral includes an automated setup script to guide you through the Supabase configuration process:

```bash
npm run setup:supabase
```

This interactive script will:
- Check your current configuration
- Guide you through creating a Supabase project
- Help you set up environment variables
- Provide database setup instructions

## Manual Setup

If you prefer to set up Supabase manually, follow the steps below:

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Create a new project
4. Choose a project name: `promptneutral`
5. Set a database password (save this securely)
6. Choose a region close to your users

## 2. Get Environment Variables

1. Go to Project Settings > API
2. Copy the following values to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Database Schema

Run the following SQL in the Supabase SQL Editor:

### Profiles Table
```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  company text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Profiles are viewable by the user who owns them
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Automatically create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Usage Data Table
```sql
-- Create usage_data table
create table usage_data (
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

-- Enable RLS
alter table usage_data enable row level security;

-- Users can view their own usage data
create policy "Users can view own usage data" on usage_data
  for select using (auth.uid() = user_id);

-- Users can insert their own usage data
create policy "Users can insert own usage data" on usage_data
  for insert with check (auth.uid() = user_id);

-- Create index for performance
create index usage_data_user_date_idx on usage_data(user_id, date);
create index usage_data_user_model_idx on usage_data(user_id, model);
```

### Carbon Credits Table
```sql
-- Create carbon_credits table
create table carbon_credits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_type text not null,
  amount_retired decimal(10,2) not null,
  cost decimal(10,2) not null,
  retirement_date date not null,
  certificate_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table carbon_credits enable row level security;

-- Users can view their own carbon credits
create policy "Users can view own carbon credits" on carbon_credits
  for select using (auth.uid() = user_id);

-- Users can insert their own carbon credits
create policy "Users can insert own carbon credits" on carbon_credits
  for insert with check (auth.uid() = user_id);

-- Create index for performance
create index carbon_credits_user_date_idx on carbon_credits(user_id, retirement_date);
```

## 4. Authentication Setup

1. Go to Authentication > Settings
2. Site URL: `http://localhost:3000` (for development)
3. Add redirect URLs for production later
4. Enable email confirmation if desired
5. Configure email templates in Authentication > Templates

## 5. Storage (Optional)

If you need file storage for certificates:

1. Go to Storage
2. Create a bucket called `certificates`
3. Set up RLS policies for the bucket

## 6. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared
```

## 7. Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_OPENAI_API_KEY=your_openai_key
```

## Configuration Status

PromptNeutral includes built-in tools to help you verify your Supabase setup:

### SupabaseSetupStatus Component

Add this component to your application to see the current configuration status:

```tsx
import { SupabaseSetupStatus } from './components/SupabaseSetupStatus';

function App() {
  return (
    <div>
      <SupabaseSetupStatus />
      {/* Your app content */}
    </div>
  );
}
```

This component provides:
- Real-time configuration status
- Connection testing
- Setup instructions when not configured
- Environment variable examples
- Copy-to-clipboard functionality

### Programmatic Checks

You can also check the configuration status programmatically:

```tsx
import { 
  checkSupabaseConfig, 
  testSupabaseConnection, 
  isSupabaseConfigured 
} from './lib/supabase';

// Check if Supabase is configured
if (isSupabaseConfigured) {
  console.log('Supabase is ready to use');
} else {
  console.log('Supabase needs configuration');
}

// Detailed configuration check
const config = checkSupabaseConfig();
console.log('Configuration status:', config);

// Test connection
const connectionTest = await testSupabaseConnection();
if (connectionTest.success) {
  console.log('Connected to Supabase successfully');
} else {
  console.log('Connection failed:', connectionTest.error);
}
```

## Error Handling

The integration includes comprehensive error handling:

### Graceful Fallbacks

- **No Configuration**: Falls back to localStorage-based mock authentication
- **Connection Issues**: Provides clear error messages and retry options
- **Invalid Configuration**: Validates URLs and provides helpful guidance

### Error Wrapper

Use the error wrapper for Supabase operations:

```tsx
import { withSupabaseErrorHandling } from './lib/supabase';

const { data, error } = await withSupabaseErrorHandling(
  async () => {
    return await supabase.from('profiles').select('*');
  },
  'Fetching user profiles'
);

if (error) {
  console.error('Operation failed:', error);
} else {
  console.log('Data:', data);
}
```

## Development vs Production

### Development Mode

When Supabase is not configured, the application:
- Uses localStorage for authentication
- Provides demo login (demo@promptneutral.com / demo123)
- Shows setup guidance in the UI
- Logs helpful messages to the console

### Production Mode

When Supabase is configured, the application:
- Uses real Supabase authentication
- Stores data in the Supabase database
- Enforces Row Level Security (RLS)
- Provides session management

## Next Steps

1. ✅ Supabase client with graceful error handling
2. ✅ Configuration validation and status checking
3. ✅ Automated setup script
4. ✅ Updated authentication context
5. Replace mock data with real database queries
6. Test authentication flows
7. Deploy and update redirect URLs