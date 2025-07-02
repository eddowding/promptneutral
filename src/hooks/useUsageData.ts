import { useState, useEffect } from 'react';
import { UsageReport } from '../types/usage';
import { OpenAIApiService } from '../services/openaiApi';
import { sampleUsageData } from '../data/sampleData';

interface UseUsageDataReturn {
  data: UsageReport | null;
  data30Days: UsageReport | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  usingSampleData: boolean;
}

export const useUsageData = (useLiveData: boolean = true): UseUsageDataReturn => {
  const [data, setData] = useState<UsageReport | null>(null);
  const [data30Days, setData30Days] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const apiService = OpenAIApiService.getInstance();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (useLiveData) {
        console.log('Attempting to fetch live data...');
        
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
        console.log('Live data fetched (7 days):', liveData7);
        console.log('Live data fetched (30 days):', liveData30);
        setData(liveData7);
        setData30Days(liveData30);
        setUsingSampleData(false);
      } else {
        console.log('Using sample data');
        // Use sample data (extend it to 30 days for demo)
        setData(sampleUsageData);
        setData30Days(sampleUsageData); // In a real app, you'd have 30-day sample data
        setUsingSampleData(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching data:', errorMessage);
      setError(errorMessage);
      
      // Fallback to sample data if live data fails
      if (useLiveData) {
        console.warn('Failed to fetch live data, falling back to sample data:', errorMessage);
        setData(sampleUsageData);
        setData30Days(sampleUsageData);
        setUsingSampleData(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [useLiveData]);

  return {
    data,
    data30Days,
    loading,
    error,
    refetch: fetchData,
    usingSampleData,
  };
};