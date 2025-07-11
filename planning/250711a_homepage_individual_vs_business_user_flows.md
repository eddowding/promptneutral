# Homepage Redesign: Individual vs Business User Flows

## Goal, context

Redesign the homepage to clearly differentiate between business API users and individual users, since the carbon calculation primarily makes sense for businesses with significant AI API usage. The current homepage is business-focused but doesn't acknowledge that individuals have minimal AI footprints.

**Key changes needed:**
1. Add a compact "For Individuals" option at the top offering guilt-free AI for ~$5/month with subscription setup
2. Clarify that the main calculation is designed for businesses using AI APIs
3. Create different user journeys for individuals vs businesses
4. Update messaging to be more targeted to each audience

## References

- `src/pages/HomePage.tsx` - Current homepage that needs restructuring
- `src/pages/OnboardingPage.tsx` - Current onboarding flow that may need individual variant
- `src/pages/PricingPage.tsx` - May need individual pricing tier
- `src/components/onboarding/` - Existing onboarding components that may need individual versions

## Principles, key decisions

- **User segmentation**: Clear distinction between individual users (small footprint) and business users (API usage tracking)
- **Value proposition clarity**: Individuals get simple per-service subscription for guilt-free AI, businesses get precise API tracking and neutralization
- **Individual subscription model**: Per AI service subscriptions (OpenAI = one subscription, Claude = another, etc.) at ~$5 equivalent each
- **Different onboarding flows**: Streamlined subscription flow for individuals, detailed API integration for businesses
- **Prominent individual option**: Compact box at top of page for individuals, but don't let it dominate the business-focused content
- **Currency handling**: Use existing CurrencyContext for local currency display (~$5 equivalent)
- **Payment integration**: Route through existing 'fake' payment process for now
- **Branding approach**: Keep consistent 430xai branding but differentiate as "Individual Plans" vs "Business Solutions"

## Stages & actions

### Stage: Research and planning foundation
- [ ] Create a Git branch for this work: `250711a_homepage_individual_business_flows`
- [ ] Research current currency handling in the app to understand how to display local currency pricing
  - [ ] Check `src/contexts/CurrencyContext.tsx` and `src/services/currencyService.ts`
  - [ ] Understand how currency conversion works for individual pricing
- [ ] Analyze current onboarding flow to understand what needs to be modified for individuals
  - [ ] Review `src/components/onboarding/` components
  - [ ] Document current business onboarding steps
- [ ] Review current pricing structure to understand how to add individual tier
  - [ ] Check `src/pages/PricingPage.tsx` for current business pricing
  - [ ] Determine if individual pricing needs database changes

### Stage: Design individual user flow wireframes
- [ ] Create wireframes for the new homepage layout
  - [ ] Design compact "For Individuals" box placement
  - [ ] Plan business vs individual content differentiation
  - [ ] Design individual subscription flow mockups
- [ ] Stop and review wireframes with user before implementation

### Stage: Update homepage layout and messaging
- [ ] Write tests for homepage component updates before making changes
- [ ] Update `src/pages/HomePage.tsx` to add individual user section
  - [ ] Add compact "For Individuals" box at top with local currency pricing
  - [ ] Update hero section messaging to clarify business focus
  - [ ] Add clear call-to-action routing for individuals vs businesses
  - [ ] Update "How It Works" section to mention this is for business API usage
- [ ] Run type checking after homepage changes: `npm run typecheck`

### Stage: Create individual subscription flow
- [ ] Write tests for individual onboarding flow
- [ ] Create individual-specific onboarding components
  - [ ] `src/components/onboarding/IndividualWelcomeStep.tsx` - Simple welcome for individuals
  - [ ] `src/components/onboarding/IndividualSubscriptionStep.tsx` - Subscription setup
  - [ ] `src/components/onboarding/IndividualPaymentStep.tsx` - Payment processing
- [ ] Create individual onboarding page or route variant
  - [ ] Add routing for individual onboarding flow
  - [ ] Integrate with existing payment/subscription infrastructure
- [ ] Update existing onboarding to handle business vs individual routing
- [ ] Run type checking after onboarding changes: `npm run typecheck`

### Stage: Update pricing page for individual tier
- [ ] Write tests for pricing page updates
- [ ] Update `src/pages/PricingPage.tsx` to include individual pricing tier
  - [ ] Add individual subscription option with local currency
  - [ ] Clearly differentiate individual vs business features
  - [ ] Update pricing comparison table
- [ ] Run type checking after pricing changes: `npm run typecheck`

### Stage: Implement currency localization for individuals
- [ ] Extend currency service to handle individual pricing in local currency
  - [ ] Update `src/services/currencyService.ts` if needed
  - [ ] Ensure $5 equivalent calculation works correctly
- [ ] Test currency display across different locales
- [ ] Run type checking after currency changes: `npm run typecheck`

### Stage: Update navigation and routing
- [ ] Write tests for routing changes
- [ ] Update navigation components to handle individual vs business flows
  - [ ] Update `src/components/Navigation.tsx` if needed
  - [ ] Ensure proper routing between individual and business flows
- [ ] Add route guards or logic to maintain user flow context
- [ ] Run type checking after navigation changes: `npm run typecheck`

### Stage: Integration testing and polish
- [ ] Test complete individual user flow end-to-end
  - [ ] Homepage → Individual signup → Subscription → Payment
- [ ] Test complete business user flow end-to-end
  - [ ] Homepage → Business onboarding → API integration
- [ ] Cross-browser testing for new layouts
- [ ] Mobile responsiveness testing for individual box and new layouts
- [ ] Run full test suite: check if project has test command in package.json
- [ ] Run linting: `npm run lint`
- [ ] Run build verification: `npm run build`

### Stage: Final review and deployment
- [ ] Stop and review complete implementation with user
- [ ] Address any feedback or adjustments
- [ ] Final type checking: `npm run typecheck` 
- [ ] Final linting: `npm run lint`
- [ ] Final build: `npm run build`
- [ ] Git commit all changes following project commit guidelines
- [ ] Ask user permission to merge back to main
- [ ] Move this planning doc to `planning/finished/` and commit

# Appendix

## Current Homepage Analysis
The current homepage is entirely business-focused with features like:
- "Connect Your AI Services" 
- API integration messaging
- Real-time monitoring dashboard
- Compliance and audit features
- Team management

## Individual vs Business Value Props
**Individuals:**
- Simple per-service subscriptions (~$5/month each) for guilt-free AI usage
- Choose which AI services to offset (OpenAI, Claude, etc.)
- No need for API tracking or complex setup
- Peace of mind for personal AI consumption
- One-click subscription process per service

**Businesses:**
- Precise API usage tracking and carbon calculation
- Real-time monitoring and compliance features
- Team management and enterprise features
- Detailed analytics and reporting
- Comprehensive multi-service integration

## Technical Considerations
- Need to maintain existing business functionality
- Individual flow should be much simpler than business flow
- Currency conversion for local pricing display
- Payment processing for subscription vs usage-based billing
- Different onboarding experiences while sharing core infrastructure

## User Journey Mockups
**Individual Journey:**
1. Homepage → See "For Individuals" box
2. Click → Simple welcome page explaining individual offering
3. Enter payment details → Subscription setup
4. Confirmation → Access to guilt-free AI commitment

**Business Journey:**
1. Homepage → See main business-focused content
2. Click "Get Started" → Current detailed onboarding
3. API integration → Usage tracking setup
4. Dashboard access → Full business features