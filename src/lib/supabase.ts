import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Configuration status
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Create a Supabase client or null if not configured
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null

// Configuration check function
export const checkSupabaseConfig = (): {
  isConfigured: boolean
  status: 'configured' | 'missing_env' | 'invalid_url'
  missingVars: string[]
  errors: string[]
} => {
  const missingVars: string[] = []
  const errors: string[] = []

  if (!supabaseUrl) {
    missingVars.push('VITE_SUPABASE_URL')
  } else if (!isValidUrl(supabaseUrl)) {
    errors.push('VITE_SUPABASE_URL is not a valid URL')
  }

  if (!supabaseAnonKey) {
    missingVars.push('VITE_SUPABASE_ANON_KEY')
  }

  if (missingVars.length > 0) {
    return {
      isConfigured: false,
      status: 'missing_env',
      missingVars,
      errors
    }
  }

  if (errors.length > 0) {
    return {
      isConfigured: false,
      status: 'invalid_url',
      missingVars: [],
      errors
    }
  }

  return {
    isConfigured: true,
    status: 'configured',
    missingVars: [],
    errors: []
  }
}

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<{
  success: boolean
  error?: string
  details?: any
}> => {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase client not configured'
    }
  }

  try {
    // Test connection by trying to fetch from auth
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      return {
        success: false,
        error: error.message,
        details: error
      }
    }

    return {
      success: true,
      details: { hasSession: !!data.session }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }
  }
}

// Utility function to validate URL
const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'https:' && urlObj.hostname.includes('supabase')
  } catch {
    return false
  }
}

// Error wrapper for Supabase operations
export const withSupabaseErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string = 'Supabase operation'
): Promise<{ data: T | null; error: string | null }> => {
  if (!supabase) {
    return {
      data: null,
      error: 'Supabase is not configured. Please set up your environment variables.'
    }
  }

  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    console.error(`${context} failed:`, error)
    
    if (error instanceof Error) {
      return {
        data: null,
        error: error.message
      }
    }

    return {
      data: null,
      error: `${context} failed with unknown error`
    }
  }
}

// Get setup guidance
export const getSupabaseSetupGuidance = (): {
  message: string
  steps: string[]
  envExample: string
} => {
  const config = checkSupabaseConfig()
  
  let message = ''
  const steps: string[] = []

  if (!config.isConfigured) {
    message = 'Supabase is not configured. Follow these steps to set it up:'
    
    steps.push(
      '1. Create a Supabase project at https://supabase.com',
      '2. Go to Project Settings > API',
      '3. Copy your Project URL and anon/public key',
      '4. Create a .env file in your project root',
      '5. Add the environment variables shown below',
      '6. Restart your development server'
    )

    if (config.missingVars.length > 0) {
      steps.push(`Missing variables: ${config.missingVars.join(', ')}`)
    }

    if (config.errors.length > 0) {
      steps.push(`Configuration errors: ${config.errors.join(', ')}`)
    }
  } else {
    message = 'Supabase is configured and ready to use!'
  }

  return {
    message,
    steps,
    envExample: `VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`
  }
}

