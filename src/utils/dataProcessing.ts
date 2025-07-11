import { UsageReport, ChartDataPoint, DailySummary, ModelUsage } from '../types/usage';

// Helper function to normalize model names by removing version suffixes
export const normalizeModelName = (model: string): string => {
  // Remove date suffixes like -2024-05-13 or -20240513
  const withoutDate = model.replace(/-\d{4}-\d{2}-\d{2}$/, '').replace(/-\d{8}$/, '');
  
  // Remove other version suffixes like -preview, -0125, etc.
  const withoutVersion = withoutDate.replace(/-preview$/, '').replace(/-\d{4}$/, '');
  
  // Special cases
  if (withoutVersion.startsWith('gpt-4-turbo')) return 'gpt-4-turbo';
  if (withoutVersion.startsWith('gpt-4o')) return 'gpt-4o';
  if (withoutVersion.startsWith('gpt-4')) return 'gpt-4';
  if (withoutVersion.startsWith('gpt-3.5-turbo')) return 'gpt-3.5-turbo';
  if (withoutVersion.startsWith('text-embedding')) return 'text-embedding';
  if (withoutVersion.startsWith('o3-mini')) return 'o3-mini';
  if (withoutVersion.startsWith('o3-pro')) return 'o3-pro';
  if (withoutVersion.startsWith('o3')) return 'o3';
  if (withoutVersion.startsWith('o1')) return 'o1';
  
  return withoutVersion;
};

export const processUsageData = (data: UsageReport): ChartDataPoint[] => {
  const chartData: ChartDataPoint[] = [];
  
  Object.entries(data).forEach(([date, dayData]) => {
    if ('error' in dayData) return;
    
    Object.entries(dayData).forEach(([model, usage]) => {
      chartData.push({
        date,
        model,
        requests: usage.requests,
        context_tokens: usage.context_tokens,
        generated_tokens: usage.generated_tokens,
        total_tokens: usage.context_tokens + usage.generated_tokens,
      });
    });
  });
  
  return chartData.sort((a, b) => a.date.localeCompare(b.date));
};

export const getDailySummaries = (data: UsageReport): DailySummary[] => {
  return Object.entries(data)
    .filter(([_, dayData]) => !('error' in dayData))
    .map(([date, dayData]) => {
      const models = Object.keys(dayData);
      const totals = Object.values(dayData as Record<string, ModelUsage>).reduce(
        (acc, usage) => ({
          requests: acc.requests + usage.requests,
          context_tokens: acc.context_tokens + usage.context_tokens,
          generated_tokens: acc.generated_tokens + usage.generated_tokens,
        }),
        { requests: 0, context_tokens: 0, generated_tokens: 0 }
      );
      
      return {
        date,
        total_requests: totals.requests,
        total_context_tokens: totals.context_tokens,
        total_generated_tokens: totals.generated_tokens,
        total_tokens: totals.context_tokens + totals.generated_tokens,
        unique_models: models.length,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const getModelTotals = (data: UsageReport) => {
  const modelTotals: Record<string, ModelUsage> = {};
  
  Object.values(data).forEach((dayData) => {
    if ('error' in dayData) return;
    
    Object.entries(dayData).forEach(([model, usage]) => {
      const normalizedModel = normalizeModelName(model);
      if (!modelTotals[normalizedModel]) {
        modelTotals[normalizedModel] = { requests: 0, context_tokens: 0, generated_tokens: 0 };
      }
      modelTotals[normalizedModel].requests += usage.requests;
      modelTotals[normalizedModel].context_tokens += usage.context_tokens;
      modelTotals[normalizedModel].generated_tokens += usage.generated_tokens;
    });
  });
  
  return modelTotals;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};