// Enhanced types for admin endpoint data
export interface AdminUsageResult {
  object: string;
  input_tokens: number;
  output_tokens: number;
  num_model_requests: number;
  project_id?: string;
  user_id?: string;
  api_key_id?: string;
  model: string;
  batch?: string;
  input_cached_tokens: number;
  input_audio_tokens: number;
  output_audio_tokens: number;
}

export interface AdminUsageBucket {
  endpoint: string;
  object: string;
  start_time: number;
  end_time: number;
  results: AdminUsageResult[];
}

// Database usage data structure
export interface UsageData {
  id: string;
  user_id: string;
  date: string;
  endpoint: string;
  model: string;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  input_cached_tokens: number;
  input_audio_tokens: number;
  output_audio_tokens: number;
  project_id?: string;
  api_key_id?: string;
  batch?: string;
  cost: number;
  co2_grams: number;
  created_at: string;
}

// Legacy interfaces for backward compatibility
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
  input_cached_tokens?: number;
  input_audio_tokens?: number;
  output_audio_tokens?: number;
  endpoint?: string;
}

export interface DailySummary {
  date: string;
  total_requests: number;
  total_context_tokens: number;
  total_generated_tokens: number;
  total_tokens: number;
  unique_models: number;
  total_cached_tokens?: number;
  total_audio_tokens?: number;
  endpoints_used?: string[];
}

// Admin API configuration
export interface AdminApiConfig {
  apiKey: string;
  projectId?: string;
  daysBack: number;
}

// Data fetch status
export interface DataFetchStatus {
  user_id: string;
  last_fetched: string;
  last_successful_date: string;
  endpoints_fetched: string[];
  total_records: number;
  created_at: string;
  updated_at: string;
}