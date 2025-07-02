// API validation service for different AI providers
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  details?: any;
}

export class ApiValidationService {
  // Validate OpenAI API key
  static async validateOpenAI(apiKey: string): Promise<ValidationResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          isValid: true,
          details: {
            modelCount: data.data?.length || 0,
            hasGPT4: data.data?.some((model: any) => model.id.includes('gpt-4')) || false,
          },
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          isValid: false,
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Validate Anthropic API key
  static async validateAnthropic(apiKey: string): Promise<ValidationResult> {
    try {
      // Anthropic doesn't have a direct models endpoint, so we'll try a simple completion
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Hello',
            },
          ],
        }),
      });

      if (response.ok) {
        return {
          isValid: true,
          details: {
            hasAccess: true,
          },
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          isValid: false,
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Validate Google AI API key
  static async validateGoogle(apiKey: string): Promise<ValidationResult> {
    try {
      // Test with a simple model list request
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          isValid: true,
          details: {
            modelCount: data.models?.length || 0,
            hasGemini: data.models?.some((model: any) => model.name.includes('gemini')) || false,
          },
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          isValid: false,
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Validate API key based on service type
  static async validateApiKey(service: string, apiKey: string): Promise<ValidationResult> {
    if (!apiKey || apiKey.trim().length === 0) {
      return {
        isValid: false,
        error: 'API key is required',
      };
    }

    switch (service.toLowerCase()) {
      case 'openai':
        return this.validateOpenAI(apiKey);
      case 'anthropic':
        return this.validateAnthropic(apiKey);
      case 'google':
        return this.validateGoogle(apiKey);
      default:
        return {
          isValid: false,
          error: `Unsupported service: ${service}`,
        };
    }
  }

  // Batch validate multiple API keys
  static async validateMultiple(
    services: Record<string, { apiKey: string }>
  ): Promise<Record<string, ValidationResult>> {
    const results: Record<string, ValidationResult> = {};
    
    // Validate in parallel but with some delay to avoid rate limiting
    const promises = Object.entries(services).map(async ([service, config], index) => {
      // Add a small delay between requests to be respectful to APIs
      await new Promise(resolve => setTimeout(resolve, index * 500));
      
      try {
        results[service] = await this.validateApiKey(service, config.apiKey);
      } catch (error) {
        results[service] = {
          isValid: false,
          error: error instanceof Error ? error.message : 'Validation failed',
        };
      }
    });

    await Promise.all(promises);
    return results;
  }

  // Get validation suggestions based on error
  static getValidationSuggestion(service: string, error: string): string {
    const lowerError = error.toLowerCase();
    
    if (lowerError.includes('unauthorized') || lowerError.includes('401')) {
      return 'Check that your API key is correct and has the necessary permissions.';
    }
    
    if (lowerError.includes('forbidden') || lowerError.includes('403')) {
      return 'Your API key may not have access to this service or feature.';
    }
    
    if (lowerError.includes('not found') || lowerError.includes('404')) {
      return 'The API endpoint may be incorrect or the service may be unavailable.';
    }
    
    if (lowerError.includes('rate limit') || lowerError.includes('429')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    if (lowerError.includes('network') || lowerError.includes('fetch')) {
      return 'Network error. Check your internet connection and try again.';
    }

    switch (service.toLowerCase()) {
      case 'openai':
        return 'Make sure you have a valid OpenAI API key from https://platform.openai.com/api-keys';
      case 'anthropic':
        return 'Make sure you have a valid Anthropic API key from https://console.anthropic.com/settings/keys';
      case 'google':
        return 'Make sure you have a valid Google AI API key from https://makersuite.google.com/app/apikey';
      default:
        return 'Please check your API key and try again.';
    }
  }
}