import { PostgrestError } from '@supabase/supabase-js';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  timestamp: Date;
}

export class ErrorHandler {
  /**
   * Handle Supabase database errors
   */
  static handleSupabaseError(error: PostgrestError | Error): AppError {
    if ('code' in error && 'message' in error) {
      // PostgrestError (Supabase database error)
      const postgrestError = error as PostgrestError;
      
      switch (postgrestError.code) {
        case 'PGRST116': // No rows found
          return {
            code: 'DATA_NOT_FOUND',
            message: 'No data found for the requested period',
            details: postgrestError.details,
            retryable: false,
            timestamp: new Date(),
          };
        
        case 'PGRST301': // JWT expired
          return {
            code: 'AUTH_EXPIRED',
            message: 'Authentication session expired. Please log in again.',
            details: postgrestError.details,
            retryable: false,
            timestamp: new Date(),
          };
        
        case '23505': // Unique constraint violation
          return {
            code: 'DUPLICATE_DATA',
            message: 'Data already exists for this period',
            details: postgrestError.details,
            retryable: false,
            timestamp: new Date(),
          };
        
        case '23503': // Foreign key constraint violation
          return {
            code: 'INVALID_REFERENCE',
            message: 'Invalid user reference',
            details: postgrestError.details,
            retryable: false,
            timestamp: new Date(),
          };
        
        default:
          return {
            code: 'DATABASE_ERROR',
            message: `Database error: ${postgrestError.message}`,
            details: postgrestError.details,
            retryable: true,
            timestamp: new Date(),
          };
      }
    }
    
    // Generic Error
    return {
      code: 'UNKNOWN_DATABASE_ERROR',
      message: error.message || 'An unknown database error occurred',
      retryable: true,
      timestamp: new Date(),
    };
  }

  /**
   * Handle OpenAI API errors
   */
  static handleOpenAIError(error: any): AppError {
    if (error.response) {
      // HTTP error response
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 401:
          return {
            code: 'OPENAI_AUTH_ERROR',
            message: 'Invalid OpenAI API key. Please check your API key configuration.',
            details: data,
            retryable: false,
            timestamp: new Date(),
          };
        
        case 403:
          return {
            code: 'OPENAI_PERMISSION_ERROR',
            message: 'Insufficient permissions or quota exceeded for OpenAI API.',
            details: data,
            retryable: false,
            timestamp: new Date(),
          };
        
        case 429:
          return {
            code: 'OPENAI_RATE_LIMIT',
            message: 'OpenAI API rate limit exceeded. Will retry automatically.',
            details: data,
            retryable: true,
            timestamp: new Date(),
          };
        
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            code: 'OPENAI_SERVER_ERROR',
            message: 'OpenAI API server error. Will retry automatically.',
            details: data,
            retryable: true,
            timestamp: new Date(),
          };
        
        default:
          return {
            code: 'OPENAI_API_ERROR',
            message: `OpenAI API error (${status}): ${data?.error?.message || 'Unknown error'}`,
            details: data,
            retryable: status >= 500,
            timestamp: new Date(),
          };
      }
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection error. Please check your internet connection.',
        retryable: true,
        timestamp: new Date(),
      };
    }
    
    return {
      code: 'OPENAI_UNKNOWN_ERROR',
      message: error.message || 'An unknown OpenAI API error occurred',
      retryable: true,
      timestamp: new Date(),
    };
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(field: string, value: any, rule: string): AppError {
    return {
      code: 'VALIDATION_ERROR',
      message: `Validation failed for ${field}: ${rule}`,
      details: { field, value, rule },
      retryable: false,
      timestamp: new Date(),
    };
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: AppError): string {
    switch (error.code) {
      case 'DATA_NOT_FOUND':
        return 'No usage data found for the selected time period. Try syncing your data or selecting a different date range.';
      
      case 'AUTH_EXPIRED':
        return 'Your session has expired. Please log in again to continue.';
      
      case 'OPENAI_AUTH_ERROR':
        return 'There\'s an issue with your OpenAI API key. Please check your settings and try again.';
      
      case 'OPENAI_RATE_LIMIT':
        return 'We\'re fetching data too quickly. Please wait a moment and try again.';
      
      case 'NETWORK_ERROR':
        return 'Unable to connect to our servers. Please check your internet connection and try again.';
      
      case 'DUPLICATE_DATA':
        return 'This data has already been imported. No action needed.';
      
      default:
        return error.message;
    }
  }

  /**
   * Determine if error should trigger a retry
   */
  static shouldRetry(error: AppError, currentAttempt: number, maxAttempts: number = 3): boolean {
    return error.retryable && currentAttempt < maxAttempts;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  static getRetryDelay(attempt: number, baseDelay: number = 1000): number {
    return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
  }
}

/**
 * Retry function with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: AppError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      // Convert to AppError if needed
      if (error instanceof Error) {
        lastError = {
          code: 'OPERATION_ERROR',
          message: error.message,
          retryable: true,
          timestamp: new Date(),
        };
      } else {
        lastError = error as AppError;
      }
      
      // Don't retry if error is not retryable or we've reached max attempts
      if (!ErrorHandler.shouldRetry(lastError, attempt, maxAttempts)) {
        throw lastError;
      }
      
      // Wait before retrying
      const delay = ErrorHandler.getRetryDelay(attempt - 1, baseDelay);
      console.log(`⏳ Retrying operation in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Validation utilities
 */
export class Validator {
  static isValidUserId(userId: string): boolean {
    return typeof userId === 'string' && userId.length > 0 && userId.length <= 255;
  }

  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
  }

  static isValidModel(model: string): boolean {
    const validModels = [
      'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 
      'dall-e-2', 'dall-e-3', 'whisper-1',
      'text-embedding-ada-002', 'text-embedding-3-small', 'text-embedding-3-large'
    ];
    return validModels.includes(model) || model.startsWith('gpt-') || model.startsWith('dall-e-');
  }

  static isValidUsageData(data: any): boolean {
    return (
      typeof data === 'object' &&
      typeof data.requests === 'number' && data.requests >= 0 &&
      typeof data.context_tokens === 'number' && data.context_tokens >= 0 &&
      typeof data.generated_tokens === 'number' && data.generated_tokens >= 0
    );
  }

  static validateSyncRequest(userId: string, days: number): void {
    if (!this.isValidUserId(userId)) {
      throw ErrorHandler.handleValidationError('userId', userId, 'must be a valid user ID');
    }
    
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      throw ErrorHandler.handleValidationError('days', days, 'must be an integer between 1 and 365');
    }
  }
}