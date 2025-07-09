# PromptNeutral Development Todo List

## Project Overview

**PromptNeutral** is a comprehensive AI carbon neutrality platform that helps businesses track, calculate, and automatically offset the carbon footprint of their AI operations in real-time. The platform provides EU Green Claims Directive compliant carbon tracking with verified credit retirement.

### Core Functionality
- **Real-time AI usage tracking** via OpenAI, Anthropic, Google AI APIs and others
- **Carbon footprint calculation** using peer-reviewed LCA methodologies
- **Automatic carbon credit retirement** with from a variety to crecdit types
- credit types are nature based, engineered removals, and energy attribution certificates.
- **Compliance reporting** for EU Green Claims Directive and other regulations
- **Dashboard analytics** with usage optimization recommendations

### Technical Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Recharts
- **Backend**: Supabase (Auth + Database + Real-time)
- **APIs**: OpenAI Usage API, Carbon credit marketplaces
- **Deployment**: Railway

### Key Value Propositions
1. **Instant Carbon Neutrality** - Automatic offset purchasing and retirement
2. **Regulatory Compliance** - EU directive compliant with audit trails
3. **Real-time Monitoring** - Live tracking of AI usage and emissions
4. **Scientific Accuracy** - Based on peer-reviewed research and real energy data
5. **Business Intelligence** - Usage optimization and cost reduction insights

### User Journey
1. **Signup/Login** → Supabase authentication
2. **Onboarding** → Connect AI services, set carbon goals, select offset projects (show demo content clearly labelled and inviting you to add your data to show real data)
3. **Dashboard** → Monitor real-time usage, carbon impact, and compliance status
4. **Optimization** → Receive recommendations to reduce footprint and costs
5. **Reporting** → Export compliance reports and certificates

### Current Status
- ✅ **MVP Complete**: Homepage, dashboard, carbon calculations, compliance features
- ✅ **Infrastructure**: Supabase setup, database schema, GitHub repository
- ✅ **Authentication**: Supabase auth implementation with demo mode fallback
- ✅ **Onboarding Flow**: Complete step-by-step user onboarding with API validation

---

## High Priority Tasks

### 🔐 Authentication & Database
- [x] **Setup Supabase project** - Configure Supabase project with auth and database
- [x] **Implement Supabase authentication** - Replace mock auth with real Supabase auth flows
- [x] **Design database schema** - Create tables for usage data, carbon credits, and user settings

### 🚀 Core Features
- [x] **Build step-by-step onboarding** - Guide new users through connecting AI services
- [ ] Support for AI services beyond OpenAI (Anthropic, Google, etc.)

### purchasing offsets
- [ ] get the maths right and cite sources. 
- [ ] **Carbon offset portfolio** - Project selection and portfolio management features
<!-- - [x] **Create GitHub repository** - Setup version control and deployment -->

### Superadmin Functionality To-Do

