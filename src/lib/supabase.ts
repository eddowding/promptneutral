import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          company?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          company?: string
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