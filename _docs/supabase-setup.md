# Supabase Setup Guide

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

## Next Steps

1. Update the auth context to use Supabase
2. Replace mock data with real database queries
3. Test authentication flows
4. Deploy and update redirect URLs