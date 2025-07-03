import { settingsService } from '../lib/supabase';

interface DatabaseConfig {
  openai_admin_key: string;
  user_id: string;
  created_at: string;
}

// Admin emails for feedback system
export const ADMIN_EMAILS = [
  'admin@notzero.com',
  // Add admin emails here
];

export class ConfigService {
  private static instance: ConfigService;
  private config: DatabaseConfig | null = null;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  // Set the current user ID for API key retrieval
  setUserId(userId: string) {
    console.log('ConfigService: Setting user ID:', userId);
    this.userId = userId;
    this.config = null; // Reset config when user changes
  }

  async getApiKey(): Promise<string> {
    console.log('ConfigService: getApiKey called, userId:', this.userId);
    
    if (!this.config) {
      await this.loadConfig();
    }
    
    if (!this.config?.openai_admin_key) {
      throw new Error('OpenAI Admin API key not found. Please add your admin key in Settings.');
    }
    
    console.log('ConfigService: Returning admin API key successfully');
    return this.config.openai_admin_key;
  }

  private async loadConfig(): Promise<void> {
    try {
      const response = await this.fetchFromDatabase();
      this.config = response;
    } catch (error) {
      console.error('Failed to load config from database:', error);
      throw new Error('Unable to load API configuration');
    }
  }

  private async fetchFromDatabase(): Promise<DatabaseConfig> {
    // First try to get from Supabase if user is logged in
    if (this.userId) {
      try {
        console.log('ConfigService: Fetching admin API key for user:', this.userId);
        const apiKey = await settingsService.getDecryptedApiKey(this.userId, 'openai_admin');
        console.log('ConfigService: Retrieved admin API key:', apiKey ? 'Found' : 'Not found');
        if (apiKey) {
          return {
            openai_admin_key: apiKey,
            user_id: this.userId,
            created_at: new Date().toISOString(),
          };
        }
      } catch (error) {
        console.error('ConfigService: Failed to get admin API key from database:', error);
        console.log('ConfigService: Falling back to localStorage');
      }
    } else {
      console.log('ConfigService: No user ID available');
    }

    // Fallback to localStorage for demo mode
    const cachedConfig = localStorage.getItem('openai_admin_config');
    if (cachedConfig) {
      return JSON.parse(cachedConfig);
    }
    
    // Check environment variables
    const envApiKey = import.meta.env.VITE_OPENAI_ADMIN_API_KEY;
    if (envApiKey) {
      const config: DatabaseConfig = {
        openai_admin_key: envApiKey,
        user_id: this.userId || 'demo_user',
        created_at: new Date().toISOString(),
      };
      
      // Cache it locally
      localStorage.setItem('openai_admin_config', JSON.stringify(config));
      return config;
    }
    
    throw new Error('No OpenAI Admin API key found. Please add one in Settings.');
  }
  
  async updateApiKey(newKey: string): Promise<void> {
    const config: DatabaseConfig = {
      openai_admin_key: newKey,
      user_id: this.userId || 'demo_user',
      created_at: new Date().toISOString(),
    };
    
    // Update localStorage for demo mode
    localStorage.setItem('openai_admin_config', JSON.stringify(config));
    this.config = config;
  }

  // Clear cached config to force reload
  clearCache(): void {
    this.config = null;
  }
}