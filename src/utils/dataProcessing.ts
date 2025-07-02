import { UsageReport, ChartDataPoint, DailySummary, ModelUsage } from '../types/usage';

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
      if (!modelTotals[model]) {
        modelTotals[model] = { requests: 0, context_tokens: 0, generated_tokens: 0 };
      }
      modelTotals[model].requests += usage.requests;
      modelTotals[model].context_tokens += usage.context_tokens;
      modelTotals[model].generated_tokens += usage.generated_tokens;
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