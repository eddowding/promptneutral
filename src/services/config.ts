interface DatabaseConfig {
  openai_api_key: string;
  user_id: string;
  created_at: string;
}

export class ConfigService {
  private static instance: ConfigService;
  private config: DatabaseConfig | null = null;

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  async getApiKey(): Promise<string> {
    if (!this.config) {
      await this.loadConfig();
    }
    
    if (!this.config?.openai_api_key) {
      throw new Error('OpenAI API key not found in configuration');
    }
    
    return this.config.openai_api_key;
  }

  private async loadConfig(): Promise<void> {
    try {
      // In a real app, this would be an actual database call
      // For now, simulating a database response with localStorage fallback
      const response = await this.fetchFromDatabase();
      this.config = response;
    } catch (error) {
      console.error('Failed to load config from database:', error);
      throw new Error('Unable to load API configuration');
    }
  }

  private async fetchFromDatabase(): Promise<DatabaseConfig> {
    // Simulate database fetch with a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try to get from localStorage first (simulating a local cache)
    const cachedConfig = localStorage.getItem('openai_config');
    if (cachedConfig) {
      return JSON.parse(cachedConfig);
    }
    
    // Simulate fetching from database
    // In production, this would be something like:
    // const response = await fetch('/api/config/openai');
    // return response.json();
    
    // For now, check environment variables or prompt user
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || 
                   process.env.OPENAI_API_KEY ||
                   this.promptForApiKey();
    
    if (!apiKey) {
      throw new Error('No API key available');
    }
    
    const config: DatabaseConfig = {
      openai_api_key: apiKey,
      user_id: 'demo_user',
      created_at: new Date().toISOString(),
    };
    
    // Cache it locally
    localStorage.setItem('openai_config', JSON.stringify(config));
    
    return config;
  }
  
  private promptForApiKey(): string | null {
    const key = prompt('Please enter your OpenAI API key (this will be stored locally):');
    return key;
  }
  
  async updateApiKey(newKey: string): Promise<void> {
    const config: DatabaseConfig = {
      openai_api_key: newKey,
      user_id: 'demo_user',
      created_at: new Date().toISOString(),
    };
    
    // Update localStorage (simulating database update)
    localStorage.setItem('openai_config', JSON.stringify(config));
    this.config = config;
  }
}