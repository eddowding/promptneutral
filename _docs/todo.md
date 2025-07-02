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
- 🔄 **Next Phase**: Real authentication, live data integration, onboarding flow

---

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
<!-- - [ ] **Create GitHub repository** - Setup version control and deployment -->

## Medium Priority Tasks

### 🎨 User Experience
- [ ] **Homepage animations** - Add smooth scroll animations and micro-interactions
<!-- - [ ] **Enhanced data export** - Add PDF, CSV, Excel export with custom date ranges -->
- [ ] **API documentation page** - Interactive docs with code examples

### 📊 Analytics & Management
- [ ] **Team dashboard** - User roles, permissions, and team collaboration
<!-- - [ ] **Notification system** - Carbon threshold alerts and compliance notifications -->
<!-- - [ ] **Advanced analytics** - Predictive analytics and usage forecasting -->
- [ ] **Compliance wizard** - Guided setup for different regulations (EU, US, etc.)

## Low Priority Tasks

### 🌙 Nice-to-Have Features
- [ ] **Dark mode toggle** - Implement dark theme throughout the application
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