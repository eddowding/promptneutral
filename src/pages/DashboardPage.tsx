import React, { useState } from 'react';
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
import { useUsageData } from '../hooks/useUsageData';
import { getDailySummaries, getModelTotals } from '../utils/dataProcessing';
import { calculateEnvironmentalImpact, prepareStackedChartData } from '../utils/environmentalCalculations';

export const DashboardPage: React.FC = () => {
  const { data, data30Days, loading, error, refetch, syncData, lastSyncTime } = useUsageData(true);

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
  
  // Calculate environmental impact and prepare charts
  const environmentalImpact = calculateEnvironmentalImpact(data30Days);
  const stackedChartData = prepareStackedChartData(data30Days);
  
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
          <StackedUsageChart 
            data={stackedChartData} 
            title="30-Day Token Usage by Model (Stacked)" 
          />
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
    </div>
  );
};