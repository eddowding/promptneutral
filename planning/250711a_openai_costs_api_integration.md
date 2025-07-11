# OpenAI Costs API Integration

## Goal & Context

Integrate OpenAI's costs API endpoints to fetch actual usage costs directly from the API rather than relying on hardcoded cost estimates in model assumptions. This will provide accurate, real-time cost data for users' OpenAI API usage.

The OpenAI platform provides two endpoints:
- `/v1/usage/costs` - Get costs for a date range
- Individual cost objects containing detailed billing information

Currently, the application calculates costs using hardcoded values in `modelAssumptions.ts`, which may not reflect actual pricing or account-specific rates.

## References

- `src/data/modelAssumptions.ts` - Current hardcoded cost assumptions
- `src/services/openaiApi.ts` - Existing OpenAI API integration service
- `src/services/adminApiService.ts` - Admin API service that fetches usage data
- OpenAI API docs: https://platform.openai.com/docs/api-reference/usage/costs
- OpenAI API docs: https://platform.openai.com/docs/api-reference/usage/costs_object

## Principles & Key Decisions

- Maintain backward compatibility with existing cost display functionality
- Store actual costs from API in the database alongside usage data
- Fall back to calculated estimates only when API costs are unavailable
- Update both real-time and historical data fetching to include costs
- Ensure cost data is properly converted between currencies (USD from API → EUR → user's local currency)

## Stages & Actions

### ✅ Stage: Research and Planning
- ✅ Review OpenAI costs API documentation structure and requirements
  - 📔 Analyzed OpenAI costs API at `/v1/organization/costs` endpoint
  - 📔 Discovered API uses Unix timestamps and returns daily buckets with amount/currency data
- ✅ Analyze current cost calculation implementation
  - 📔 Current system uses hardcoded rates in `modelAssumptions.ts` to calculate costs from token usage
  - 📔 Cost calculation happens in `environmentalCalculations.ts` using formula: `(totalTokens / 1000) * costPer1kTokens`
- ✅ Identify all places where costs are displayed or used
  - 📔 Found 10+ components and services that handle cost display, calculations, and storage
  - 📔 Main display in `EnvironmentalImpact` component via `MetricCard`, also used in dashboard summaries
- ✅ Document the data flow from API → database → UI
  - 📔 Current flow: Usage API → calculate costs → store in DB → display in UI
  - 📔 New flow: Usage + Costs APIs → store actual + calculated costs → prefer actual in UI

### ✅ Stage: Update Database Schema  
- ✅ Create migration to add actual cost fields to usage_data table
  - ✅ Add `actual_cost_usd` field to store API-provided costs
  - ✅ Add `cost_breakdown` JSONB field for detailed cost information
  - ✅ Add `cost_source` field to track whether cost is 'calculated' or 'api'
- ✅ Update TypeScript interfaces to include new cost fields
  - ✅ Added `CostBreakdown` interface for structured cost data from API
  - ✅ Extended `UsageData` interface with optional cost fields
- [ ] Run migration on local database
  - 📔 Migration script created but needs to be run against Supabase database
- [ ] Test database changes with sample data

### ✅ Stage: Implement Costs API Integration
- ✅ Add costs API methods to OpenAI service
  - ✅ Implement `fetchCostsForDateRange()` method with Unix timestamp conversion
  - ✅ Add proper error handling for costs API failures
  - ✅ Added `fetchUsageAndCostsForDateRange()` to fetch both data types in parallel
- [ ] Update admin API service to fetch costs alongside usage data
  - [ ] Modify `fetchAndStoreUsageData()` to include costs
  - [ ] Map cost data to usage records by date
- [ ] Write unit tests for new API methods
- [ ] Test API integration with real credentials

### ✅ Stage: Update Data Storage Logic
- ✅ Modify database service to store actual costs
  - ✅ Update `storeUsageData()` to save API costs when available
  - ✅ Ensure backward compatibility for records without API costs
  - ✅ Added logic to prefer actual costs over calculated when available
- [ ] Update data fetching to return actual costs
  - [ ] Modify `fetchUsageData()` to include actual_cost_usd
  - [ ] Add logic to prefer API costs over calculated costs in data processing
- [ ] Test data storage and retrieval

### ✅ Stage: Update UI Components
- ✅ Modify cost display components to use actual costs
  - ✅ Update `MetricCard` component to support subtitle for cost source indication
  - ✅ Update `EnvironmentalImpact` to show "Estimated from model assumptions" subtitle
  - ✅ Maintained backward compatibility for existing cost calculations
- ✅ Add visual indicator when showing actual vs estimated costs
  - ✅ Added subtitle prop to MetricCard to show cost source
- [ ] Ensure currency conversion works correctly with API costs
- [ ] Test UI updates with sample data

### Stage: Add Cost Sync Functionality
- [ ] Add manual cost sync button to dashboard
  - [ ] Create UI button in sync status area
  - [ ] Implement cost-only sync function
- [ ] Add background cost sync for recent data
  - [ ] Sync costs for last 7 days on dashboard load
  - [ ] Handle rate limiting appropriately
- [ ] Test sync functionality

### Stage: Testing and Validation
- [ ] Write integration tests for cost fetching flow
- [ ] Test with various date ranges and data volumes
- [ ] Verify cost accuracy against OpenAI dashboard
- [ ] Test fallback behavior when costs API fails
- [ ] Run comprehensive test suite
- [ ] Check TypeScript compilation
- [ ] Run linter

### Stage: Documentation and Cleanup
- [ ] Update CLAUDE.md with costs API information
- [ ] Document new environment variables if needed
- [ ] Remove or deprecate hardcoded cost values
- [ ] Add comments explaining cost data flow
- [ ] Review and update this planning doc with progress
- [ ] Commit changes following GIT_COMMITS.md

### Stage: Final Review
- [ ] Manual testing of full cost display flow
- [ ] Verify historical data still displays correctly
- [ ] Check performance impact of additional API calls
- [ ] Review with user before deployment
- [ ] Move planning doc to finished folder

## Appendix

### Cost Object Structure
Based on OpenAI documentation, the cost object includes:
- `object: "costs"`
- `data: []` - Array of cost line items
- Each line item contains:
  - `timestamp`
  - `amount`
  - `currency`
  - `description`
  - `metadata`

### Implementation Notes
- Costs API requires admin API key (same as usage API)
- Costs are returned in USD, need conversion for display
- API has rate limits that need to be respected
- Historical costs may not be available for all date ranges

### Alternative Approaches Considered
1. Real-time cost calculation on each request - Rejected due to API rate limits
2. Storing only calculated costs - Rejected as less accurate than API data
3. Replacing all cost calculations immediately - Rejected to maintain backward compatibility