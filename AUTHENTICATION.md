# Authentication System

This application uses Supabase for authentication. The authentication system has been completely replaced from mock/localStorage to real Supabase authentication.

## Setup

1. Ensure you have the following environment variables set in your `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Features

### ✅ Implemented Features

- **Email/Password Authentication**: Users can sign up and sign in using email and password
- **Automatic Session Management**: Sessions are automatically managed with token refresh
- **Password Reset**: Users can request password reset emails
- **Email Verification**: Support for email verification flow (if enabled in Supabase)
- **Protected Routes**: Routes are protected and redirect to auth page when not authenticated
- **User Profile Integration**: User profiles are stored in the `profiles` table
- **Error Handling**: Comprehensive error handling for all auth scenarios

### 🔐 Authentication Flow

1. **Sign Up**: 
   - User fills out signup form
   - Account is created in Supabase Auth
   - User profile is created in `profiles` table
   - If email confirmation is required, user receives email
   - Otherwise, user is automatically logged in

2. **Sign In**:
   - User enters email/password
   - Supabase validates credentials
   - Session is established
   - User is redirected to dashboard

3. **Password Reset**:
   - User clicks "Forgot password" on login form
   - Enters email address
   - Receives password reset email
   - Clicks link in email
   - Sets new password
   - Redirected to dashboard

4. **Email Verification** (if enabled):
   - User receives verification email after signup
   - Clicks verification link
   - Account is confirmed
   - User can now sign in

### 📁 File Structure

- `src/contexts/AuthContext.tsx` - Main authentication context with Supabase integration
- `src/components/LoginForm.tsx` - Login form with password reset modal
- `src/components/SignupForm.tsx` - Signup form with email verification handling
- `src/components/EmailVerification.tsx` - Email verification page
- `src/components/PasswordReset.tsx` - Password reset page
- `src/components/ProtectedRoute.tsx` - Route protection wrapper
- `src/lib/supabase.ts` - Supabase client configuration

### 🛠 Database Schema

The authentication system expects these tables in Supabase:

```sql
-- profiles table (automatically created by trigger when user signs up)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### ⚡ Key Components

#### AuthContext
- Manages authentication state
- Provides login, signup, logout, and resetPassword functions
- Handles session management and token refresh
- Converts Supabase user to app User type

#### LoginForm
- Email/password login
- Form validation
- Password reset modal
- Error handling

#### SignupForm
- User registration
- Password strength indicator
- Email verification messaging
- Profile creation

### 🔗 Routes

- `/auth` - Authentication page (login/signup tabs)
- `/verify-email` - Email verification handler
- `/reset-password` - Password reset handler
- `/dashboard` - Protected dashboard (requires authentication)

### 🎯 Usage Examples

#### Using the Auth Context
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={() => logout()}>Sign Out</button>
    </div>
  );
}
```

#### Protecting Routes
```tsx
import { ProtectedRoute } from '../components/ProtectedRoute';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### 🚨 Important Notes

1. **Environment Variables**: Make sure Supabase environment variables are properly set
2. **Database Setup**: Ensure the profiles table and triggers are created in Supabase
3. **Email Configuration**: Configure email templates in Supabase for password reset and verification
4. **Error Handling**: All auth errors are handled gracefully with user-friendly messages
5. **Security**: Row Level Security (RLS) should be enabled on all user data tables

### 🔧 Supabase Configuration

In your Supabase dashboard:

1. **Authentication Settings**:
   - Enable email confirmations if desired
   - Configure redirect URLs for password reset
   - Set up email templates

2. **Database**:
   - Create the profiles table with proper RLS policies
   - Set up triggers for user creation

3. **API Keys**:
   - Use the anon key for client-side operations
   - Never expose the service role key in client code

### 📧 Email Templates

Configure these redirect URLs in Supabase:
- Password Reset: `https://yourdomain.com/reset-password`
- Email Verification: `https://yourdomain.com/verify-email`