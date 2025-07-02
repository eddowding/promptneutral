# PromptNeutral Development Todo List

## High Priority Tasks

### 🔐 Authentication & Database
- [ ] **Setup Supabase project** - Configure Supabase project with auth and database
- [ ] **Implement Supabase authentication** - Replace mock auth with real Supabase auth flows
- [ ] **Design database schema** - Create tables for usage data, carbon credits, and user settings

### 🚀 Core Features
- [ ] **Build step-by-step onboarding** - Guide new users through connecting AI services
- [ ] **Real-time WebSocket connections** - Implement live carbon tracking updates
- [ ] **Integration marketplace** - Support for AI services beyond OpenAI (Anthropic, Google, etc.)
- [ ] **Carbon offset portfolio** - Project selection and portfolio management features
- [ ] **Create GitHub repository** - Setup version control and deployment

## Medium Priority Tasks

### 🎨 User Experience
- [ ] **Homepage animations** - Add smooth scroll animations and micro-interactions
- [ ] **Mobile responsive optimization** - Ensure all components work well on mobile/tablet
- [ ] **Enhanced data export** - Add PDF, CSV, Excel export with custom date ranges
- [ ] **API documentation page** - Interactive docs with code examples

### 📊 Analytics & Management
- [ ] **Team dashboard** - User roles, permissions, and team collaboration
- [ ] **Notification system** - Carbon threshold alerts and compliance notifications
- [ ] **Advanced analytics** - Predictive analytics and usage forecasting
- [ ] **Compliance wizard** - Guided setup for different regulations (EU, US, etc.)

## Low Priority Tasks

### 🌙 Nice-to-Have Features
- [ ] **Dark mode toggle** - Implement dark theme throughout the application

## Completed Tasks

### ✅ Recently Completed
- [x] **Homepage creation** - Built PromptNeutral landing page with hero, features, testimonials
- [x] **Dashboard implementation** - Complete carbon impact dashboard with charts and metrics
- [x] **Carbon calculations** - Environmental impact tracking with cost and CO2 calculations
- [x] **Compliance reporting** - EU Green Claims Directive compliance features
- [x] **Usage analytics** - 30-day stacked charts and optimization recommendations
- [x] **Data caching** - Local JSON caching to avoid API rate limits
- [x] **Navigation system** - React Router setup with clean page structure

## Technical Notes

### Dependencies to Add
- `@supabase/supabase-js` - Supabase client library
- `@supabase/auth-ui-react` - Pre-built auth components
- `framer-motion` - For smooth animations (optional)

### Database Schema (Planned)
```sql
-- Users table (handled by Supabase Auth)
-- usage_data table for storing API usage
-- carbon_credits table for offset tracking
-- integrations table for AI service connections
-- notifications table for alerts
```

### Environment Variables Needed
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

**Last Updated:** July 2025  
**Priority:** Focus on Supabase integration and core functionality first