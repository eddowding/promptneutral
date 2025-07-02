import { useState, useEffect } from 'react';
import { UsageReport } from '../types/usage';
import { OpenAIApiService } from '../services/openaiApi';
import { DatabaseService } from '../services/databaseService';
import { sampleUsageData } from '../data/sampleData';
import { useAuth } from '../contexts/AuthContext';

interface UseUsageDataReturn {
  data: UsageReport | null;
  data30Days: UsageReport | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  usingSampleData: boolean;
  syncData: () => Promise<void>;
  lastSyncTime: Date | null;
}

export const useUsageData = (useLiveData: boolean = true): UseUsageDataReturn => {
  const [data, setData] = useState<UsageReport | null>(null);
  const [data30Days, setData30Days] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const { user } = useAuth();
  const apiService = OpenAIApiService.getInstance();
  const databaseService = DatabaseService.getInstance();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (useLiveData && user) {
        console.log('Attempting to fetch real data from database...');
        
        // Try to fetch data from database first
        try {
          const [dbData7, dbData30] = await Promise.all([
            apiService.fetchUsageFromDatabase(user.id, 7),
            apiService.fetchUsageFromDatabase(user.id, 30),
          ]);

          // Check if we have sufficient data in database
          const hasRecentData = Object.keys(dbData7).length > 0;
          
          if (hasRecentData) {
            console.log('✓ Using data from database');
            setData(dbData7);
            setData30Days(dbData30);
            setUsingSampleData(false);
            
            // Update last sync time
            const syncTime = await databaseService.getLastSyncTime(user.id);
            setLastSyncTime(syncTime);
          } else {
            // No data in database, try to sync from OpenAI API
            console.log('No data in database, attempting to sync from OpenAI API...');
            await syncFromApi();
          }
        } catch (dbError) {
          console.warn('Database fetch failed, trying OpenAI API directly:', dbError);
          await fetchFromApi();
        }
      } else if (useLiveData && !user) {
        console.log('No user authenticated, trying OpenAI API directly...');
        await fetchFromApi();
      } else {
        console.log('Using sample data');
        setData(sampleUsageData);
        setData30Days(sampleUsageData);
        setUsingSampleData(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching data:', errorMessage);
      setError(errorMessage);
      
      // Fallback to sample data if everything fails
      console.warn('All data sources failed, falling back to sample data:', errorMessage);
      setData(sampleUsageData);
      setData30Days(sampleUsageData);
      setUsingSampleData(true);
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
    setUsingSampleData(false);
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
    setUsingSampleData(false);
    
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
      await syncFromApi();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error syncing data:', errorMessage);
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchData();
  }, [useLiveData, user?.id]);

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
      subscription.unsubscribe();
    };
  }, [user?.id, useLiveData]);

  return {
    data,
    data30Days,
    loading,
    error,
    refetch: fetchData,
    usingSampleData,
    syncData,
    lastSyncTime,
  };
};