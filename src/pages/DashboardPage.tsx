import React, { useState, useEffect } from 'react';
import { Activity, MessageSquare, Zap, TrendingUp } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { UsageChart } from '../components/UsageChart';
import { ModelBreakdown } from '../components/ModelBreakdown';
import { StackedUsageChart } from '../components/StackedUsageChart';
import { EnvironmentalImpact } from '../components/EnvironmentalImpact';
import { ModelAssumptions } from '../components/ModelAssumptions';
import { CarbonNeutralStatus } from '../components/CarbonNeutralStatus';
import { OptimizationRecommendations } from '../components/OptimizationRecommendations';
import { ComplianceReport } from '../components/ComplianceReport';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ExportButton } from '../components/ExportButton';
import { SyncStatus } from '../components/SyncStatus';
import { HistoricalDataSync } from '../components/HistoricalDataSync';
import { useUsageData } from '../hooks/useUsageData';
import { getDailySummaries, getModelTotals } from '../utils/dataProcessing';
import { calculateEnvironmentalImpact, prepareStackedChartData } from '../utils/environmentalCalculations';
import { UsageReport } from '../types/usage';

export const DashboardPage: React.FC = () => {
  const [chartTimeRange, setChartTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [customRangeData, setCustomRangeData] = useState<UsageReport | null>(null);
  const [isLoadingCustomRange, setIsLoadingCustomRange] = useState(false);
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(true);
  const { data, data30Days, loading, error, refetch, syncData, lastSyncTime, fetchCustomRange } = useUsageData(true);

  // Handle time range changes
  useEffect(() => {
    const handleTimeRangeChange = async () => {
      if (chartTimeRange === '30d') {
        // Use existing 30-day data
        setCustomRangeData(null);
        return;
      }

      setIsLoadingCustomRange(true);
      try {
        const rangeData = await fetchCustomRange(chartTimeRange);
        setCustomRangeData(rangeData);
      } catch (err) {
        console.error('Error fetching custom range:', err);
      } finally {
        setIsLoadingCustomRange(false);
      }
    };

    handleTimeRangeChange();
  }, [chartTimeRange]); // Remove fetchCustomRange from dependencies

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !data) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  if (!data || !data30Days) {
    return <ErrorMessage error="No data available" onRetry={refetch} />;
  }

  const dailySummaries = getDailySummaries(data);
  const modelTotals = getModelTotals(data);
  
  // Use custom range data if available, otherwise use default 30-day data
  const chartData = customRangeData || data30Days;
  
  // Calculate environmental impact and prepare charts
  const environmentalImpact = calculateEnvironmentalImpact(data30Days);
  const stackedChartData = prepareStackedChartData(chartData);
  
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
            <ExportButton data={data} data30Days={data30Days} />
          </div>
        </div>

        {/* Real-time sync status */}
        <div className="mb-6">
          <SyncStatus 
            lastSyncTime={lastSyncTime}
            onSync={syncData}
            className="max-w-sm"
          />
        </div>

        <CarbonNeutralStatus impact={environmentalImpact} />
        
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
          {isLoadingCustomRange ? (
            <div className="chart-container">
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            </div>
          ) : (
            <StackedUsageChart 
              data={stackedChartData} 
              title="Token Usage by Model (Stacked)" 
              onTimeRangeChange={setChartTimeRange}
              currentRange={chartTimeRange}
            />
          )}
        </div>

        <div className="mt-8">
          <EnvironmentalImpact impact={environmentalImpact} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <OptimizationRecommendations impact={environmentalImpact} />
          <ComplianceReport impact={environmentalImpact} />
        </div>

        <div className="mt-8">
          <ModelAssumptions />
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Context Tokens:</span>
              <span className="ml-2 text-gray-900">{totalContextTokens.toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Generated Tokens:</span>
              <span className="ml-2 text-gray-900">{totalGeneratedTokens.toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Date Range:</span>
              <span className="ml-2 text-gray-900">
                {dailySummaries[0]?.date} - {dailySummaries[dailySummaries.length - 1]?.date}
              </span>
            </div>
          </div>
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