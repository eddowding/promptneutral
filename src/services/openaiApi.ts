import { UsageReport } from '../types/usage';
import { ConfigService } from './config';
import { DatabaseService } from './databaseService';

export class OpenAIApiService {
  private static instance: OpenAIApiService;
  private configService: ConfigService;
  private databaseService: DatabaseService;

  private constructor() {
    this.configService = ConfigService.getInstance();
    this.databaseService = DatabaseService.getInstance();
  }

  static getInstance(): OpenAIApiService {
    if (!OpenAIApiService.instance) {
      OpenAIApiService.instance = new OpenAIApiService();
    }
    return OpenAIApiService.instance;
  }

  async fetchUsageForDate(date: string): Promise<any> {
    const apiKey = await this.configService.getApiKey();
    
    const url = new URL('https://api.openai.com/v1/usage');
    url.searchParams.append('date', date);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async fetchUsageForDateRange(startDate: string, endDate: string): Promise<any> {
    const apiKey = await this.configService.getApiKey();
    
    const url = new URL('https://api.openai.com/v1/usage');
    url.searchParams.append('start_date', startDate);
    url.searchParams.append('end_date', endDate);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private summariseByModel(raw: any): Record<string, any> {
    const agg: Record<string, { requests: number; context_tokens: number; generated_tokens: number }> = {};
    
    // Handle new OpenAI Usage API v2 format with buckets
    if (raw.data && Array.isArray(raw.data)) {
      for (const bucket of raw.data) {
        if (bucket.object === 'bucket' && bucket.results) {
          for (const result of bucket.results) {
            const model = result.model || 'unknown';
            if (!agg[model]) {
              agg[model] = { requests: 0, context_tokens: 0, generated_tokens: 0 };
            }
            agg[model].requests += result.num_model_requests || 0;
            agg[model].context_tokens += result.input_tokens || 0;
            agg[model].generated_tokens += result.output_tokens || 0;
          }
        }
      }
    } else {
      // Fallback: Handle old API format
      for (const entry of raw.data || []) {
        const model = entry.snapshot_id || 'unknown';
        if (!agg[model]) {
          agg[model] = { requests: 0, context_tokens: 0, generated_tokens: 0 };
        }
        agg[model].requests += entry.n_requests || 0;
        agg[model].context_tokens += entry.n_context_tokens_total || 0;
        agg[model].generated_tokens += entry.n_generated_tokens_total || 0;
      }
    }
    
    return agg;
  }

  private groupByDate(raw: any): UsageReport {
    const report: UsageReport = {};
    
    // Handle new OpenAI Usage API v2 format with buckets
    if (raw.data && Array.isArray(raw.data)) {
      for (const bucket of raw.data) {
        if (bucket.object === 'bucket' && bucket.results) {
          // Convert Unix timestamp to date string
          const date = new Date(bucket.start_time * 1000).toISOString().split('T')[0];
          
          if (!report[date]) {
            report[date] = {};
          }
          
          const dayUsage = report[date];
          if ('error' in dayUsage) continue; // Skip if it's an error object
          
          for (const result of bucket.results) {
            const model = result.model || 'unknown';
            if (!dayUsage[model]) {
              dayUsage[model] = { requests: 0, context_tokens: 0, generated_tokens: 0 };
            }
            
            // Map new field names to our format
            dayUsage[model].requests += result.num_model_requests || 0;
            dayUsage[model].context_tokens += result.input_tokens || 0;
            dayUsage[model].generated_tokens += result.output_tokens || 0;
          }
        }
      }
    } else {
      // Fallback: Handle old API format (if still used)
      for (const entry of raw.data || []) {
        const date = entry.aggregation_timestamp?.split('T')[0] || 'unknown';
        
        if (!report[date]) {
          report[date] = {};
        }
        
        const dayUsage = report[date];
        if ('error' in dayUsage) continue; // Skip if it's an error object
        
        const model = entry.snapshot_id || 'unknown';
        if (!dayUsage[model]) {
          dayUsage[model] = { requests: 0, context_tokens: 0, generated_tokens: 0 };
        }
        
        dayUsage[model].requests += entry.n_requests || 0;
        dayUsage[model].context_tokens += entry.n_context_tokens_total || 0;
        dayUsage[model].generated_tokens += entry.n_generated_tokens_total || 0;
      }
    }
    
    return report;
  }

  async fetchLast7DaysUsage(userId?: string): Promise<UsageReport> {
    if (userId) {
      return this.fetchUsageFromDatabase(userId, 7);
    }
    return this.fetchUsageForDays(7);
  }

  async fetchLast30DaysUsage(userId?: string): Promise<UsageReport> {
    if (userId) {
      return this.fetchUsageFromDatabase(userId, 30);
    }
    return this.fetchUsageForDays(30);
  }

  async fetchMaximumHistoricalData(userId?: string, onProgress?: (progress: { chunk: number, found: number, total: number }) => void): Promise<UsageReport> {
    console.log('🔍 Fetching maximum historical data from OpenAI...');
    
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 2); // Account for API delay
    
    const allData: UsageReport = {};
    let consecutiveEmptyChunks = 0;
    const maxEmptyChunks = 3; // Stop after 3 consecutive empty chunks
    const chunkSize = 30; // Days per chunk
    let totalDaysFound = 0;
    
    // Start from the most recent data and work backwards
    let chunkEndDate = new Date(endDate);
    let chunkNumber = 0;
    
    while (consecutiveEmptyChunks < maxEmptyChunks) {
      chunkNumber++;
      const chunkStartDate = new Date(chunkEndDate);
      chunkStartDate.setDate(chunkEndDate.getDate() - (chunkSize - 1));
      
      const startStr = chunkStartDate.toISOString().split('T')[0];
      const endStr = chunkEndDate.toISOString().split('T')[0];
      
      console.log(`📅 Chunk ${chunkNumber}: Fetching ${startStr} to ${endStr}`);
      
      try {
        const raw = await this.fetchUsageForDateRange(startStr, endStr);
        
        if (raw.data && raw.data.length > 0) {
          consecutiveEmptyChunks = 0; // Reset counter
          const chunkData = this.groupByDate(raw);
          const daysInChunk = Object.keys(chunkData).length;
          
          // Merge with existing data
          Object.assign(allData, chunkData);
          totalDaysFound += daysInChunk;
          
          console.log(`✓ Found ${daysInChunk} days of data in chunk ${chunkNumber}`);
          
          // Report progress
          if (onProgress) {
            onProgress({ chunk: chunkNumber, found: daysInChunk, total: totalDaysFound });
          }
          
          // Add a small delay to avoid rate limiting
          await this.sleep(500);
        } else {
          consecutiveEmptyChunks++;
          console.log(`○ No data found in chunk ${chunkNumber} (empty chunks: ${consecutiveEmptyChunks}/${maxEmptyChunks})`);
        }
      } catch (error) {
        console.error(`✗ Error fetching chunk ${chunkNumber}:`, error);
        consecutiveEmptyChunks++;
      }
      
      // Move to the next chunk (further back in time)
      chunkEndDate = new Date(chunkStartDate);
      chunkEndDate.setDate(chunkStartDate.getDate() - 1);
      
      // Safety check: don't go back more than 2 years
      const twoYearsAgo = new Date(today);
      twoYearsAgo.setFullYear(today.getFullYear() - 2);
      if (chunkEndDate < twoYearsAgo) {
        console.log('📛 Reached 2-year limit, stopping search');
        break;
      }
    }
    
    console.log(`📊 Total historical data found: ${totalDaysFound} days across ${Object.keys(allData).length} unique dates`);
    
    // Save to cache if we have data
    if (Object.keys(allData).length > 0) {
      this.saveToCache(allData, totalDaysFound);
      
      // Also save to database if userId is provided
      if (userId) {
        console.log('💾 Saving historical data to database...');
        for (const [date, dayData] of Object.entries(allData)) {
          if (!('error' in dayData)) {
            await this.databaseService.storeUsageData(userId, date, dayData);
          }
        }
      }
    }
    
    return allData;
  }

  async fetchHistoricalDataInBackground(userId: string, onComplete?: () => void): Promise<void> {
    console.log('🚀 Starting background historical data fetch...');
    
    // Check if we've already fetched historical data
    const hasHistoricalData = await this.databaseService.hasHistoricalDataFlag(userId);
    if (hasHistoricalData) {
      console.log('✅ Historical data already fetched, skipping background sync');
      if (onComplete) onComplete();
      return;
    }
    
    try {
      // Import and use the admin API service for historical data
      const { fetchAndStoreUsageData } = await import('./adminApiService');
      
      console.log('🔄 Background: Using admin API to fetch historical data...');
      
      // Fetch up to 90 days of historical data
      const result = await fetchAndStoreUsageData(userId, false, 90);
      
      if (result.success) {
        // Mark historical data as fetched
        await this.databaseService.setHistoricalDataFlag(userId, true);
        console.log(`✅ Background sync complete: Historical data saved`);
        
        // Emit completion event
        window.dispatchEvent(new CustomEvent('historicalDataProgress', {
          detail: { found: 90, total: 90 }
        }));
      } else {
        console.error('Background fetch failed:', result.message);
      }
    } catch (error) {
      console.error('Background fetch error:', error);
    }
    
    if (onComplete) {
      onComplete();
    }
  }

  /**
   * Fetch usage data from Supabase database
   */
  async fetchUsageFromDatabase(userId: string, days: number): Promise<UsageReport> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      console.log(`📊 Fetching ${days} days of data from database (${startDate} to ${endDate})`);
      
      const report = await this.databaseService.fetchUsageData(userId, startDate, endDate);
      
      console.log(`✓ Fetched ${Object.keys(report).length} days from database`);
      return report;
    } catch (error) {
      console.error('Error fetching from database:', error);
      throw error;
    }
  }

  /**
   * Sync data from OpenAI API to database
   */
  async syncDataToDatabase(userId: string, days: number = 7): Promise<void> {
    try {
      console.log(`🔄 Syncing ${days} days of OpenAI data to database for user ${userId}`);

      // Check if user already has recent data
      const hasRecentData = await this.databaseService.hasDataForRange(
        userId,
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
        new Date().toISOString().split('T')[0]
      );

      if (hasRecentData) {
        console.log('📂 Recent data found in database, skipping full sync');
        // Only sync the last 2 days to catch any updates
        days = 2;
      }

      // Fetch fresh data from OpenAI API
      const report = await this.fetchUsageForDays(days);

      // Store each day's data in the database
      for (const [date, dayData] of Object.entries(report)) {
        if ('error' in dayData) {
          console.warn(`⚠️ Skipping ${date} due to error: ${dayData.error}`);
          continue;
        }

        await this.databaseService.storeUsageData(userId, date, dayData);
      }

      console.log(`✅ Successfully synced ${Object.keys(report).length} days to database`);
    } catch (error) {
      console.error('Error syncing data to database:', error);
      throw error;
    }
  }

  /**
   * Get aggregated metrics from database
   */
  async getAggregatedMetrics(userId: string, days: number) {
    try {
      return await this.databaseService.fetchAggregatedData(userId, days);
    } catch (error) {
      console.error('Error fetching aggregated metrics:', error);
      throw error;
    }
  }

  private getCacheKey(days: number): string {
    const today = new Date().toISOString().split('T')[0];
    return `openai_usage_${days}days_${today}`;
  }

  private saveToCache(data: UsageReport, days: number): void {
    try {
      const cacheKey = this.getCacheKey(days);
      const cacheData = {
        data,
        timestamp: new Date().toISOString(),
        days,
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`💾 Saved ${Object.keys(data).length} days to cache: ${cacheKey}`);
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }

  private loadFromCache(days: number): UsageReport | null {
    try {
      const cacheKey = this.getCacheKey(days);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const cacheTime = new Date(timestamp);
        const now = new Date();
        const hoursSinceCached = (now.getTime() - cacheTime.getTime()) / (1000 * 60 * 60);
        
        // Use cache if it's less than 6 hours old
        if (hoursSinceCached < 6) {
          console.log(`📂 Loading from cache (${hoursSinceCached.toFixed(1)}h old): ${Object.keys(data).length} days`);
          return data;
        } else {
          console.log(`🕒 Cache expired (${hoursSinceCached.toFixed(1)}h old), will refetch`);
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('Failed to load from cache:', error);
    }
    return null;
  }

  private saveAsJsonFile(data: UsageReport, days: number): void {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filename = `openai_usage_${days}days_${today}.json`;
      
      const exportData = {
        exportDate: new Date().toISOString(),
        period: `${days} days`,
        totalDays: Object.keys(data).length,
        data,
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary download link
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`📁 Downloaded usage data as: ${filename}`);
    } catch (error) {
      console.error('Failed to save JSON file:', error);
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchUsageForDays(days: number): Promise<UsageReport> {
    // Check cache first
    const cachedData = this.loadFromCache(days);
    if (cachedData) {
      return cachedData;
    }

    const today = new Date();
    console.log(`🔄 Fetching ${days} days of data from API using date range. Today is: ${today.toISOString().split('T')[0]}`);

    // OpenAI usage API typically has a 1-2 day delay, so start from 2 days ago
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 2);
    const endDateString = endDate.toISOString().split('T')[0];

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (days - 1));
    const startDateString = startDate.toISOString().split('T')[0];

    console.log(`📅 Fetching date range: ${startDateString} to ${endDateString}`);

    try {
      // Single API call for the entire date range!
      const raw = await this.fetchUsageForDateRange(startDateString, endDateString);
      
      if (raw.data && raw.data.length > 0) {
        console.log(`✓ Successfully fetched ${raw.data.length} entries for ${days} days`);
        
        // Group the data by date
        const report = this.groupByDate(raw);
        
        console.log(`📊 Processed data for ${Object.keys(report).length} days`);
        
        // Save to cache
        this.saveToCache(report, days);
        
        return report;
      } else {
        console.log(`○ No usage data found for the requested period`);
        return {};
      }
    } catch (error) {
      console.error(`✗ Error fetching usage data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback to single-date method if range method fails
      console.log(`🔄 Falling back to single-date method...`);
      return this.fetchUsageForDaysLegacy(days);
    }
  }

  private async fetchUsageForDaysLegacy(days: number): Promise<UsageReport> {
    const today = new Date();
    const report: UsageReport = {};

    console.log(`🔄 Using legacy single-date method for ${days} days`);

    // OpenAI usage API typically has a 1-2 day delay, so start from 2 days ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 2);

    // Generate all dates
    const dates = [];
    for (let daysBack = days - 1; daysBack >= 0; daysBack--) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() - daysBack);
      dates.push(date.toISOString().split('T')[0]);
    }

    console.log(`Will fetch data for dates: ${dates[0]} to ${dates[dates.length - 1]}`);

    // Process one date at a time with delays
    for (let i = 0; i < dates.length; i++) {
      const dateString = dates[i];
      console.log(`Processing ${i + 1}/${dates.length}: ${dateString}`);

      try {
        const raw = await this.fetchUsageForDate(dateString);
        if (raw.data && raw.data.length > 0) {
          report[dateString] = this.summariseByModel(raw);
          console.log(`✓ ${dateString}: ${raw.data.length} entries`);
        } else {
          console.log(`○ ${dateString}: no data`);
        }
      } catch (error) {
        console.error(`✗ ${dateString}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Wait between requests (except for last request)
      if (i < dates.length - 1) {
        console.log(`Waiting 2 seconds before next request...`);
        await this.sleep(2000);
      }
    }

    console.log(`Final report contains ${Object.keys(report).length} days of data`);
    
    // Save to cache
    if (Object.keys(report).length > 0) {
      this.saveToCache(report, days);
    }
    
    return report;
  }

  // Method to test API connection
  async testConnection(): Promise<boolean> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split('T')[0];
      
      await this.fetchUsageForDate(dateString);
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}