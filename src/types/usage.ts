export interface ModelUsage {
  requests: number;
  context_tokens: number;
  generated_tokens: number;
}

export interface DayUsage {
  [model: string]: ModelUsage;
}

export interface UsageReport {
  [date: string]: DayUsage | { error: string };
}

export interface ChartDataPoint {
  date: string;
  model: string;
  requests: number;
  context_tokens: number;
  generated_tokens: number;
  total_tokens: number;
}

export interface DailySummary {
  date: string;
  total_requests: number;
  total_context_tokens: number;
  total_generated_tokens: number;
  total_tokens: number;
  unique_models: number;
}