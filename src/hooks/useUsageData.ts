import { useState, useEffect, useCallback } from 'react';
import { UsageReport, ChartDataPoint, DailySummary } from '../types/usage';
import { OpenAIApiService } from '../services/openaiApi';
import { DatabaseService } from '../services/databaseService';
import { UsageDataService } from '../services/usageDataService';
import { useAuth } from '../contexts/AuthContext';

interface UseUsageDataReturn {
  data: UsageReport | null;
  data30Days: UsageReport | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  syncData: () => Promise<void>;
  syncCosts: () => Promise<void>;
  lastSyncTime: Date | null;
  fetchCustomRange: (range: '7d' | '30d' | '90d' | 'all') => Promise<UsageReport | null>;
}

export const useUsageData = (useLiveData: boolean = true): UseUsageDataReturn => {
  const [data, setData] = useState<UsageReport | null>(null);
  const [data30Days, setData30Days] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const { user, isLoading: authLoading } = useAuth();
  const apiService = OpenAIApiService.getInstance();
  const databaseService = DatabaseService.getInstance();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (useLiveData && user) {
        console.log('Attempting to fetch real data from database...');
        
        try {
          // Use the new UsageDataService to get data
          const [chartData7, chartData30] = await Promise.all([
            UsageDataService.getChartData(user.id, 7),
            UsageDataService.getChartData(user.id, 30),
          ]);

          // Convert chart data to the expected UsageReport format
          const formatAsUsageReport = (chartData: ChartDataPoint[]): UsageReport => {
            const report: UsageReport = {};
            
            chartData.forEach(item => {
              if (!report[item.date]) {
                report[item.date] = {};
              }
              
              const dayUsage = report[item.date];
              if ('error' in dayUsage) return; // Skip if it's an error object
              
              if (!dayUsage[item.model]) {
                dayUsage[item.model] = {
                  requests: 0,
                  context_tokens: 0,
                  generated_tokens: 0
                };
              }
              
              dayUsage[item.model].requests += item.requests;
              dayUsage[item.model].context_tokens += item.context_tokens;
              dayUsage[item.model].generated_tokens += item.generated_tokens;
            });
            
            return report;
          };

          const dbData7 = formatAsUsageReport(chartData7);
          const dbData30 = formatAsUsageReport(chartData30);

          // Check if we have sufficient data
          const hasRecentData = Object.keys(dbData7).length > 0;
          
          if (hasRecentData) {
            console.log('✓ Using data from database');
            setData(dbData7);
            setData30Days(dbData30);
            
            // Update last sync time
            const fetchStatus = await UsageDataService.getLastFetchStatus(user.id);
            setLastSyncTime(fetchStatus ? new Date(fetchStatus.last_fetched) : null);
          } else {
            // No data in database, suggest using admin API
            console.log('No data in database. Please configure admin API key and fetch data.');
            setError('No usage data found. Please add your OpenAI admin key in Settings and fetch your usage data.');
            setData(null);
            setData30Days(null);
          }
        } catch (dbError) {
          console.warn('Database fetch failed:', dbError);
          setError('Failed to load usage data. Please check your admin API key configuration.');
          setData(null);
          setData30Days(null);
        }
      } else if (useLiveData && !user) {
        console.log('No user authenticated');
        setError('Please sign in to view usage data');
        setData(null);
        setData30Days(null);
      } else {
        setData(null);
        setData30Days(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching data:', errorMessage);
      setError(errorMessage);
      
      // Clear data on error
      console.warn('All data sources failed:', errorMessage);
      setData(null);
      setData30Days(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromApi = async () => {
    // Test connection first
    const isConnected = await apiService.testConnection();
    console.log('API connection test result:', isConnected);
    
    if (!isConnected) {
      throw new Error('Failed to connect to OpenAI API');
    }
    
    const [liveData7, liveData30] = await Promise.all([
      apiService.fetchLast7DaysUsage(),
      apiService.fetchLast30DaysUsage(),
    ]);
    console.log('Live data fetched from API (7 days):', liveData7);
    console.log('Live data fetched from API (30 days):', liveData30);
    setData(liveData7);
    setData30Days(liveData30);
  };

  const syncFromApi = async () => {
    if (!user) {
      throw new Error('User not authenticated for data sync');
    }

    console.log('🔄 Syncing data from OpenAI API to database...');
    
    // Sync data to database
    await apiService.syncDataToDatabase(user.id, 30); // Sync 30 days
    
    // Fetch the newly synced data
    const [dbData7, dbData30] = await Promise.all([
      apiService.fetchUsageFromDatabase(user.id, 7),
      apiService.fetchUsageFromDatabase(user.id, 30),
    ]);
    
    setData(dbData7);
    setData30Days(dbData30);
    
    // Update last sync time
    const syncTime = await databaseService.getLastSyncTime(user.id);
    setLastSyncTime(syncTime);
    
    console.log('✅ Data sync completed successfully');
  };

  const syncData = async () => {
    if (!user) {
      console.warn('Cannot sync data: user not authenticated');
      return;
    }

    try {
      setError(null);
      // Import the fetch function from adminApiService
      const { fetchAndStoreUsageData } = await import('../services/adminApiService');
      
      console.log('🔄 Syncing data using admin API...');
      const result = await fetchAndStoreUsageData(user.id, true);
      
      if (result.success) {
        console.log('✅ Data sync completed successfully');
        // Refresh the data
        await fetchData();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error syncing data:', errorMessage);
      setError(errorMessage);
    }
  };

  const syncCosts = async () => {
    if (!user) {
      console.warn('Cannot sync costs: user not authenticated');
      return;
    }

    try {
      setError(null);
      console.log('💰 Syncing costs data...');
      
      // Sync costs for the last 7 days
      await apiService.syncCostsForRecentData(user.id, 7);
      
      console.log('✅ Cost sync completed successfully');
      // Refresh the data to show updated costs
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error syncing costs:', errorMessage);
      setError(errorMessage);
    }
  };

  const fetchCustomRange = useCallback(async (range: '7d' | '30d' | '90d' | 'all'): Promise<UsageReport | null> => {
    if (!user) {
      console.warn('Cannot fetch custom range: user not authenticated');
      return null;
    }

    try {
      let days: number;
      switch (range) {
        case '7d':
          days = 7;
          break;
        case '30d':
          days = 30;
          break;
        case '90d':
          days = 90;
          break;
        case 'all':
          // Fetch maximum historical data
          console.log('📊 Fetching all historical data...');
          const allData = await apiService.fetchMaximumHistoricalData(user.id);
          return allData;
        default:
          days = 30;
      }

      console.log(`📊 Fetching ${days} days of data...`);
      const rangeData = await apiService.fetchUsageFromDatabase(user.id, days);
      return rangeData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching custom range:', errorMessage);
      setError(errorMessage);
      return null;
    }
  }, [user]);

  useEffect(() => {
    // Don't fetch data while auth is still loading
    if (authLoading) {
      console.log('useUsageData: Waiting for auth to complete...');
      return;
    }
    
    console.log('useUsageData: Auth complete, fetching data. User:', user?.id);
    fetchData();
  }, [useLiveData, user?.id, authLoading]);

  // Set up real-time subscription when user is authenticated and using live data
  useEffect(() => {
    if (!user || !useLiveData) return;

    console.log('🔴 Setting up real-time subscription for usage data updates');

    const subscription = databaseService.subscribeToUsageUpdates(user.id, (payload) => {
      console.log('📡 Real-time update received:', payload);
      
      // Refetch data when changes are detected
      fetchData();
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔴 Cleaning up real-time subscription');
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user?.id, useLiveData]);

  // Trigger background historical data fetch on first load
  useEffect(() => {
    if (!user || !useLiveData || loading) return;

    // Start background fetch after initial data is loaded
    const startBackgroundFetch = async () => {
      console.log('🚀 Initiating background historical data fetch...');
      try {
        await apiService.fetchHistoricalDataInBackground(user.id, () => {
          console.log('✅ Background historical data fetch completed');
          // Optionally refresh data to show new historical data
          // fetchData();
        });
      } catch (error) {
        console.error('Error in background fetch:', error);
      }
    };

    // Delay background fetch to not interfere with initial load
    const timer = setTimeout(startBackgroundFetch, 5000);
    
    return () => clearTimeout(timer);
  }, [user?.id, useLiveData, loading]);

  return {
    data,
    data30Days,
    loading,
    error,
    refetch: fetchData,
    syncData,
    syncCosts,
    lastSyncTime,
    fetchCustomRange,
  };
};