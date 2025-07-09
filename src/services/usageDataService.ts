import { supabase } from '../lib/supabase';
import { UsageData, ChartDataPoint, DailySummary } from '../types/usage';

export class UsageDataService {
  static async getUserUsageData(
    userId: string, 
    startDate?: string, 
    endDate?: string,
    endpoint?: string
  ): Promise<UsageData[]> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    let query = supabase
      .from('usage_data')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    if (endpoint) {
      query = query.eq('endpoint', endpoint);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching usage data:', error);
      throw error;
    }

    return data || [];
  }

  static async getChartData(
    userId: string, 
    days: number = 30,
    endpoint?: string
  ): Promise<ChartDataPoint[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usageData = await this.getUserUsageData(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      endpoint
    );

    return usageData.map(item => ({
      date: item.date,
      model: item.model,
      requests: item.requests,
      context_tokens: item.input_tokens, // Legacy mapping
      generated_tokens: item.output_tokens, // Legacy mapping
      total_tokens: item.input_tokens + item.output_tokens,
      input_cached_tokens: item.input_cached_tokens,
      input_audio_tokens: item.input_audio_tokens,
      output_audio_tokens: item.output_audio_tokens,
      endpoint: item.endpoint
    }));
  }

  static async getDailySummaries(
    userId: string, 
    days: number = 30
  ): Promise<DailySummary[]> {
    const chartData = await this.getChartData(userId, days);
    
    // Group by date
    const dailyGroups = chartData.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = [];
      }
      acc[item.date].push(item);
      return acc;
    }, {} as Record<string, ChartDataPoint[]>);

    // Create summaries
    return Object.entries(dailyGroups).map(([date, items]) => {
      const uniqueModels = new Set(items.map(item => item.model));
      const endpointsUsed = new Set(items.map(item => item.endpoint).filter((endpoint): endpoint is string => endpoint !== undefined));
      
      return {
        date,
        total_requests: items.reduce((sum, item) => sum + item.requests, 0),
        total_context_tokens: items.reduce((sum, item) => sum + item.context_tokens, 0),
        total_generated_tokens: items.reduce((sum, item) => sum + item.generated_tokens, 0),
        total_tokens: items.reduce((sum, item) => sum + item.total_tokens, 0),
        unique_models: uniqueModels.size,
        total_cached_tokens: items.reduce((sum, item) => sum + (item.input_cached_tokens || 0), 0),
        total_audio_tokens: items.reduce((sum, item) => sum + (item.input_audio_tokens || 0) + (item.output_audio_tokens || 0), 0),
        endpoints_used: Array.from(endpointsUsed)
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  static async getModelBreakdown(
    userId: string, 
    days: number = 30
  ): Promise<{ model: string; total_tokens: number; total_requests: number; cost: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usageData = await this.getUserUsageData(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    // Group by model
    const modelGroups = usageData.reduce((acc, item) => {
      if (!acc[item.model]) {
        acc[item.model] = {
          model: item.model,
          total_tokens: 0,
          total_requests: 0,
          cost: 0
        };
      }
      
      acc[item.model].total_tokens += item.input_tokens + item.output_tokens;
      acc[item.model].total_requests += item.requests;
      acc[item.model].cost += item.cost;
      
      return acc;
    }, {} as Record<string, { model: string; total_tokens: number; total_requests: number; cost: number }>);

    return Object.values(modelGroups)
      .sort((a, b) => b.total_tokens - a.total_tokens);
  }

  static async getEndpointBreakdown(
    userId: string, 
    days: number = 30
  ): Promise<{ endpoint: string; total_tokens: number; total_requests: number; cost: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usageData = await this.getUserUsageData(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    // Group by endpoint
    const endpointGroups = usageData.reduce((acc, item) => {
      if (!acc[item.endpoint]) {
        acc[item.endpoint] = {
          endpoint: item.endpoint,
          total_tokens: 0,
          total_requests: 0,
          cost: 0
        };
      }
      
      acc[item.endpoint].total_tokens += item.input_tokens + item.output_tokens;
      acc[item.endpoint].total_requests += item.requests;
      acc[item.endpoint].cost += item.cost;
      
      return acc;
    }, {} as Record<string, { endpoint: string; total_tokens: number; total_requests: number; cost: number }>);

    return Object.values(endpointGroups)
      .sort((a, b) => b.total_tokens - a.total_tokens);
  }

  static async getTotalUsageSummary(userId: string, days: number = 30): Promise<{
    total_cost: number;
    total_requests: number;
    total_tokens: number;
    total_co2_grams: number;
    unique_models: number;
    unique_endpoints: number;
    date_range: { start: string; end: string };
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usageData = await this.getUserUsageData(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const uniqueModels = new Set(usageData.map(item => item.model));
    const uniqueEndpoints = new Set(usageData.map(item => item.endpoint));

    return {
      total_cost: usageData.reduce((sum, item) => sum + item.cost, 0),
      total_requests: usageData.reduce((sum, item) => sum + item.requests, 0),
      total_tokens: usageData.reduce((sum, item) => sum + item.input_tokens + item.output_tokens, 0),
      total_co2_grams: usageData.reduce((sum, item) => sum + item.co2_grams, 0),
      unique_models: uniqueModels.size,
      unique_endpoints: uniqueEndpoints.size,
      date_range: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    };
  }

  static async getLastFetchStatus(userId: string) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('data_fetch_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting fetch status:', error);
      return null;
    }

    return data;
  }
}