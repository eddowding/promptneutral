# Feedback System Implementation Planning

## Overview
A simple, effective feedback system that allows authenticated users to provide feedback from any page via a fixed-position tab, with an admin interface for managing submissions. The system integrates with the NotZero carbon tracking platform using Supabase PostgreSQL and React components.

## Current Architecture Analysis

**Database**: Supabase PostgreSQL with Row Level Security (RLS)
**UI**: React components with Tailwind CSS styling
**Authentication**: Supabase Auth with basic user profiles
**Admin**: Simple role-based access using user email check
**Frontend**: Vite + React with React Router

## Core Components

### 1. **Floating Feedback Tab** (`src/components/FeedbackTab.tsx`)
- **Position**: Fixed on the right side of screen, vertically centered
- **Visibility**: Present on authenticated pages (check for user session)
- **Styling**: Matches NotZero design system with vertical text "FEEDBACK"
- **Interaction**: Opens modal on click
- **Implementation**: Simple React component with useState for modal control

### 2. **Feedback Modal** (`src/components/FeedbackModal.tsx`)
- **Required Fields**: Message (textarea)
- **Auto-capture**: 
  - Current page URL (displayed to user)
  - User ID from Supabase auth context
  - User email from session
- **Optional Fields**: 
  - "I'd like follow-up" checkbox
- **UX Features**: 
  - Loading states during submission
  - Success/error messaging
  - Auto-close after successful submission

### 3. **Admin Management Page** (`src/pages/admin/FeedbackPage.tsx`)
- **Layout**: Follows existing dashboard page structure
- **Navigation**: Add to Navigation component for admin users
- **Features**:
  - View all feedback submissions
  - Filter by status: "new", "resolved"
  - Mark items as resolved
  - Display submission timestamps, URLs, and user info
  - Simple email contact links

### 4. **Feedback Service** (`src/services/feedbackService.ts`)
- Direct Supabase client calls:
  - `createFeedback()`: Submit new feedback
  - `getFeedback()`: Retrieve all feedback (admin check)
  - `updateFeedbackStatus()`: Update status (admin check)

## Database Schema (Supabase PostgreSQL)

```sql
-- New migration file: add_feedback_system.sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'resolved')),
  url TEXT NOT NULL,
  follow_up BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

-- RLS Policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Admin users can manage all feedback (define admin emails in app config)
CREATE POLICY "Admin users can view all feedback"
  ON feedback FOR SELECT
  USING (true); -- Admin check will be done in application layer

-- Users can create feedback
CREATE POLICY "Users can create feedback" 
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);
```

### TypeScript Types

```typescript
interface Feedback {
  id: string;
  message: string;
  status: 'new' | 'resolved';
  url: string;
  follow_up: boolean;
  user_id: string;
  user_email: string;
  created_at: string;
  updated_at: string;
}
```

## Implementation Phases

### Phase 1: Database Setup
1. **Create Supabase migration**
   - Add feedback table with constraints
   - Create performance indexes
   - Set up RLS policies
   - Apply migration to Supabase

2. **Update TypeScript types** 
   - Add Feedback interface to existing types
   - Update any type exports

### Phase 2: Core Components
1. **Build FeedbackTab component** (`src/components/FeedbackTab.tsx`)
   - Fixed positioning with NotZero styling
   - Simple modal trigger
   - Show only when authenticated

2. **Build FeedbackModal component** (`src/components/FeedbackModal.tsx`)
   - Form with textarea and checkbox
   - Auto-capture URL and user info
   - Basic validation
   - Loading states

3. **Create feedback service** (`src/services/feedbackService.ts`)
   - Direct Supabase client integration
   - Authentication checks
   - Error handling

4. **Integrate into app**
   - Add FeedbackTab to App.tsx for authenticated users
   - Import required components

### Phase 3: Admin Interface
1. **Create admin page** (`src/pages/admin/FeedbackPage.tsx`)
   - Simple table view of feedback
   - Status filtering (new/resolved)
   - Mark as resolved functionality

2. **Update navigation**
   - Add admin link to Navigation component
   - Show only for admin users (check email)

### Phase 4: Testing & Polish
1. **Manual testing**
   - Test submission flow
   - Verify admin access
   - Check RLS policies

2. **UI polish**
   - Ensure consistent styling
   - Add appropriate feedback messages
   - Mobile responsiveness

## Key Features & Benefits

### User Experience
- **Simple feedback**: Always accessible from any page
- **Context preservation**: Auto-captures page URL
- **Minimal friction**: Just type and submit
- **Optional follow-up**: User can request response

### Admin Experience  
- **Central location**: All feedback in one place
- **Simple workflow**: New → Resolved
- **Context included**: URL and user info
- **Quick actions**: Mark as resolved with one click

### Technical Features
- **Secure**: RLS policies control access
- **Fast**: Indexed database queries
- **Type-safe**: TypeScript throughout
- **Simple**: Direct Supabase integration

## File Structure
```
notzero/
├── src/
│   ├── components/
│   │   ├── FeedbackTab.tsx      # Fixed-position feedback trigger
│   │   └── FeedbackModal.tsx    # Submission form
│   │
│   ├── pages/
│   │   └── admin/
│   │       └── FeedbackPage.tsx # Admin management interface
│   │
│   ├── services/
│   │   └── feedbackService.ts   # Supabase integration
│   │
│   └── types/
│       └── feedback.ts          # Feedback types

└── supabase/
    └── migrations/
        └── add_feedback_system.sql  # Database schema
```

## Integration Points

### Authentication
- Uses existing Supabase auth from AuthContext
- User session check for visibility
- Admin check via email list in config

### UI Consistency  
- Matches NotZero green color scheme
- Uses existing component patterns
- Consistent with dashboard styling

### Data Architecture
- Simple single-tenant model
- Standard RLS policies
- Direct Supabase queries

## Admin Configuration

Add admin emails to environment variables or config:
```typescript
// src/services/config.ts
export const ADMIN_EMAILS = [
  'admin@example.com',
  // Add admin emails here
];
```

## Simple Implementation Checklist

- [ ] Create database migration
- [ ] Add feedback types
- [ ] Build FeedbackTab component
- [ ] Build FeedbackModal component
- [ ] Create feedbackService
- [ ] Add to App.tsx
- [ ] Build admin page
- [ ] Update Navigation for admin
- [ ] Test submission flow
- [ ] Test admin access

This simplified feedback system provides an easy way for NotZero users to submit feedback while keeping the implementation straightforward and aligned with the existing codebase architecture.
 