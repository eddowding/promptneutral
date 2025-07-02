import { UsageReport } from '../types/usage';
import { EnvironmentalImpact, StackedChartData } from '../types/environmental';
import { getModelAssumptions } from '../data/modelAssumptions';

export const calculateEnvironmentalImpact = (data: UsageReport): EnvironmentalImpact => {
  const impact: EnvironmentalImpact = {
    totalCost: 0,
    totalKWh: 0,
    totalCO2g: 0,
    modelBreakdown: {},
  };

  Object.values(data).forEach((dayData) => {
    if ('error' in dayData) return;

    Object.entries(dayData).forEach(([model, usage]) => {
      const assumptions = getModelAssumptions(model);
      const totalTokens = usage.context_tokens + usage.generated_tokens;

      // Calculate impacts
      const cost = (totalTokens / 1000) * assumptions.costPer1kTokens;
      const kWh = (totalTokens / 1000) * assumptions.kWhPer1kTokens;
      const co2g = (totalTokens / 1000) * assumptions.co2gPer1kTokens;

      // Add to totals
      impact.totalCost += cost;
      impact.totalKWh += kWh;
      impact.totalCO2g += co2g;

      // Add to model breakdown
      if (!impact.modelBreakdown[model]) {
        impact.modelBreakdown[model] = {
          cost: 0,
          kWh: 0,
          co2g: 0,
          tokens: 0,
        };
      }

      impact.modelBreakdown[model].cost += cost;
      impact.modelBreakdown[model].kWh += kWh;
      impact.modelBreakdown[model].co2g += co2g;
      impact.modelBreakdown[model].tokens += totalTokens;
    });
  });

  return impact;
};

export const prepareStackedChartData = (data: UsageReport): StackedChartData[] => {
  const chartData: StackedChartData[] = [];

  const validEntries = Object.entries(data)
    .filter(([_, dayData]) => !('error' in dayData))
    .sort(([a], [b]) => a.localeCompare(b));

  console.log(`Preparing stacked chart data for ${validEntries.length} days`);

  validEntries.forEach(([date, dayData]) => {
    const dayItem: StackedChartData = { date };
    let hasData = false;

    Object.entries(dayData).forEach(([model, usage]) => {
      const totalTokens = usage.context_tokens + usage.generated_tokens;
      if (totalTokens > 0) {
        dayItem[model] = totalTokens;
        hasData = true;
      }
    });

    // Only add days that have actual usage data
    if (hasData) {
      chartData.push(dayItem);
    }
  });

  console.log(`Chart data prepared with ${chartData.length} days containing usage`);
  return chartData;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatKWh = (kWh: number): string => {
  if (kWh < 0.001) {
    return `${(kWh * 1000000).toFixed(1)} Wh`;
  } else if (kWh < 1) {
    return `${(kWh * 1000).toFixed(1)} Wh`;
  } else {
    return `${kWh.toFixed(2)} kWh`;
  }
};

export const formatCO2 = (co2g: number): string => {
  if (co2g < 1000) {
    return `${co2g.toFixed(1)} g CO₂`;
  } else if (co2g < 1000000) {
    return `${(co2g / 1000).toFixed(2)} kg CO₂`;
  } else {
    return `${(co2g / 1000000).toFixed(3)} t CO₂`;
  }
};