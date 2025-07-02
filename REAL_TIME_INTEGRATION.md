# Real-Time Data Integration for PromptNeutral

## Overview

PromptNeutral now features a comprehensive real-time data integration system that connects the dashboard to live usage data from OpenAI's API and stores it in Supabase for fast access and real-time updates.

## Key Features Implemented

### 1. Database Layer (`/src/services/databaseService.ts`)
- **Data Storage**: Stores usage data with environmental impact calculations
- **Data Retrieval**: Efficient querying with date range filtering
- **Real-time Subscriptions**: Live updates via Supabase realtime
- **Data Aggregation**: Pre-calculated metrics for dashboard performance
- **Cost Estimation**: Automatic cost calculation based on model usage

### 2. Enhanced OpenAI API Integration (`/src/services/openaiApi.ts`)
- **Database Integration**: Automatic storage of fetched data
- **Smart Caching**: Avoids duplicate API calls with database-first approach
- **Dual Data Sources**: Supports both direct API and database queries
- **Error Handling**: Graceful fallbacks and retry logic

### 3. Real-Time Data Hook (`/src/hooks/useUsageData.ts`)
- **Intelligent Data Fetching**: Database-first with API fallback
- **Real-time Updates**: Live subscriptions to data changes
- **Manual Sync Control**: User-triggered data synchronization
- **Authentication Aware**: Adapts behavior based on user state

### 4. Automatic Synchronization (`/src/services/syncService.ts`)
- **Periodic Sync**: Configurable automatic data fetching
- **Smart Intervals**: Adjusts sync frequency based on data freshness
- **Rate Limiting**: Respects OpenAI API limits
- **Status Tracking**: Comprehensive sync status monitoring
- **Multi-user Support**: Manages sync for multiple authenticated users

### 5. Error Handling & Validation (`/src/utils/errorHandling.ts`)
- **Comprehensive Error Types**: Specific error codes for different failure modes
- **Retry Logic**: Exponential backoff for transient failures
- **User-Friendly Messages**: Clear error communication
- **Input Validation**: Data integrity checks

### 6. Data Migration System (`/src/utils/dataMigration.ts`)
- **Seamless Transition**: Smooth migration from sample to real data
- **Baseline Setup**: Sample data as fallback during onboarding
- **Status Tracking**: Migration progress monitoring
- **Data Export/Import**: Backup and restore capabilities

### 7. Supabase Authentication Integration
- **Real Authentication**: Replaces localStorage with Supabase Auth
- **User Profiles**: Comprehensive user data management
- **Session Management**: Automatic session handling
- **Multi-environment Support**: Works with or without Supabase configuration

### 8. Real-Time Dashboard Updates
- **Live Sync Status**: Visual indication of data freshness
- **Manual Sync Control**: User-initiated data refresh
- **Connection Monitoring**: Real-time connection status
- **Progressive Enhancement**: Graceful degradation when services unavailable

## Database Schema

The system uses the following Supabase tables:

### `usage_data`
```sql
CREATE TABLE usage_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  model TEXT NOT NULL,
  requests INTEGER NOT NULL,
  context_tokens BIGINT NOT NULL,
  generated_tokens BIGINT NOT NULL,
  cost DECIMAL(10,4) NOT NULL,
  co2_grams DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, model)
);
```

### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT,
  industry TEXT,
  team_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### OpenAI API Key Storage
The system supports multiple ways to provide OpenAI API keys:
1. Environment variables (for development)
2. User-specific encrypted storage in Supabase
3. Runtime configuration via onboarding

## Usage

### Basic Integration
```typescript
import { useUsageData } from '../hooks/useUsageData';

function Dashboard() {
  const { 
    data, 
    data30Days, 
    loading, 
    error, 
    usingSampleData,
    syncData,
    lastSyncTime 
  } = useUsageData(true);

  // Data is automatically real-time and cached
  // syncData() can be called for manual refresh
}
```

### Manual Sync Control
```typescript
import { SyncService } from '../services/syncService';

const syncService = SyncService.getInstance();

// Start automatic sync for a user
await syncService.startAutoSync(userId, 60); // 60 minutes interval

// Manual sync
await syncService.performSync(userId);

// Check sync status
const status = syncService.getSyncStatus(userId);
```

### Data Migration
```typescript
import { DataMigrationService } from '../utils/dataMigration';

const migrationService = DataMigrationService.getInstance();

// Migrate user from sample to real data
await migrationService.migrateUserData(userId, (status) => {
  console.log(`Migration: ${status.step} - ${status.progress}%`);
});
```

## Real-Time Features

### 1. Live Data Updates
- Dashboard automatically updates when new data is synced
- Real-time subscriptions to database changes
- Instant reflection of API key configuration changes

### 2. Sync Status Monitoring
- Visual indicators for sync status
- Last sync time display
- Error state handling
- Connection status monitoring

### 3. Progressive Data Loading
- Database-first approach for instant loading
- Background API sync for fresh data
- Graceful handling of partial data

## Error Handling

### Network Failures
- Automatic retry with exponential backoff
- Graceful degradation to cached data
- User notification of connectivity issues

### API Limits
- Rate limiting compliance
- Queue management for multiple users
- Intelligent batching of requests

### Data Integrity
- Input validation at all levels
- Duplicate detection and handling
- Rollback capabilities for failed operations

## Performance Optimizations

### 1. Database Optimizations
- Efficient indexing on user_id, date, and model
- Aggregated views for common queries
- Automatic cleanup of old data

### 2. Caching Strategy
- Database as primary cache
- Browser localStorage for session data
- Intelligent cache invalidation

### 3. Real-time Efficiency
- Selective real-time subscriptions
- Batched updates to prevent UI thrashing
- Optimistic UI updates

## Security

### 1. API Key Protection
- Encrypted storage in Supabase
- User-specific key isolation
- Automatic key validation

### 2. Data Access Control
- Row-level security (RLS) policies
- User-specific data isolation
- Audit logging for sensitive operations

### 3. Authentication
- Supabase Auth integration
- Session management
- Automatic token refresh

## Monitoring & Analytics

### 1. Sync Statistics
- Success/failure rates
- Average sync times
- User engagement metrics

### 2. Error Tracking
- Comprehensive error logging
- Performance monitoring
- User experience metrics

### 3. Usage Analytics
- API usage patterns
- Cost optimization insights
- Environmental impact tracking

## Future Enhancements

### Planned Features
1. **WebSocket Fallback**: Direct WebSocket connections for enhanced real-time capabilities
2. **Offline Support**: Local data caching and sync when connection restored
3. **Advanced Analytics**: ML-powered usage predictions and optimization suggestions
4. **Multi-Provider Support**: Integration with additional AI service providers
5. **Team Collaboration**: Shared dashboards and team-level analytics

### Performance Improvements
1. **Background Sync**: Service worker-based background synchronization
2. **Incremental Updates**: Delta synchronization for large datasets
3. **Predictive Caching**: Pre-load data based on usage patterns

## Troubleshooting

### Common Issues

1. **No Real-Time Updates**
   - Verify Supabase realtime is enabled
   - Check user authentication status
   - Ensure proper subscription cleanup

2. **Sync Failures**
   - Validate OpenAI API key
   - Check network connectivity
   - Review error logs for specific issues

3. **Performance Issues**
   - Monitor database query performance
   - Check for proper indexing
   - Review real-time subscription load

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug_sync', 'true');
```

This provides detailed console logging for all sync operations and real-time events.