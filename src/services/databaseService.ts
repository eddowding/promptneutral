import { supabase } from '../lib/supabase';
import { UsageReport, ModelUsage } from '../types/usage';
import { calculateEnvironmentalImpact } from '../utils/environmentalCalculations';
import { ErrorHandler, Validator, withRetry } from '../utils/errorHandling';

export interface UsageDataRow {
  id?: string;
  user_id: string;
  date: string;
  model: string;
  requests: number;
  context_tokens: number;
  generated_tokens: number;
  cost: number;
  co2_grams: number;
  created_at?: string;
}

export class DatabaseService {
  private static instance: DatabaseService;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Store usage data for a specific date and user
   */
  async storeUsageData(userId: string, date: string, usageData: Record<string, ModelUsage>): Promise<void> {
    // Validate inputs
    if (!Validator.isValidUserId(userId)) {
      throw ErrorHandler.handleValidationError('userId', userId, 'must be a valid user ID');
    }
    
    if (!Validator.isValidDate(date)) {
      throw ErrorHandler.handleValidationError('date', date, 'must be in YYYY-MM-DD format');
    }

    try {
      const rows: UsageDataRow[] = [];

      for (const [model, usage] of Object.entries(usageData)) {
        // Validate model and usage data
        if (!Validator.isValidModel(model)) {
          console.warn(`⚠️ Skipping invalid model: ${model}`);
          continue;
        }
        
        if (!Validator.isValidUsageData(usage)) {
          console.warn(`⚠️ Skipping invalid usage data for model ${model}:`, usage);
          continue;
        }

        // Calculate environmental impact for this model usage
        const tempReport: UsageReport = { [date]: { [model]: usage } };
        const impact = calculateEnvironmentalImpact(tempReport);
        const co2ForModel = impact.totalCO2 || 0;
        
        // Estimate cost based on model and tokens (simplified calculation)
        const cost = this.estimateCost(model, usage);

        rows.push({
          user_id: userId,
          date,
          model,
          requests: usage.requests,
          context_tokens: usage.context_tokens,
          generated_tokens: usage.generated_tokens,
          cost,
          co2_grams: co2ForModel,
        });
      }

      if (rows.length === 0) {
        console.log(`ℹ️ No valid data to store for ${date}`);
        return;
      }

      // Upsert the data with retry logic
      await withRetry(async () => {
        const { error } = await supabase
          .from('usage_data')
          .upsert(rows, { 
            onConflict: 'user_id,date,model',
            ignoreDuplicates: false 
          });

        if (error) {
          throw ErrorHandler.handleSupabaseError(error);
        }
      });

      console.log(`✓ Stored usage data for ${date}: ${rows.length} models`);
    } catch (error) {
      console.error('Error storing usage data:', error);
      throw error;
    }
  }

  /**
   * Fetch usage data for a user within a date range
   */
  async fetchUsageData(userId: string, startDate: string, endDate: string): Promise<UsageReport> {
    try {
      const { data, error } = await supabase
        .from('usage_data')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch usage data: ${error.message}`);
      }

      // Transform the flat data back into UsageReport format
      const report: UsageReport = {};
      
      if (data) {
        for (const row of data) {
          if (!report[row.date]) {
            report[row.date] = {};
          }
          
          report[row.date][row.model] = {
            requests: row.requests,
            context_tokens: row.context_tokens,
            generated_tokens: row.generated_tokens,
          };
        }
      }

      return report;
    } catch (error) {
      console.error('Error fetching usage data:', error);
      throw error;
    }
  }

  /**
   * Fetch aggregated usage data for dashboard metrics
   */
  async fetchAggregatedData(userId: string, days: number): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    totalCO2: number;
    modelBreakdown: Record<string, ModelUsage>;
  }> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('usage_data')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        throw new Error(`Failed to fetch aggregated data: ${error.message}`);
      }

      let totalRequests = 0;
      let totalTokens = 0;
      let totalCost = 0;
      let totalCO2 = 0;
      const modelBreakdown: Record<string, ModelUsage> = {};

      if (data) {
        for (const row of data) {
          totalRequests += row.requests;
          totalTokens += row.context_tokens + row.generated_tokens;
          totalCost += row.cost;
          totalCO2 += row.co2_grams;

          if (!modelBreakdown[row.model]) {
            modelBreakdown[row.model] = {
              requests: 0,
              context_tokens: 0,
              generated_tokens: 0,
            };
          }

          modelBreakdown[row.model].requests += row.requests;
          modelBreakdown[row.model].context_tokens += row.context_tokens;
          modelBreakdown[row.model].generated_tokens += row.generated_tokens;
        }
      }

      return {
        totalRequests,
        totalTokens,
        totalCost,
        totalCO2,
        modelBreakdown,
      };
    } catch (error) {
      console.error('Error fetching aggregated data:', error);
      throw error;
    }
  }

  /**
   * Get the latest sync timestamp for a user
   */
  async getLastSyncTime(userId: string): Promise<Date | null> {
    try {
      const { data, error } = await supabase
        .from('usage_data')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(`Failed to get last sync time: ${error.message}`);
      }

      return data && data.length > 0 ? new Date(data[0].created_at) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  /**
   * Check if data exists for a specific date range
   */
  async hasDataForRange(userId: string, startDate: string, endDate: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('usage_data')
        .select('id')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .limit(1);

      if (error) {
        throw new Error(`Failed to check data existence: ${error.message}`);
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking data existence:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time changes for a user's usage data
   */
  subscribeToUsageUpdates(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('usage_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usage_data',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  /**
   * Estimate cost based on model and usage (simplified calculation)
   */
  private estimateCost(model: string, usage: ModelUsage): number {
    // Simplified cost calculation - in production, you'd use actual OpenAI pricing
    const costPerToken: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.00003, output: 0.00006 },
      'gpt-4-turbo': { input: 0.00001, output: 0.00003 },
      'gpt-3.5-turbo': { input: 0.0000015, output: 0.000002 },
      'dall-e-2': { input: 0.02, output: 0 }, // per image
      'dall-e-3': { input: 0.04, output: 0 }, // per image
    };

    const modelCost = costPerToken[model] || costPerToken['gpt-3.5-turbo'];
    
    if (model.includes('dall-e')) {
      // For DALL-E, cost is per request (image)
      return usage.requests * modelCost.input;
    } else {
      // For text models, cost is per token
      return (usage.context_tokens * modelCost.input) + 
             (usage.generated_tokens * modelCost.output);
    }
  }

  /**
   * Clean up old data (older than specified days)
   */
  async cleanupOldData(userId: string, keepDays: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const { error } = await supabase
        .from('usage_data')
        .delete()
        .eq('user_id', userId)
        .lt('date', cutoffDate);

      if (error) {
        throw new Error(`Failed to cleanup old data: ${error.message}`);
      }

      console.log(`✓ Cleaned up usage data older than ${cutoffDate}`);
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      throw error;
    }
  }
}