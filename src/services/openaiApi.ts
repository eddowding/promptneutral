import { UsageReport } from '../types/usage';
import { ConfigService } from './config';

export class OpenAIApiService {
  private static instance: OpenAIApiService;
  private configService: ConfigService;

  private constructor() {
    this.configService = ConfigService.getInstance();
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

  private summariseByModel(raw: any): Record<string, any> {
    const agg: Record<string, { requests: number; context_tokens: number; generated_tokens: number }> = {};
    
    for (const entry of raw.data || []) {
      const model = entry.snapshot_id || 'unknown';
      if (!agg[model]) {
        agg[model] = { requests: 0, context_tokens: 0, generated_tokens: 0 };
      }
      agg[model].requests += entry.n_requests || 0;
      agg[model].context_tokens += entry.n_context_tokens_total || 0;
      agg[model].generated_tokens += entry.n_generated_tokens_total || 0;
    }
    
    return agg;
  }

  async fetchLast7DaysUsage(): Promise<UsageReport> {
    return this.fetchUsageForDays(7);
  }

  async fetchLast30DaysUsage(): Promise<UsageReport> {
    return this.fetchUsageForDays(30);
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
      
      // Also save as downloadable JSON file
      this.saveAsJsonFile(data, days);
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
    const report: UsageReport = {};

    console.log(`🔄 Fetching ${days} days of data from API. Today is: ${today.toISOString().split('T')[0]}`);

    // OpenAI usage API typically has a 1-2 day delay, so start from 2 days ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 2); // Start from 2 days ago

    // Generate all dates first
    const dates = [];
    for (let daysBack = days - 1; daysBack >= 0; daysBack--) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() - daysBack);
      dates.push(date.toISOString().split('T')[0]);
    }

    console.log(`Will fetch data for dates: ${dates[0]} to ${dates[dates.length - 1]}`);

    // Fetch data with rate limiting (batch of 5 requests per second)
    const batchSize = 5;
    for (let i = 0; i < dates.length; i += batchSize) {
      const batch = dates.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dates.length / batchSize)}: ${batch[0]} to ${batch[batch.length - 1]}`);

      // Process batch in parallel
      const batchPromises = batch.map(async (dateString) => {
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
          // Don't add errors to report for now, just skip
        }
      });

      await Promise.all(batchPromises);

      // Wait between batches to avoid rate limiting
      if (i + batchSize < dates.length) {
        console.log('Waiting 1 second before next batch...');
        await this.sleep(1000);
      }
    }

    console.log(`Final report contains ${Object.keys(report).length} days of data`);
    
    // Save to cache and download JSON file
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