- [ ] Define superadmin role in database schema (e.g. add `is_superadmin` flag to user profiles)
- [ ] Implement Row Level Security (RLS) policies for superadmin access
- [ ] Add superadmin checks to backend API endpoints
- [ ] Create superadmin management UI (user list, promote/demote users)
- [ ] Restrict critical actions (e.g. deleting organisations, managing all data) to superadmins
- [ ] Add tests for superadmin permissions and flows
- [ ] Enable superadmin to view all organisations and users (complete visibility across the platform)
- [ ] Allow superadmin to suspend/activate accounts (handle policy violations or billing issues)
- [ ] Allow superadmin to access user dashboards (view any user's carbon tracking and usage data for support)
- [ ] Provide backup oversight (monitor data backup status and recovery procedures)
- [ ] Monitor integration health (Supabase, OpenAI API, carbon marketplace connections)
- [ ] Enable data export/deletion (handle GDPR requests, data portability)

#### Platform Analytics & Monitoring (Admin)
- [ ] Display global platform metrics (total users, API usage, carbon, energy use across all accounts)
- [ ] Implement performance monitoring (database health, API rate limiting, sync service status)
- [ ] Provide usage trend analysis (platform growth, popular AI models, carbon impact trends)
- [ ] Show revenue analytics (subscription metrics, carbon credit sales volumes)
- [ ] Set up system alerts (failed API syncs, unusual usage patterns, compliance violations)

#### Security & Compliance (Admin)
- [ ] Provide audit trail access (view all user actions, data changes, API key usage)
- [ ] Enable data export/deletion (handle GDPR requests, data portability)

#### Carbon Credit & Environmental Management (Admin)
- [ ] Manage carbon offset projects (add/remove/update available offset project types)
- [ ] Verify credit retirement (audit carbon credit purchases and retirement certificates)
- [ ] Update environmental calculations (modify CO2/kWh ratios as research evolves)
- [ ] Approve large offset purchases (review enterprise-level carbon credit transactions)
- [ ] Oversee environmental compliance (monitor EU Green Claims Directive adherence)

#### Business Intelligence (Admin)
- [ ] Track customer success metrics (user engagement, feature adoption, churn analysis)
- [ ] Provide carbon impact reporting (platform-wide environmental impact statistics)
- [ ] Conduct market analysis (carbon credit pricing trends, competitor monitoring)
- [ ] Optimise revenue (identify opportunities for pricing or feature improvements)



- [ ] imporve homepage content. 
- [ ] set up analytics 
- [ ] create feedback system - review and tweak @feedback.md before starting. 
- [ ] **Homepage animations** - Add smooth scroll animations and micro-interactions 
- [ ] **API documentation page** - Interactive docs with code examples

### 📊 Analytics & Management
- [ ] **Team dashboard** - User roles, permissions, and team collaboration
<!-- - [ ] **Notification system** - Carbon threshold alerts and compliance notifications -->
<!-- - [ ] **Advanced analytics** - Predictive analytics and usage forecasting -->
- [ ] **Compliance wizard** - Guided setup for different regulations (EU, US, etc.)

## Low Priority Tasks

### 🌙 Nice-to-Have Features 
- [ ] **Mobile responsive optimization** - Ensure all components work well on mobile/tablet

## Completed Tasks

### ✅ Recently Completed
- [x] **Homepage creation** - Built PromptNeutral landing page with hero, features, testimonials
- [x] **Dashboard implementation** - Complete carbon impact dashboard with charts and metrics
- [x] **Carbon calculations** - Environmental impact tracking with cost and CO2 calculations
- [x] **Compliance reporting** - EU Green Claims Directive compliance features
- [x] **Usage analytics** - 30-day stacked charts and optimization recommendations
- [x] **Data caching** - Local JSON caching to avoid API rate limits
- [x] **Navigation system** - React Router setup with clean page structure
- [x] **GitHub repository** - Created public repo at https://github.com/eddowding/promptneutral
- [x] **Supabase setup** - Added Supabase client configuration and dependencies
- [x] **Database schema** - Designed complete schema with RLS policies for profiles, usage_data, carbon_credits
- [x] **Authentication system** - Full Supabase auth with demo mode fallback (localStorage)
- [x] **Onboarding wizard** - 6-step user onboarding with profile, API validation, goals, and progress saving
- [x] **API key validation** - Real-time validation for OpenAI, Anthropic, and Google AI APIs
- [x] **Error handling** - Comprehensive error boundaries and user-friendly error notifications
- [x] **JSX syntax fixes** - Resolved compilation errors in OnboardingWizard component

## Technical Notes

### Dependencies Added
- ✅ `@supabase/supabase-js` - Supabase client library
- ✅ `@supabase/auth-ui-react` - Pre-built auth components
- ✅ `lucide-react` - Icon library for UI components

### Dependencies to Consider
- `framer-motion` - For smooth animations (optional)
- `react-hot-toast` - Better notification system
- `react-hook-form` - Enhanced form handling

### Database Schema (Implemented)
✅ Complete schema available in `_docs/supabase-onboarding-schema.sql`
- `profiles` - Extended user profiles with role, industry, team size
- `user_preferences` - Demo mode, timezone, currency, carbon goals
- `api_keys` - Encrypted storage for AI service API keys
- `onboarding_progress` - Step-by-step progress with auto-save
- `selected_projects` - Carbon offset project selections
- `usage_data` - AI usage tracking (existing)
- `carbon_credits` - Offset tracking (existing)

### Environment Variables Setup
✅ `.env.local` file created with template
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Demo Mode Access
🎯 **Ready to test immediately:**
- URL: http://localhost:3000
- Demo login: demo@promptneutral.com / demo123
- Full functionality without Supabase setup required

---

**Last Updated:** July 2025  
**Priority:** ✅ Core authentication and onboarding complete. Next: Real-time WebSocket integration