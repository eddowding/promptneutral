import { supabase, settingsService } from '../lib/supabase';
import { AdminUsageBucket, AdminUsageResult, UsageData, DataFetchStatus } from '../types/usage';

const ENDPOINTS = [
  'completions', 'embeddings', 'images', 'moderations',
  'audio_transcriptions', 'audio_speeches',
  'code_interpreter_sessions', 'vector_stores',
];

const BASE_URL = 'https://api.openai.com/v1/organization/usage';
const DAY_SECONDS = 24 * 3600;

export class AdminApiService {
  private apiKey: string;
  private projectId?: string;

  constructor(apiKey: string, projectId?: string) {
    this.apiKey = apiKey;
    this.projectId = projectId;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  private async fetchSlice(
    endpoint: string, 
    startTime: number, 
    endTime: number, 
    page?: string
  ): Promise<{ data: AdminUsageResult[], next_page?: string }> {
    const url = `${BASE_URL}/${endpoint}`;
    
    // Log the dates for debugging
    console.log(`Fetching ${endpoint} slice from ${new Date(startTime * 1000).toISOString()} to ${new Date(endTime * 1000).toISOString()}`);
    
    // Build params object first
    const paramsObj: Record<string, string> = {
      start_time: startTime.toString(),
      end_time: endTime.toString(),
      limit: '31',  // Maximum allowed for bucket_width=1d
    };

    if (page) {
      paramsObj.page = page;
    }

    if (this.projectId) {
      paramsObj.project_ids = JSON.stringify([this.projectId]);
    }

    // Convert to URLSearchParams
    const params = new URLSearchParams(paramsObj);
    
    // Add enhanced params for main endpoints manually to match Python's behavior
    if (['completions', 'embeddings', 'images', 'moderations'].includes(endpoint)) {
      params.set('bucket_width', '1d');
      params.append('group_by', 'model');
    }

    const response = await fetch(`${url}?${params}`, {
      headers: this.getHeaders()
    });

    if (response.status === 404) {
      throw new Error(`Endpoint ${endpoint} not available for this organization`);
    }

    if (response.status === 400) {
      const errorText = await response.text();
      console.error(`400 error for ${endpoint}:`, errorText);
      
      if (params.has('group_by')) {
        // Graceful fallback: retry without the fancy params
        params.delete('group_by');
        params.delete('bucket_width');
        
        const retryResponse = await fetch(`${url}?${params}`, {
          headers: this.getHeaders()
        });
        
        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.statusText}`);
        }
        
        const retryData = await retryResponse.json();
        return { data: retryData.data, next_page: retryData.next_page };
      }
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { data: data.data, next_page: data.next_page };
  }

  private async* getAllBuckets(endpoint: string, daysBack: number = 7) {
    const now = Math.floor(Date.now() / 1000);
    const stop = now - (daysBack * DAY_SECONDS);
    let end = now;
    
    console.log(`Fetching ${endpoint} data from ${new Date(stop * 1000).toISOString()} to ${new Date(end * 1000).toISOString()}`);

    while (end > stop) {
      const start = Math.max(end - (31 * DAY_SECONDS), stop);
      let page: string | undefined = undefined;

      while (true) {
        try {
          const result = await this.fetchSlice(endpoint, start, end, page);
          
          for (const bucket of result.data) {
            yield { endpoint, ...bucket };
          }

          page = result.next_page;
          if (!page) break;
        } catch (error) {
          console.error(`Error fetching ${endpoint} data:`, error);
          break;
        }
      }

      end = start;
    }
  }

  async fetchAllUsageData(userId: string, daysBack: number = 7): Promise<Omit<UsageData, 'id'>[]> {
    const allUsageData: Omit<UsageData, 'id'>[] = [];

    // Start with a reasonable date range (default 7 days)
    // Users can manually request longer periods if needed
    for (const endpoint of ENDPOINTS) {
      try {
        console.log(`Fetching ${endpoint} data for last ${daysBack} days...`);
        
        for await (const result of this.getAllBuckets(endpoint, daysBack)) {
          // Each item yielded is actually a usage result, not a bucket
          const date = new Date().toISOString().split('T')[0]; // Use current date as fallback
          
          // Skip empty results
          if (!result.model) {
            console.log(`Skipping result without model in ${endpoint}`);
            continue;
          }
          
          const usageData: Omit<UsageData, 'id'> = {
            user_id: userId,
            date,
            endpoint: result.endpoint || endpoint,
              model: result.model,
              requests: result.num_model_requests || 0,
              input_tokens: result.input_tokens || 0,
              output_tokens: result.output_tokens || 0,
              input_cached_tokens: result.input_cached_tokens || 0,
              input_audio_tokens: result.input_audio_tokens || 0,
              output_audio_tokens: result.output_audio_tokens || 0,
              project_id: result.project_id || undefined,
              api_key_id: result.api_key_id || undefined,
              batch: result.batch || undefined,
              cost: this.calculateCost(result),
              co2_grams: this.calculateCO2(result),
              created_at: new Date().toISOString()
            };

          allUsageData.push(usageData);
        }
      } catch (error) {
        console.error(`Failed to fetch ${endpoint} data:`, error);
        // Continue with other endpoints even if one fails
      }
    }

    return allUsageData;
  }

  private calculateCost(result: AdminUsageResult): number {
    // Simplified cost calculation - you'll need to implement proper pricing
    const inputCostPer1k = 0.01; // Default rate
    const outputCostPer1k = 0.03; // Default rate
    
    return (result.input_tokens / 1000 * inputCostPer1k) + 
           (result.output_tokens / 1000 * outputCostPer1k);
  }

  private calculateCO2(result: AdminUsageResult): number {
    // Simplified CO2 calculation - you'll need to implement proper carbon intensity
    const co2PerToken = 0.00001; // Default rate in grams
    
    return (result.input_tokens + result.output_tokens) * co2PerToken;
  }

  async saveUsageDataToDatabase(usageData: Omit<UsageData, 'id'>[]): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // Batch insert with upsert to handle duplicates
    const batchSize = 1000;
    
    for (let i = 0; i < usageData.length; i += batchSize) {
      const batch = usageData.slice(i, i + batchSize);
      
      // Ensure all records have the required fields
      const validBatch = batch.filter(record => 
        record.user_id && 
        record.date && 
        record.model && 
        record.endpoint
      );
      
      if (validBatch.length === 0) {
        console.log('No valid records in batch, skipping...');
        continue;
      }
      
      const { error } = await supabase
        .from('usage_data')
        .upsert(validBatch, { 
          onConflict: 'user_id,date,model,endpoint',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('Error saving usage data batch:', error);
        throw error;
      }
    }
  }

  async updateFetchStatus(userId: string, endpointsFetched: string[], totalRecords: number): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const status: Partial<DataFetchStatus> = {
      user_id: userId,
      last_fetched: new Date().toISOString(),
      last_successful_date: new Date().toISOString().split('T')[0],
      endpoints_fetched: endpointsFetched,
      total_records: totalRecords,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('data_fetch_status')
      .upsert(status, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error updating fetch status:', error);
      throw error;
    }
  }

  async getFetchStatus(userId: string): Promise<DataFetchStatus | null> {
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

  async shouldFetchData(userId: string): Promise<{ shouldFetch: boolean, reason: string }> {
    const status = await this.getFetchStatus(userId);
    
    if (!status) {
      return { shouldFetch: true, reason: 'No previous fetch recorded' };
    }

    const lastFetched = new Date(status.last_fetched);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    if (lastFetched < weekAgo) {
      return { shouldFetch: true, reason: 'Data is more than a week old' };
    }

    return { shouldFetch: false, reason: 'Data is recent (less than a week old)' };
  }
}

export async function createAdminApiService(userId: string): Promise<AdminApiService | null> {
  try {
    const adminKey = await settingsService.getDecryptedApiKey(userId, 'openai_admin');
    
    if (!adminKey) {
      throw new Error('No admin API key found for user');
    }

    return new AdminApiService(adminKey);
  } catch (error) {
    console.error('Error creating admin API service:', error);
    return null;
  }
}

export async function fetchAndStoreUsageData(
  userId: string, 
  forceRefresh: boolean = false,
  daysBack: number = 7
): Promise<{
  success: boolean;
  message: string;
  recordsProcessed?: number;
}> {
  try {
    const service = await createAdminApiService(userId);
    
    if (!service) {
      return {
        success: false,
        message: 'No admin API key configured. Please add your OpenAI admin key in Settings.'
      };
    }

    if (!forceRefresh) {
      const { shouldFetch, reason } = await service.shouldFetchData(userId);
      
      if (!shouldFetch) {
        return {
          success: true,
          message: `Skipping fetch: ${reason}`,
          recordsProcessed: 0
        };
      }
    }

    console.log(`Starting usage data fetch for last ${daysBack} days...`);
    const usageData = await service.fetchAllUsageData(userId, daysBack);
    
    console.log(`Fetched ${usageData.length} usage records`);
    await service.saveUsageDataToDatabase(usageData);
    
    await service.updateFetchStatus(userId, ENDPOINTS, usageData.length);

    return {
      success: true,
      message: `Successfully fetched and stored ${usageData.length} usage records`,
      recordsProcessed: usageData.length
    };
  } catch (error) {
    console.error('Error in fetchAndStoreUsageData:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}