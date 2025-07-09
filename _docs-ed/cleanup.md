# Code Cleanup Tasks

## TODO/FIXME Comments to Address

### 1. `src/services/adminApiService.ts`
- **Line 169-171**: Multiple `// @ts-ignore` comments for type mismatches with null values
  - Need to properly handle `null` vs `undefined` for `project_id`, `api_key_id`, and `batch`
  - Consider updating the `UsageData` interface to accept `null` values

### 2. `scripts/seed-supabase.js`
- **Line 24**: `// TODO: Add your Supabase URL and anon key`
  - This should be replaced with environment variable instructions
  - Update to use `process.env.SUPABASE_URL` and `process.env.SUPABASE_ANON_KEY`

### 3. `src/pages/SettingsPage.tsx`
- **Line 212**: Generic error handling with `// TODO: Better error handling`
  ```typescript
  } catch (error) {
    console.error('Error adding API key:', error);
    setError(error instanceof Error ? error.message : 'Failed to add API key');
  }
  ```
  - Should implement proper error types and user-friendly messages
  - Consider showing specific errors for validation vs storage failures

### 4. `debug-openai-api.js` (now deleted)
- Had multiple TODOs about API key handling - resolved by deletion

## Unused Imports and Dead Code

### 1. Deleted Components Still Referenced
- **`src/data/sampleData.ts`** - Deleted but check for imports in:
  - Previously used in dashboard components
  - May have references in test files
  
- **`src/components/DataSourceToggle.tsx`** - Deleted but was imported in:
  - `src/components/Navigation.tsx` (import already removed)

### 2. Unused Imports to Remove

#### `src/utils/dataMigration.ts`
- Entire file appears to be unused after transition to Supabase
- Contains functions for migrating from localStorage to Supabase
- Can be deleted if migration is complete

#### `src/contexts/AuthContext.tsx`
- Check if all imported types from `@supabase/supabase-js` are used
- Some auth-related imports might be redundant

### 3. Dead Code Patterns

#### Console.log Statements (100+)
Major offenders:
- `src/services/openaiApi.ts` - 46 console statements
- `src/hooks/useUsageData.ts` - 28 console statements  
- `src/pages/SettingsPage.tsx` - 21 console statements
- `src/contexts/AuthContext.tsx` - 13 console statements
- `src/utils/dataMigration.ts` - 18 console statements

These should be replaced with a proper logging service or removed entirely.

#### Commented Out Code
- Various files have commented-out code blocks that should be removed
- Example: Old API endpoint configurations, deprecated functions

### 4. Duplicate/Similar Code

#### Database Scripts in `/scripts/`
Multiple files doing similar things:
- `create-tables.js`
- `setup-database.js`
- `create-schema.js`
- `seed-supabase.js`

Should be consolidated into a single, well-documented setup script.

#### SQL Files in `/scripts/`
- `fix-demo-user-access.sql`
- `fix-demo-user-simple.sql`
- `fix-demo-user-settings.sql`
- `fix-demo-user-rls-only.sql`

These are variations of the same fix - should keep only the final working version.

### 5. Type Issues to Fix

#### `src/services/usageDataService.ts`
- Line 89: `endpoints_used` array contains `string | undefined` but interface expects `string[]`
- Should filter out undefined values or update the interface

#### `src/services/adminApiService.ts`
- Line 118: Type casting issue with `AdminUsageBucket`
- Missing required properties: `start_time`, `end_time`, `results`

#### `src/lib/supabase.ts`
- Multiple `'supabase' is possibly 'null'` errors
- Need to add null checks or use non-null assertion operator where appropriate

### 6. Dependencies to Review

Consider removing if unused:
- Check if all Recharts components are used
- Review if all Lucide icons are needed
- Verify Tailwind CSS utilities usage

## Recommended Cleanup Order

1. **High Priority**
   - Fix TypeScript errors preventing build
   - Remove or fix TODO comments
   - Fix type issues in services

2. **Medium Priority**
   - Remove console.log statements
   - Consolidate database scripts
   - Remove unused imports

3. **Low Priority**
   - Remove commented-out code
   - Optimize dependencies
   - Code style consistency

## Next Steps

1. Create a proper logging service to replace console.logs
2. Set up ESLint rules to catch unused imports
3. Configure TypeScript more strictly to catch these issues
4. Add pre-commit hooks to prevent these issues in the future