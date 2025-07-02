export interface ModelEnvironmentalData {
  model: string;
  costPer1kTokens: number; // USD per 1k tokens
  kWhPer1kTokens: number; // kWh per 1k tokens
  co2gPerkWh: number; // grams CO2 per kWh
  co2gPer1kTokens: number; // calculated: kWhPer1kTokens * co2gPerkWh
}

export interface EnvironmentalImpact {
  totalCost: number;
  totalKWh: number;
  totalCO2g: number;
  modelBreakdown: {
    [model: string]: {
      cost: number;
      kWh: number;
      co2g: number;
      tokens: number;
    };
  };
}

export interface StackedChartData {
  date: string;
  [model: string]: number | string; // model names as keys with token counts as values
}