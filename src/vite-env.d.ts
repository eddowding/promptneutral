/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_OPENAI_ADMIN_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}