import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, MessageSquare, Zap, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { UsageChart } from '../components/UsageChart';
import { ModelBreakdown } from '../components/ModelBreakdown';
import { StackedUsageChart } from '../components/StackedUsageChart';
import { EnvironmentalImpact } from '../components/EnvironmentalImpact';
import { CarbonNeutralStatus } from '../components/CarbonNeutralStatus';
import { OptimizationRecommendations } from '../components/OptimizationRecommendations';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ExportButton } from '../components/ExportButton';
import { SimpleSyncStatus } from '../components/SimpleSyncStatus';
import { HistoricalDataSync } from '../components/HistoricalDataSync';
import { TimeRangeSelector } from '../components/TimeRangeSelector';
import { useUsageData } from '../hooks/useUsageData';
import { getDailySummaries, getModelTotals } from '../utils/dataProcessing';
import { calculateEnvironmentalImpact, prepareStackedChartData } from '../utils/environmentalCalculations';
import { UsageReport } from '../types/usage';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/databaseService';

export const DashboardPage: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(30); // Default to 30 days
  const [chartTimeRange, setChartTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [customRangeData, setCustomRangeData] = useState<UsageReport | null>(null);
  const [isLoadingCustomRange, setIsLoadingCustomRange] = useState(false);
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();
  const { data, data30Days, loading, error, refetch, syncData, syncCosts, lastSyncTime, fetchCustomRange } = useUsageData(true);

  // Combined sync function for both data and costs
  const handleCombinedSync = async () => {
    setIsSyncing(true);
    try {
      // Sync both data and costs in parallel
      await Promise.all([
        syncData(),
        syncCosts()
      ]);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle time range changes from the selector
  const handleTimeRangeChange = (days: number) => {
    setSelectedTimeRange(days);
    
    // Map to chart time range format
    let newChartTimeRange: '7d' | '30d' | '90d' | 'all';
    if (days === 7) newChartTimeRange = '7d';
    else if (days === 14) newChartTimeRange = '30d'; // Map 14 to 30d for now
    else if (days === 30) newChartTimeRange = '30d';
    else if (days === 60) newChartTimeRange = '90d'; // Map 60 to 90d for now
    else if (days === 90) newChartTimeRange = '90d';
    else newChartTimeRange = 'all';
    
    setChartTimeRange(newChartTimeRange);
  };

  // Handle time range changes
  useEffect(() => {
    const loadTimeRangeData = async () => {
      // Special handling for specific ranges
      if (selectedTimeRange === 7 && data) {
        // Use the already loaded 7-day data
        setCustomRangeData(null);
        setIsLoadingCustomRange(false);
        return;
      }
      
      if (selectedTimeRange === 30 && data30Days) {
        // Use the already loaded 30-day data
        setCustomRangeData(null);
        setIsLoadingCustomRange(false);
        return;
      }

      // For other ranges, fetch custom data
      setIsLoadingCustomRange(true);
      try {
        let rangeData: UsageReport | null = null;
        
        // Fetch the exact number of days requested
        if (selectedTimeRange === 14 || selectedTimeRange === 60) {
          // For 14 and 60 days, we need to fetch custom data
          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(Date.now() - (selectedTimeRange - 1) * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];
          
          if (user) {
            const databaseService = DatabaseService.getInstance();
            rangeData = await databaseService.fetchUsageData(user.id, startDate, endDate);
          }
        } else {
          // Use the existing fetchCustomRange for other ranges
          rangeData = await fetchCustomRange(chartTimeRange);
        }
        
        setCustomRangeData(rangeData);
      } catch (err) {
        console.error('Error fetching custom range:', err);
      } finally {
        setIsLoadingCustomRange(false);
      }
    };

    loadTimeRangeData();
  }, [selectedTimeRange, chartTimeRange, data, data30Days, user]); // Dependencies

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !data) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  if (!data || !data30Days) {
    return <ErrorMessage error="No data available" onRetry={refetch} />;
  }

  // Use the selected time range data for all calculations
  let displayData: UsageReport | null = null;
  if (selectedTimeRange === 7 && data) {
    displayData = data;
  } else if (selectedTimeRange === 30 && data30Days) {
    displayData = data30Days;
  } else if (customRangeData) {
    displayData = customRangeData;
  } else {
    displayData = data30Days || data;
  }
  
  const dailySummaries = displayData ? getDailySummaries(displayData) : [];
  const modelTotals = displayData ? getModelTotals(displayData) : {};
  
  // Calculate environmental impact and prepare charts using selected time range
  const environmentalImpact = displayData ? calculateEnvironmentalImpact(displayData) : calculateEnvironmentalImpact({});
  const stackedChartData = displayData ? prepareStackedChartData(displayData) : [];
  
  
  const totalRequests = dailySummaries.reduce((sum, day) => sum + day.total_requests, 0);
  const totalTokens = dailySummaries.reduce((sum, day) => sum + day.total_tokens, 0);
  const totalContextTokens = dailySummaries.reduce((sum, day) => sum + day.total_context_tokens, 0);
  const totalGeneratedTokens = dailySummaries.reduce((sum, day) => sum + day.total_generated_tokens, 0);
  
  const avgRequestsPerDay = Math.round(totalRequests / dailySummaries.length);
  const uniqueModels = Object.keys(modelTotals).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Carbon Impact Dashboard</h1>
            <p className="text-gray-600">Monitor your AI usage and environmental impact in real-time</p>
            {dailySummaries.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Data range: {dailySummaries[0]?.date} to {dailySummaries[dailySummaries.length - 1]?.date}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <SimpleSyncStatus 
              lastSyncTime={lastSyncTime}
              onSync={handleCombinedSync}
              isLoading={isSyncing}
            />
            <TimeRangeSelector 
              selectedRange={selectedTimeRange}
              onRangeChange={handleTimeRangeChange}
            />
            <ExportButton data={displayData} data30Days={data30Days} />
          </div>
        </div>


        <CarbonNeutralStatus impact={environmentalImpact} />
        
        {/* Loading overlay for custom time ranges */}
        {isLoadingCustomRange && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-3">
              <LoadingSpinner />
              <span className="text-gray-700">Loading {selectedTimeRange} days of data...</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Requests"
            value={totalRequests}
            icon={<MessageSquare />}
          />
          <MetricCard
            title="Total Tokens"
            value={totalTokens}
            icon={<Zap />}
          />
          <MetricCard
            title="Avg Requests/Day"
            value={avgRequestsPerDay}
            icon={<TrendingUp />}
          />
          <MetricCard
            title="Active Models"
            value={uniqueModels}
            icon={<Activity />}
            formatter={(value) => value.toString()}
          />
        </div>

        <div className="mb-8">
          {isLoadingCustomRange ? (
            <div className="chart-container">
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            </div>
          ) : (
            <StackedUsageChart 
              data={stackedChartData} 
              title="Token Usage by Model" 
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UsageChart
            data={dailySummaries}
            dataKey="total_requests"
            title="Daily Requests"
            color="#3b82f6"
          />
          <UsageChart
            data={dailySummaries}
            dataKey="total_tokens"
            title="Daily Token Usage"
            color="#10b981"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UsageChart
            data={dailySummaries}
            dataKey="total_context_tokens"
            title="Context Tokens"
            color="#f59e0b"
          />
          <UsageChart
            data={dailySummaries}
            dataKey="total_generated_tokens"
            title="Generated Tokens"
            color="#ef4444"
          />
        </div>

        <ModelBreakdown modelTotals={modelTotals} />

        <div className="mt-8">
          <EnvironmentalImpact impact={environmentalImpact} />
        </div>

        <div className="mt-8">
          <OptimizationRecommendations impact={environmentalImpact} />
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Learn More About Our Methodology</h3>
          <p className="text-gray-600 mb-4">
            Curious about how we calculate environmental impact and our research methodology?
          </p>
          <Link 
            to="/research" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            View Our Research
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
      
      {/* Background historical data sync indicator */}
      <HistoricalDataSync 
        isActive={isBackgroundSyncing} 
        onComplete={() => setIsBackgroundSyncing(false)}
      />
    </div>
  );
};