// Database types (will be auto-generated from Supabase later)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name?: string
          company?: string
          role?: string
          industry?: string
          team_size?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          company?: string
          role?: string
          industry?: string
          team_size?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          company?: string
          role?: string
          industry?: string
          team_size?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          demo_mode: boolean
          data_source: string
          timezone: string
          currency: string
          monthly_budget: number
          neutrality_target: string
          notifications: boolean
          carbon_reduction_goal: number
          reporting_frequency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          demo_mode?: boolean
          data_source?: string
          timezone?: string
          currency?: string
          monthly_budget?: number
          neutrality_target?: string
          notifications?: boolean
          carbon_reduction_goal?: number
          reporting_frequency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          demo_mode?: boolean
          data_source?: string
          timezone?: string
          currency?: string
          monthly_budget?: number
          neutrality_target?: string
          notifications?: boolean
          carbon_reduction_goal?: number
          reporting_frequency?: string
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          service: string
          encrypted_key: string
          enabled: boolean
          validated: boolean
          last_validated: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service: string
          encrypted_key: string
          enabled?: boolean
          validated?: boolean
          last_validated?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service?: string
          encrypted_key?: string
          enabled?: boolean
          validated?: boolean
          last_validated?: string
          created_at?: string
          updated_at?: string
        }
      }
      onboarding_progress: {
        Row: {
          id: string
          user_id: string
          current_step: number
          completed_steps: string[]
          onboarding_data: any
          is_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_step?: number
          completed_steps?: string[]
          onboarding_data?: any
          is_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_step?: number
          completed_steps?: string[]
          onboarding_data?: any
          is_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      selected_projects: {
        Row: {
          id: string
          user_id: string
          project_type: string
          project_id: string
          project_name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_type: string
          project_id: string
          project_name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_type?: string
          project_id?: string
          project_name?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      usage_data: {
        Row: {
          id: string
          user_id: string
          date: string
          model: string
          requests: number
          context_tokens: number
          generated_tokens: number
          cost: number
          co2_grams: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          model: string
          requests: number
          context_tokens: number
          generated_tokens: number
          cost: number
          co2_grams: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          model?: string
          requests?: number
          context_tokens?: number
          generated_tokens?: number
          cost?: number
          co2_grams?: number
          created_at?: string
        }
      }
      carbon_credits: {
        Row: {
          id: string
          user_id: string
          project_type: string
          amount_retired: number
          cost: number
          retirement_date: string
          certificate_url?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_type: string
          amount_retired: number
          cost: number
          retirement_date: string
          certificate_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_type?: string
          amount_retired?: number
          cost?: number
          retirement_date?: string
          certificate_url?: string
          created_at?: string
        }
      }
    }
  }
}

// Helper functions for onboarding operations
export const onboardingService = {
  // Save onboarding progress
  async saveProgress(userId: string, data: any) {
    const { error } = await supabase
      .from('onboarding_progress')
      .upsert({
        user_id: userId,
        current_step: data.progress.currentStep,
        completed_steps: data.progress.completedSteps,
        onboarding_data: data,
        is_complete: data.progress.isComplete,
        updated_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  },

  // Load onboarding progress
  async loadProgress(userId: string) {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Save user profile
  async saveProfile(userId: string, profile: any) {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: profile.fullName,
        company: profile.company,
        role: profile.role,
        industry: profile.industry,
        team_size: profile.teamSize,
        updated_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  },

  // Save user preferences
  async savePreferences(userId: string, preferences: any, goals: any) {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        demo_mode: preferences.demoMode,
        data_source: preferences.dataSource,
        timezone: preferences.timezone,
        currency: preferences.currency,
        monthly_budget: goals.monthlyBudget,
        neutrality_target: goals.neutralityTarget,
        notifications: goals.notifications,
        carbon_reduction_goal: goals.carbonReductionGoal,
        reporting_frequency: goals.reportingFrequency,
        updated_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  },

  // Save API keys (encrypted)
  async saveApiKey(userId: string, service: string, encryptedKey: string, validated: boolean = false) {
    const { error } = await supabase
      .from('api_keys')
      .upsert({
        user_id: userId,
        service,
        encrypted_key: encryptedKey,
        enabled: true,
        validated,
        last_validated: validated ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  },

  // Save selected project
  async saveSelectedProject(userId: string, project: any) {
    // First, deactivate all existing projects
    await supabase
      .from('selected_projects')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Then save the new project
    const { error } = await supabase
      .from('selected_projects')
      .insert({
        user_id: userId,
        project_type: project.type,
        project_id: project.projectId,
        project_name: project.name,
        is_active: true,
      });
    
    if (error) throw error;
  },

  // Complete onboarding
  async completeOnboarding(userId: string, data: any) {
    try {
      // Save all data in parallel
      await Promise.all([
        this.saveProfile(userId, data.profile),
        this.savePreferences(userId, data.preferences, data.goals),
        data.project.projectId ? this.saveSelectedProject(userId, data.project) : Promise.resolve(),
        this.saveProgress(userId, { ...data, progress: { ...data.progress, isComplete: true } }),
      ]);

      // Save API keys if provided
      for (const [service, config] of Object.entries(data.services)) {
        if (config && config.apiKey) {
          // In a real implementation, you would encrypt the API key before storing
          await this.saveApiKey(userId, service, config.apiKey, config.validated);
        }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  },
};

// Simple encryption helper (use a proper encryption library in production)
export const encryption = {
  // This is a placeholder - use proper encryption in production
  encrypt(text: string): string {
    return btoa(text); // Base64 encoding - NOT secure for production
  },

  decrypt(encrypted: string): string {
    return atob(encrypted); // Base64 decoding - NOT secure for production
  },
};